import "server-only";

import {
  shopCategoryCollections,
  productCategories,
  type ProductCategorySlug,
  type ProductColorOption,
  type ProductImage,
  type ProductMoney,
  type ProductVariant,
  type ShopifyCollectionPlacement,
  type ProductSummary,
} from "./catalog";

export type ShopifyCollectionSummary = {
  id?: string;
  title: string;
  handle: string;
};

export type ShopifyCollectionProductGroup = ShopifyCollectionSummary & {
  placementId?: string;
  products: ProductSummary[];
};

type StorefrontConfiguration = {
  endpoint: string;
  privateToken: string;
};

type GraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type ShopifyVariantNode = {
  id: string;
  title: string;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
  price: ProductMoney;
  compareAtPrice: ProductMoney | null;
  sku: string | null;
  image: ProductImage | null;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  currentlyNotInStock?: boolean;
};

type ShopifyMetaobjectNode = {
  __typename: "Metaobject";
  id: string;
  handle: string;
  type: string;
  fields: Array<{
    key: string;
    type: string;
    value: string | null;
  }>;
};

type ShopifyColorMetafield = {
  type: string;
  value: string;
  references: {
    nodes: ShopifyMetaobjectNode[];
  } | null;
};

type ShopifyProductNode = {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: ProductImage | null;
  priceRange: {
    minVariantPrice: ProductMoney;
    maxVariantPrice: ProductMoney;
  };
  variants: {
    nodes: ShopifyVariantNode[];
  };
  colorPattern?: ShopifyColorMetafield | null;
  collections: {
    nodes: ShopifyCollectionSummary[];
  };
};

type ShopifyCollectionNode = {
  id: string;
  title: string;
  handle: string;
  products: {
    nodes: ShopifyProductNode[];
  };
};

const PRODUCT_FIELDS = `
  id
  title
  handle
  description
  descriptionHtml
  productType
  tags
  availableForSale
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
  variants(first: 100) {
    nodes {
      id
      title
      selectedOptions {
        name
        value
      }
      price {
        amount
        currencyCode
      }
      compareAtPrice {
        amount
        currencyCode
      }
      sku
      image {
        url
        altText
        width
        height
      }
      availableForSale
      currentlyNotInStock
    }
  }
  collections(first: 10) {
    nodes {
      id
      title
      handle
    }
  }
`;

const COLOR_PATTERN_FIELDS = `
  colorPattern: metafield(namespace: "shopify", key: "color-pattern") {
    type
    value
    references(first: 20) {
      nodes {
        __typename
        ... on Metaobject {
          id
          handle
          type
          fields {
            key
            type
            value
          }
        }
      }
    }
  }
`;

const PRODUCT_FIELDS_WITH_COLOR = PRODUCT_FIELDS.replace(
  "  availableForSale",
  `  availableForSale\n${COLOR_PATTERN_FIELDS}`,
);
const PRODUCT_FIELDS_WITH_COLOR_AND_QUANTITY = PRODUCT_FIELDS_WITH_COLOR.replace(
  "      currentlyNotInStock",
  "      quantityAvailable\n      currentlyNotInStock",
);
const PRODUCT_FIELDS_WITH_QUANTITY = PRODUCT_FIELDS.replace(
  "      currentlyNotInStock",
  "      quantityAvailable\n      currentlyNotInStock",
);
const CORE_PRODUCT_FIELDS = PRODUCT_FIELDS.replace(
  "      currentlyNotInStock\n",
  "",
);

function buildProductsQuery(productFields: string): string {
  return `
  query Products {
    products(first: 100, sortKey: TITLE) {
      nodes {
        ${productFields}
      }
    }
  }
`;
}

function buildProductByHandleQuery(productFields: string): string {
  return `
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ${productFields}
    }
  }
`;
}

const COLLECTIONS_QUERY = `
  query Collections {
    collections(first: 100, sortKey: TITLE) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

function buildCollectionWithProductsQuery(productFields: string): string {
  return `
  query CollectionWithProducts($handle: String!) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: 100, sortKey: COLLECTION_DEFAULT) {
        nodes {
          ${productFields}
        }
      }
    }
  }
`;
}

function buildCollectionsWithProductsQuery(productFields: string): string {
  return `
  query CollectionsWithProducts {
    collections(first: 100, sortKey: TITLE) {
      nodes {
        id
        title
        handle
        products(first: 100, sortKey: TITLE) {
          nodes {
            ${productFields}
          }
        }
      }
    }
  }
