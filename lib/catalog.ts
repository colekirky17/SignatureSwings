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

// Development-only product samples for local UI work when Shopify is not configured.
// Production must never render these values.
const developmentProducts: ProductSummary[] = [
  {
    title: "Premium Custom Ball Markers",
    handle: "premium-bulk-golf-markers",
    categorySlug: "ball-markers",
    shortDescription: "Custom ball markers made for logos, initials, events, and bulk orders.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Premium custom ball markers image",
    ctaLabel: "Inquiry Coming Soon",
    tags: ["ball markers", "customization-two-sided"],
  },
  {
    title: 'ClubLinks "Wedge Set" (3-Pack)',
    handle: "custom-engraved-premium-clublinks-golf-club-id-tag",
    categorySlug: "club-links",
    shortDescription: "A three-pack of engraved ClubLinks for personalizing your wedge set.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "ClubLinks wedge set image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: 'ClubLinks "Whole Bag" (14-Pack)',
    handle: "clublinks-14-pack",
    categorySlug: "club-links",
    shortDescription: "A full-bag ClubLinks set for identifying and personalizing every club.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "ClubLinks whole bag image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Single-Pronged Divot Tool",
    handle: "custom-divot-tool-flat",
    categorySlug: "divot-repair-tools",
    shortDescription: "A slim course tool designed for quick repairs and clean personalization.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Single-pronged divot tool image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Single-Pronged Divot Tool w/ Bottle Opener",
    handle: "premium-custom-divot-tool-with-bottle-opener",
    categorySlug: "divot-repair-tools",
    shortDescription: "A personalized divot repair tool with a built-in bottle opener.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Bottle opener divot tool image",
    ctaLabel: "Inquiry Coming Soon",
  },
  {
    title: "Two-Pronged Divot Tool",
    handle: "two-pronged-divot-tools",
    categorySlug: "divot-repair-tools",
    shortDescription: "A classic two-prong repair tool made for personalized golf rounds and gifts.",
    priceLabel: "Pricing by inquiry",
    imagePlaceholderLabel: "Two-pronged divot tool image",
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
  return process.env.NODE_ENV === "production" ? [] : developmentProducts;
}

export function getProductByHandle(handle: string): ProductSummary | undefined {
  return getAllProducts().find((product) => product.handle === handle);
}

export function getProductsByCategory(categorySlug: ProductCategorySlug): ProductSummary[] {
  return getAllProducts().filter((product) => product.categorySlug === categorySlug);
}
