import "server-only";

import {
  productCategories,
  type ProductCategorySlug,
  type ProductSummary,
} from "./catalog";

export type ShopifyCollectionSummary = {
  title: string;
  handle: string;
};

type StorefrontConfiguration = {
  endpoint: string;
  privateToken: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType: string;
  featuredImage: {
    url: string;
    altText: string | null;
    width: number | null;
    height: number | null;
  } | null;
  priceRange: {
    minVariantPrice: ShopifyMoney;
    maxVariantPrice: ShopifyMoney;
  };
  collections: {
    nodes: ShopifyCollectionSummary[];
  };
};

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  productType
  featuredImage {
    url
    altText
    width
    height
  }
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
    maxVariantPrice {
      amount
      currencyCode
    }
  }
  collections(first: 1) {
    nodes {
      title
      handle
    }
  }
`;

const PRODUCTS_QUERY = `
  query Products {
    products(first: 100, sortKey: TITLE) {
      nodes {
        ${PRODUCT_FIELDS}
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${PRODUCT_FIELDS}
    }
  }
`;

const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 100, sortKey: TITLE) {
      nodes {
        title
        handle
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

  const storeDomain = domain
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "");

  if (!/^[a-z0-9.-]+$/i.test(storeDomain) || !/^(?:\d{4}-\d{2}|latest|unstable)$/.test(apiVersion)) {
    return null;
  }

  return {
    endpoint: `https://${storeDomain}/api/${apiVersion}/graphql.json`,
    privateToken,
  };
}

async function queryStorefront<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  const configuration = getStorefrontConfiguration();

  if (!configuration) {
    return null;
  }

  try {
    const response = await fetch(configuration.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": configuration.privateToken,
      },
      body: JSON.stringify({ query, variables }),
      next: {
        revalidate: 300,
        tags: ["shopify-catalog"],
      },
    });
    const result = (await response.json()) as GraphqlResponse<T>;

    if (!response.ok || result.errors?.length || !result.data) {
      console.error("Shopify Storefront catalog request failed.");
      return null;
    }

    return result.data;
  } catch {
    console.error("Shopify Storefront catalog request failed.");
    return null;
  }
}

function getCategorySlug(collectionHandle: string | undefined): ProductCategorySlug {
  return (
    productCategories.find(
      (category) =>
        category.slug === collectionHandle ||
        category.shopifyCollectionHandle === collectionHandle,
    )?.slug ?? "miscellaneous"
  );
}

function formatMoney(money: ShopifyMoney): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

function getPriceLabel(product: ShopifyProductNode): string {
  const { minVariantPrice, maxVariantPrice } = product.priceRange;
  const minimumPrice = formatMoney(minVariantPrice);

  if (
    minVariantPrice.amount !== maxVariantPrice.amount ||
    minVariantPrice.currencyCode !== maxVariantPrice.currencyCode
  ) {
    return `From ${minimumPrice} - inquiry only`;
  }

  return `${minimumPrice} - inquiry only`;
}

function mapProduct(product: ShopifyProductNode): ProductSummary {
  const collection = product.collections.nodes[0];

  return {
    title: product.title,
    handle: product.handle,
    categorySlug: getCategorySlug(collection?.handle),
    categoryTitle: collection?.title || product.productType || undefined,
    shortDescription:
      product.description.trim() ||
      "Contact us to discuss customization and availability for this product.",
    priceLabel: getPriceLabel(product),
    imagePlaceholderLabel: `${product.title} image`,
    image: product.featuredImage ?? undefined,
    ctaLabel: "Product Inquiry",
    shopifyProductHandle: product.handle,
    shopifyProductId: product.id,
    source: "shopify",
  };
}

export async function fetchShopifyProducts(): Promise<ProductSummary[] | null> {
  const data = await queryStorefront<{ products: { nodes: ShopifyProductNode[] } }>(
    PRODUCTS_QUERY,
  );

  return data ? data.products.nodes.map(mapProduct) : null;
}

export async function fetchShopifyProductByHandle(
  handle: string,
): Promise<ProductSummary | null> {
  const data = await queryStorefront<{ product: ShopifyProductNode | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );

  return data?.product ? mapProduct(data.product) : null;
}

export async function fetchShopifyCollections(): Promise<ShopifyCollectionSummary[] | null> {
  const data = await queryStorefront<{ collections: { nodes: ShopifyCollectionSummary[] } }>(
    COLLECTIONS_QUERY,
  );

  return data?.collections.nodes ?? null;
}