`;
}

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

function normalizeCollectionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/%/g, " percent ")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectionMatchesPlacement(
  collection: ShopifyCollectionSummary,
  placement: ShopifyCollectionPlacement,
): boolean {
  const acceptedKeys = [
    placement.title,
    placement.handle,
    ...(placement.fallbackHandles ?? []),
  ].map(normalizeCollectionKey);

  return (
    acceptedKeys.includes(normalizeCollectionKey(collection.handle)) ||
    acceptedKeys.includes(normalizeCollectionKey(collection.title))
  );
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
      console.error(
        "Shopify Storefront catalog request failed.",
        result.errors?.map((error) => error.message),
      );
      return null;
    }

    return result.data;
  } catch {
    console.error("Shopify Storefront catalog request failed.");
    return null;
  }
}

async function queryCatalogWithInventoryFallback<T>(
  buildQuery: (productFields: string) => string,
  variables?: Record<string, unknown>,
): Promise<T | null> {
  if (!getStorefrontConfiguration()) {
    return null;
  }

  const fullResult = await queryStorefront<T>(
    buildQuery(PRODUCT_FIELDS_WITH_COLOR_AND_QUANTITY),
    variables,
  );

  if (fullResult) {
    return fullResult;
  }

  console.warn(
    "Retrying Shopify catalog request without protected quantityAvailable fields.",
  );
  const colorCompatibleResult = await queryStorefront<T>(
    buildQuery(PRODUCT_FIELDS_WITH_COLOR),
    variables,
  );

  if (colorCompatibleResult) {
    return colorCompatibleResult;
  }

  console.warn(
    "Retrying Shopify catalog request without taxonomy color metafields.",
  );
  const inventoryCompatibleResult = await queryStorefront<T>(
    buildQuery(PRODUCT_FIELDS_WITH_QUANTITY),
    variables,
  );

  if (inventoryCompatibleResult) {
    return inventoryCompatibleResult;
  }

  console.warn(
    "Retrying Shopify catalog request without protected quantityAvailable fields or taxonomy colors.",
  );
  const compatibleResult = await queryStorefront<T>(
    buildQuery(PRODUCT_FIELDS),
    variables,
  );

  if (compatibleResult) {
    return compatibleResult;
  }

  console.warn(
    "Retrying Shopify catalog request with core variant availability fields.",
  );
  return queryStorefront<T>(buildQuery(CORE_PRODUCT_FIELDS), variables);
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

function formatMoney(money: ProductMoney): string {
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

function mapVariant(variant: ShopifyVariantNode): ProductVariant {
  return {
    id: variant.id,
    title: variant.title,
    selectedOptions: variant.selectedOptions,
    price: variant.price,
    compareAtPrice: variant.compareAtPrice,
    sku: variant.sku,
    image: variant.image ?? undefined,
    availableForSale: variant.availableForSale,
    quantityAvailable: variant.quantityAvailable ?? null,
    currentlyNotInStock: variant.currentlyNotInStock ?? false,
  };
}

function getMetaobjectField(
  metaobject: ShopifyMetaobjectNode,
  keys: string[],
): string | undefined {
  const acceptedKeys = new Set(keys);
  return metaobject.fields
    .find((field) => acceptedKeys.has(field.key.toLowerCase()))
    ?.value?.trim();
}

function formatTaxonomyHandle(handle: string): string {
  return handle
    .replace(/^shopify--/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getProductColorOptions(product: ShopifyProductNode): ProductColorOption[] {
  const hasColorVariant = product.variants.nodes.some((variant) =>
    variant.selectedOptions.some(
      (option) =>
        option.name.trim().toLowerCase() === "color" &&
        option.value.trim().toLowerCase() !== "default title",
    ),
  );

  if (hasColorVariant) {
    return [];
  }

  const references = product.colorPattern?.references?.nodes ?? [];
  const options = references.map((metaobject) => {
    const name =
      getMetaobjectField(metaobject, ["label", "name", "display_name"]) ||
      formatTaxonomyHandle(metaobject.handle);
    const swatchValue = getMetaobjectField(metaobject, [
      "color",
      "hex",
      "hex_code",
    ]);

    return {
      name,
      swatch:
        swatchValue && /^#[0-9a-f]{3,8}$/i.test(swatchValue)
          ? swatchValue
          : undefined,
    };
  });

  return Array.from(
    new Map(
      options
        .filter((option) => option.name)
        .map((option) => [option.name.toLowerCase(), option]),
    ).values(),
  );
}

function getDisplayCollection(
  product: ShopifyProductNode,
  collectionContext?: ShopifyCollectionSummary,
): ShopifyCollectionSummary | undefined {
  if (collectionContext) {
    return collectionContext;
  }

  return (
    product.collections.nodes.find((collection) =>
      shopCategoryCollections.some((placement) =>
        collectionMatchesPlacement(collection, placement),
      ),
    ) ?? product.collections.nodes[0]
  );
}

function getShopifyShortDescription(product: ShopifyProductNode): string {
  const fallback = "Contact us to discuss customization and availability for this product.";
  const description = product.description.trim();

  if (!description) {
    return fallback;
  }

  const cleanDescription = description.replace(/\s+/g, " ");
  const introWithoutPolicy = cleanDescription
    .split(/\b(?:Return & Refund Policy|Shipping Information|Returns? & Exchanges)\b/i)[0]
    .trim();
  const introWithoutFeatures = introWithoutPolicy.split(/\bKey Features?:\b/i)[0].trim();
  const firstSentence = introWithoutFeatures.match(/^(.+?[.!?])(?:\s|$)/)?.[1];
  const shortDescription = (firstSentence ?? introWithoutFeatures).trim() || fallback;

  if (shortDescription.length <= 220) {
    return shortDescription;
  }

  const truncated = shortDescription.slice(0, 221);
  const lastSpace = truncated.lastIndexOf(" ");

  return `${truncated.slice(0, lastSpace > 160 ? lastSpace : 220).trim()}...`;
}

function mapProduct(
  product: ShopifyProductNode,
  collectionContext?: ShopifyCollectionSummary,
): ProductSummary {
  const collection = getDisplayCollection(product, collectionContext);

  return {
    title: product.title,
    handle: product.handle,
    categorySlug: getCategorySlug(collection?.handle),
    categoryTitle: collection?.title || product.productType || undefined,
    shortDescription: getShopifyShortDescription(product),
    descriptionHtml: product.descriptionHtml.trim() || undefined,
    priceLabel: getPriceLabel(product),
    imagePlaceholderLabel: `${product.title} image`,
    image: product.featuredImage ?? undefined,
    ctaLabel: "Product Inquiry",
    availableForSale: product.availableForSale,
    variants: product.variants.nodes.map(mapVariant),
    colorOptions: getProductColorOptions(product),
    shopifyProductHandle: product.handle,
    shopifyProductId: product.id,
    collectionHandles: product.collections.nodes.map((item) => item.handle),
    collectionTitles: product.collections.nodes.map((item) => item.title),
    tags: product.tags,
    source: "shopify",
  };
}

function mapCollectionGroup(
  collection: ShopifyCollectionNode,
  placement?: ShopifyCollectionPlacement,
): ShopifyCollectionProductGroup {
  return {
    id: collection.id,
    title: collection.title,
    handle: collection.handle,
    placementId: placement?.id,
    products: collection.products.nodes.map((product) => mapProduct(product, collection)),
  };
}

export async function fetchShopifyProducts(): Promise<ProductSummary[] | null> {
  const data = await queryCatalogWithInventoryFallback<{
    products: { nodes: ShopifyProductNode[] };
  }>(
    buildProductsQuery,
  );

  return data ? data.products.nodes.map((product) => mapProduct(product)) : null;
}

export async function fetchShopifyProductByHandle(
  handle: string,
): Promise<ProductSummary | null> {
  const data = await queryCatalogWithInventoryFallback<{
    product: ShopifyProductNode | null;
  }>(
    buildProductByHandleQuery,
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

export async function fetchShopifyProductsByCollectionHandle(
  handle: string,
): Promise<ProductSummary[] | null> {
  const data = await queryCatalogWithInventoryFallback<{
    collection: ShopifyCollectionNode | null;
  }>(
    buildCollectionWithProductsQuery,
    { handle },
  );

  const collection = data?.collection;

  return collection
    ? collection.products.nodes.map((product) => mapProduct(product, collection))
    : null;
}

export async function fetchShopifyProductsByCollectionTitle(
  title: string,
): Promise<ProductSummary[] | null> {
  const groups = await fetchShopifyCollectionProductGroups([
    {
      id: normalizeCollectionKey(title),
      title,
      handle: normalizeCollectionKey(title),
    },
  ]);

  return groups ? groups[0]?.products ?? [] : null;
}

export async function fetchShopifyCollectionProductGroups(
  placements: ShopifyCollectionPlacement[],
): Promise<ShopifyCollectionProductGroup[] | null> {
  const data = await queryCatalogWithInventoryFallback<{
    collections: { nodes: ShopifyCollectionNode[] };
  }>(buildCollectionsWithProductsQuery);

  if (!data) {
    return null;
  }

  // Shopify collections are the placement controls; adding a product to one of
  // these collections in Shopify Admin moves it into that website section.
  return placements.map((placement) => {
    const collection = data.collections.nodes.find((item) =>
      collectionMatchesPlacement(item, placement),
    );

    if (!collection) {
      return {
        title: placement.title,
        handle: placement.handle,
        placementId: placement.id,
        products: [],
      };
    }

    return mapCollectionGroup(collection, placement);
  });
}
