import "server-only";

type StorefrontConfiguration = {
  endpoint: string;
  privateToken: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type CartUserError = {
  field?: string[] | null;
  message: string;
};

type CartMutationPayload = {
  cart: {
    id: string;
    totalQuantity: number;
  } | null;
  userErrors: CartUserError[];
};

export type CartLineAttribute = {
  key: string;
  value: string;
};

export type AddCartLineResult =
  | {
      ok: true;
      cartId: string;
      totalQuantity: number;
    }
  | {
      ok: false;
      message: string;
      cartNotFound?: boolean;
    };

const VARIANT_AVAILABILITY_QUERY = `
  query VariantAvailability($id: ID!) {
    node(id: $id) {
      ... on ProductVariant {
        id
        availableForSale
      }
    }
  }
`;

const CART_CREATE_MUTATION = `
  mutation CartCreate($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_ADD_MUTATION = `
  mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }
`;

function getStorefrontConfiguration(): StorefrontConfiguration | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  const privateToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN?.trim();
  const apiVersion = process.env.SHOPIFY_API_VERSION?.trim();

  if (!domain || !privateToken || !apiVersion) {
    return null;
  }

  const storeDomain = domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

  if (
    !/^[a-z0-9.-]+$/i.test(storeDomain) ||
    !/^(?:\d{4}-\d{2}|latest|unstable)$/.test(apiVersion)
  ) {
    return null;
  }

  return {
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
    privateToken,
  };
}

async function queryStorefront<T>(
  query: string,
  variables: Record<string, unknown>,
  buyerIp?: string,
): Promise<T | null> {
  const configuration = getStorefrontConfiguration();

  if (!configuration) {
    return null;
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Shopify-Storefront-Private-Token": configuration.privateToken,
  };

  if (buyerIp) {
    headers["Shopify-Storefront-Buyer-IP"] = buyerIp;
  }

  try {
    const response = await fetch(configuration.endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
      cache: "no-store",
    });
    const result = (await response.json()) as GraphqlResponse<T>;

    if (!response.ok || result.errors?.length || !result.data) {
      console.error("Shopify Storefront cart request failed.", result.errors);
      return null;
    }

    return result.data;
  } catch {
    console.error("Shopify Storefront cart request failed.");
    return null;
  }
}

function getUserErrorMessage(errors: CartUserError[]): string {
  return errors[0]?.message || "Shopify could not update the cart.";
}

export async function isVariantAvailable(
  variantId: string,
  buyerIp?: string,
): Promise<boolean | null> {
  const data = await queryStorefront<{
    node: { id: string; availableForSale: boolean } | null;
  }>(VARIANT_AVAILABILITY_QUERY, { id: variantId }, buyerIp);

  return data?.node?.availableForSale ?? null;
}

export async function addCartLine(
  cartId: string | undefined,
  variantId: string,
  attributes: CartLineAttribute[],
  buyerIp?: string,
): Promise<AddCartLineResult> {
  const lines = [
    {
      merchandiseId: variantId,
      quantity: 1,
      attributes,
    },
  ];

  if (cartId) {
    const data = await queryStorefront<{ cartLinesAdd: CartMutationPayload }>(
      CART_LINES_ADD_MUTATION,
      { cartId, lines },
      buyerIp,
    );
    const payload = data?.cartLinesAdd;

    if (payload?.cart && payload.userErrors.length === 0) {
      return {
        ok: true,
        cartId: payload.cart.id,
        totalQuantity: payload.cart.totalQuantity,
      };
    }

    if (payload?.userErrors.length) {
      const message = getUserErrorMessage(payload.userErrors);
      return {
        ok: false,
        message,
        cartNotFound: /cart.*(?:not found|does not exist)/i.test(message),
      };
    }

    return {
      ok: false,
      message: "Shopify could not update the cart.",
    };
  }

  const data = await queryStorefront<{ cartCreate: CartMutationPayload }>(
    CART_CREATE_MUTATION,
    { lines },
    buyerIp,
  );
  const payload = data?.cartCreate;

  if (!payload?.cart || payload.userErrors.length > 0) {
    return {
      ok: false,
      message: payload?.userErrors.length
        ? getUserErrorMessage(payload.userErrors)
        : "Shopify could not create the cart.",
    };
  }

  return {
    ok: true,
    cartId: payload.cart.id,
    totalQuantity: payload.cart.totalQuantity,
  };
}
