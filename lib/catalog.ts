export type ProductCategorySlug =
  | "ball-markers"
  | "divot-repair-tools"
  | "club-links"
  | "miscellaneous"
  | "bundles";

export type ProductCategory = {
  title: string;
  slug: ProductCategorySlug;
  shortDescription: string;
  shopifyCollectionHandle?: string;
  image?: ProductImage;
};

export type ShopifyCollectionPlacement = {
  id: string;
  title: string;
  handle: string;
  fallbackHandles?: string[];
  categorySlug?: ProductCategorySlug;
};

export type ProductMoney = {
  amount: string;
  currencyCode: string;
};

export type ProductImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type ProductSelectedOption = {
  name: string;
  value: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  selectedOptions: ProductSelectedOption[];
  price: ProductMoney;
  compareAtPrice?: ProductMoney | null;
  sku?: string | null;
  image?: ProductImage;
  availableForSale: boolean;
  quantityAvailable?: number | null;
  currentlyNotInStock: boolean;
};

export type ProductColorOption = {
  name: string;
  swatch?: string;
};

export type ProductSummary = {
  title: string;
  handle: string;
  categorySlug: ProductCategorySlug;
  categoryTitle?: string;
  shortDescription: string;
  descriptionHtml?: string;
  priceLabel: string;
  imagePlaceholderLabel: string;
  image?: ProductImage;
  ctaLabel: string;
  availableForSale?: boolean;
  variants?: ProductVariant[];
  colorOptions?: ProductColorOption[];
  shopifyProductHandle?: string;
  shopifyProductId?: string;
  collectionHandles?: string[];
  collectionTitles?: string[];
  tags?: string[];
  source?: "shopify";
};

// Shopify collections control where products appear on the website.
export const productCategories: ProductCategory[] = [
  {
    title: "Ball Markers",
    slug: "ball-markers",
    shortDescription: "Make your mark. Stand out on every green.",
    shopifyCollectionHandle: "ball-markers",
  },
  {
    title: "Divot Repair Tools",
    slug: "divot-repair-tools",
    shortDescription: "Precision tools for course perfection.",
    shopifyCollectionHandle: "divot-tools",
  },
  {
    title: "Club Links",
    slug: "club-links",
    shortDescription: "The perfect touch for your club.",
    shopifyCollectionHandle: "club-links",
  },
  {
    title: "Miscellaneous",
    slug: "miscellaneous",
    shortDescription: "Premium additions made to complement your gear.",
    shopifyCollectionHandle: "miscellaneous",
  },
  {
    title: "Bundles",
    slug: "bundles",
    shortDescription: "Curated sets. Better together.",
    shopifyCollectionHandle: "bundles",
  },
];

export const shopCategoryCollections: ShopifyCollectionPlacement[] = [
  {
    id: "ball-markers",
    title: "Ball Markers",
    handle: "ball-markers",
    categorySlug: "ball-markers",
  },
  {
    id: "divot-tools",
    title: "Divot Tools",
    handle: "divot-tools",
    fallbackHandles: ["divot-repair-tools"],
    categorySlug: "divot-repair-tools",
  },
  {
    id: "club-links",
    title: "Club Links",
    handle: "club-links",
    categorySlug: "club-links",
  },
  {
    id: "bundles",
    title: "Bundles",
    handle: "bundles",
    categorySlug: "bundles",
  },
];

export const homepageFeaturedCollections: ShopifyCollectionPlacement[] = [
  {
    id: "best-sellers",
    title: "Best Sellers",
    handle: "best-sellers",
  },
  {
    id: "offers",
    title: "20% Off",
    handle: "20-off",
    fallbackHandles: ["20-percent-off", "twenty-percent-off", "twenty-off"],
  },
  {
    id: "seasonal",
    title: "Seasonal",
    handle: "seasonal",
  },
];

export const homepageFeaturedCollection: ShopifyCollectionPlacement = {
  id: "homepage-featured",
  title: "Homepage Featured",
  handle: "homepage-featured",
};

// Shopify will later be the source of truth for products, variants, prices, and availability.
// These handles are kept ready to map to Shopify product handles when commerce is connected.
export const products: ProductSummary[] = [
  {
    title: "Custom Ball Marker",
    handle: "custom-ball-marker",
    categorySlug: "ball-markers",
    shortDescription: "Engraved detail for a personal finish on every green.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Ball marker image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Premium Divot Repair Tool",
    handle: "premium-divot-repair-tool",
    categorySlug: "divot-repair-tools",
    shortDescription: "A precision course essential with a refined feel.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Divot tool image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Club Link Tag",
    handle: "club-link-tag",
    categorySlug: "club-links",
    shortDescription: "A clean custom tag made to identify your club.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Club link image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Signature Bundle",
    handle: "signature-bundle",
    categorySlug: "bundles",
    shortDescription: "Coordinated golf accessories presented as one giftable set.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Bundle image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Groomsmen Gift Set",
    handle: "groomsmen-gift-set",
    categorySlug: "bundles",
    shortDescription: "Personalized pieces for the golfers in your wedding party.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Gift set image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Custom Event Marker",
    handle: "custom-event-marker",
    categorySlug: "ball-markers",
    shortDescription: "Event-ready markers for outings and memorable occasions.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Event marker image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Miscellaneous Golf Accessory",
    handle: "miscellaneous-golf-accessory",
    categorySlug: "miscellaneous",
    shortDescription: "A small premium addition made to complement your gear.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Accessory image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Bulk Order Starter Pack",
    handle: "bulk-order-starter-pack",
    categorySlug: "bundles",
    shortDescription: "A simple starting point for tournaments and group gifts.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Bulk order image",
    ctaLabel: "Inquiry Coming Soon",
  },
];

export function getProductCategory(slug: ProductCategorySlug): ProductCategory {
  const category = productCategories.find((item) => item.slug === slug);

  if (!category) {
    throw new Error(`Unknown product category: ${slug}`);
  }

  return category;
}

export function getProductCategoryTitle(product: ProductSummary): string | undefined {
  if (product.categoryTitle) {
    return product.categoryTitle;
  }

  if (product.source === "shopify") {
    return undefined;
  }

  return getProductCategory(product.categorySlug).title;
}

export function getAllProducts(): ProductSummary[] {
  return products;
}

export function getProductByHandle(handle: string): ProductSummary | undefined {
  return products.find((product) => product.handle === handle);
}

export function getProductsByCategory(categorySlug: ProductCategorySlug): ProductSummary[] {
  return products.filter((product) => product.categorySlug === categorySlug);
}
