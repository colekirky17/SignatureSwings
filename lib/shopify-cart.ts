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
  cart: ShopifyCart | null;
  userErrors: CartUserError[];
};

export const CART_COOKIE_NAME = "signature_swings_cart";

export type CartLineAttribute = {
  key: string;
  value: string;
};

export type ShopifyCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
  lines: {
    nodes: Array<{
      id: string;
      quantity: number;
      attributes: CartLineAttribute[];
      cost: {
        totalAmount: { amount: string; currencyCode: string };
      };
      merchandise: {
        id: string;
        title: string;
        availableForSale: boolean;
        price: { amount: string; currencyCode: string };
        image: {
          url: string;
          altText: string | null;
          width: number | null;
          height: number | null;
        } | null;
        product: {
          title: string;
          handle: string;
        };
      };
    }>;
  };
};

export type AddCartLineResult =
  | {
      ok: true;
      cartId: string;
      totalQuantity: number;
      checkoutUrl: string;
    }
  | {
      ok: false;
      message: string;
      cartNotFound?: boolean;
    };

export type CartOperationResult =
  | { ok: true; cart: ShopifyCart }
  | { ok: false; message: string; cartNotFound?: boolean };

const CART_FIELDS = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 100) {
    nodes {
      id
      quantity
      attributes {
        key
        value
      }
      cost {
        totalAmount {
          amount
          currencyCode
        }
      }
      merchandise {
        ... on ProductVariant {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          image {
            url
            altText
            width
            height
          }
          product {
            title
            handle
          }
        }
      }
    }
  }
`;

const CART_QUERY = `
  query Cart($id: ID!) {
    cart(id: $id) {
      ${CART_FIELDS}
    }
  }
`;

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
        ${CART_FIELDS}
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
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_UPDATE_MUTATION = `
  mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ${CART_FIELDS}
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CART_LINES_REMOVE_MUTATION = `
  mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ${CART_FIELDS}
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

function mapCartPayload(payload: CartMutationPayload | undefined): CartOperationResult {
  if (payload?.cart && payload.userErrors.length === 0) {
    return { ok: true, cart: payload.cart };
  }

  const message = payload?.userErrors.length
    ? getUserErrorMessage(payload.userErrors)
    : "Shopify could not update the cart.";

  return {
    ok: false,
    message,
    cartNotFound: /cart.*(?:not found|does not exist)/i.test(message),
  };
}

export async function getCart(
  cartId: string,
  buyerIp?: string,
): Promise<ShopifyCart | null | undefined> {
  const data = await queryStorefront<{ cart: ShopifyCart | null }>(
    CART_QUERY,
    { id: cartId },
    buyerIp,
  );

  return data?.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
  buyerIp?: string,
): Promise<CartOperationResult> {
  const data = await queryStorefront<{ cartLinesUpdate: CartMutationPayload }>(
    CART_LINES_UPDATE_MUTATION,
    { cartId, lines: [{ id: lineId, quantity }] },
    buyerIp,
  );

  return mapCartPayload(data?.cartLinesUpdate);
}

export async function removeCartLine(
  cartId: string,
  lineId: string,
  buyerIp?: string,
): Promise<CartOperationResult> {
  const data = await queryStorefront<{ cartLinesRemove: CartMutationPayload }>(
    CART_LINES_REMOVE_MUTATION,
    { cartId, lineIds: [lineId] },
    buyerIp,
  );

  return mapCartPayload(data?.cartLinesRemove);
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
        checkoutUrl: payload.cart.checkoutUrl,
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
    checkoutUrl: payload.cart.checkoutUrl,
  };
}
