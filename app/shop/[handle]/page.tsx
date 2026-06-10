import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteGolfSetup } from "../../../components/complete-golf-setup";
import { ProductAddToCartForm } from "../../../components/product-add-to-cart-form";
import styles from "../../../components/catalog-product-media.module.css";
import {
  ProductCustomizationForm,
  type PersonalizationMethodOption,
} from "../../../components/product-customization-form";
import { ProductVariantProvider } from "../../../components/product-variant-context";
import {
  ProductVariantImage,
  ProductVariantPriceStatus,
} from "../../../components/product-variant-display";
import {
  getAllProducts,
  getProductByHandle,
  getProductCategoryTitle,
  type ProductSummary,
} from "../../../lib/catalog";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProducts,
  fetchShopifyProductsByCollectionHandle,
} from "../../../lib/shopify";

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>;
};

const clubLinkInfoPanels = [
  {
    title: "Description",
    icon: "i",
    copy:
      "Club Links are personalized golf club ID tags designed to add a clean custom detail to your grip. This placeholder section will later pull richer product copy from Shopify.",
  },
  {
    title: "Customization Details",
    icon: "c",
    copy:
      "Engraved with your name, phone number, initials, or logo. Made to fit securely on top of your golf grip.",
  },
  {
    title: "Shipping & Returns",
    icon: "s",
    copy:
      "Free shipping on orders over $75. Custom products are non-returnable unless there is a defect.",
  },
];

const ballMarkerInfoPanels = [
  {
    title: "Description",
    icon: "i",
    copy:
      "Custom ball markers are circular engraved golf accessories designed for logos, initials, event branding, and personal artwork. This placeholder section will later pull richer product copy from Shopify.",
  },
  {
    title: "Customization Details",
    icon: "c",
    copy:
      "Add a logo, initials, event mark, or short line of text. Artwork will be confirmed before production.",
  },
  {
    title: "Shipping & Returns",
    icon: "s",
    copy:
      "Free shipping on orders over $75. Custom products are non-returnable unless there is a defect.",
  },
];

const divotToolPersonalizationMethods: PersonalizationMethodOption[] = [
  {
    id: "initials",
    label: "Add Name or Message",
    summary: "Engrave a name, message, or short line of text.",
    reviewDesignEnabled: true,
  },
  {
    id: "design",
    label: "Let Us Design It",
    summary: "Describe what you want and our team will create the design.",
    reviewDesignEnabled: false,
  },
];

const ballMarkerPersonalizationMethods: PersonalizationMethodOption[] = [
  {
    id: "initials",
    label: "Text",
    summary: "Add short text, initials, a name, or an event mark.",
    reviewDesignEnabled: true,
  },
  {
    id: "logo",
    label: "Upload Logo",
    summary: "Use a logo or image file.",
    reviewDesignEnabled: true,
  },
  {
    id: "design",
    label: "Let Us Design It",
    summary: "Describe what you want and our team will create the design.",
    reviewDesignEnabled: true,
  },
];

const clubLinkFontStyles = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "script", label: "Script" },
  { id: "minimal", label: "Minimal" },
];

export const revalidate = 300;

async function getAvailableProduct(handle: string) {
  return (await fetchShopifyProductByHandle(handle)) ?? getProductByHandle(handle);
}

function getDisplayPriceLabel(priceLabel: string): string {
  const cleanPrice = priceLabel
    .replace(/\s*-\s*inquiry only\s*$/i, "")
    .replace(/\binquiry only\b/gi, "")
    .trim();

  if (!cleanPrice || /^pricing by inquiry$/i.test(cleanPrice)) {
    return "Price coming soon";
  }

  return cleanPrice;
}

function isClubLinkProduct(product: ProductSummary, categoryTitle?: string): boolean {
  const collectionKeys = [
    product.categorySlug,
    categoryTitle,
    ...(product.collectionHandles ?? []),
    ...(product.collectionTitles ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  return collectionKeys.some(
    (value) =>
      value === "club-links" ||
      value === "club links" ||
      value.includes("club link"),
  );
}

function isBallMarkerProduct(product: ProductSummary, categoryTitle?: string): boolean {
  const collectionKeys = [
    product.categorySlug,
    categoryTitle,
    ...(product.collectionHandles ?? []),
    ...(product.collectionTitles ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  return collectionKeys.some(
    (value) =>
      value === "ball-markers" ||
      value === "ball markers" ||
      value.includes("ball marker"),
  );
}

function getBallMarkerCustomizationSides(product: ProductSummary): 1 | 2 {
  const tags = new Set(product.tags?.map((tag) => tag.trim().toLowerCase()));
  const isExplicitlyOneSided = tags.has("customization-one-sided");
  const isExplicitlyTwoSided = tags.has("customization-two-sided");

  return isExplicitlyTwoSided && !isExplicitlyOneSided ? 2 : 1;
}

function isBottleOpenerDivotTool(product: ProductSummary): boolean {
  return [
    "premium-custom-divot-tool-with-bottle-opener",
    "premium-divot-repair-tool",
  ].includes(product.handle);
}

function ClubLinkProductDetail({
  product,
  categoryTitle,
  variant = "club-link",
}: {
  product: ProductSummary;
  categoryTitle?: string;
  variant?: "club-link" | "ball-marker";
}) {
  const priceLabel = getDisplayPriceLabel(product.priceLabel);
  const isBallMarker = variant === "ball-marker";
  const productTypeLabel = isBallMarker ? "Ball Markers" : "Club Links";
  const ballMarkerSides = isBallMarker
    ? getBallMarkerCustomizationSides(product)
    : undefined;
  const infoPanels = isBallMarker ? ballMarkerInfoPanels : clubLinkInfoPanels;
  const introCopy = isBallMarker
    ? "Custom engraved ball markers made for logos, initials, events, and personal artwork with a clean circular finish. Final options and availability will be confirmed by inquiry."
    : "Custom engraved Club Links made to personalize the top of your golf grip with a clean, durable finish. Final options and availability will be confirmed by inquiry.";

  return (
    <>
      <ProductVariantProvider
        variants={product.variants ?? []}
        fallbackImage={product.image}
      >
        <article className="club-link-detail">
          <div className="club-link-gallery" aria-label={`${product.title} images`}>
            <div className="club-link-main-image">
              <ProductVariantImage
                productTitle={product.title}
                placeholderLabel={product.imagePlaceholderLabel}
              />
            </div>
            <div className="club-link-thumbnails" aria-hidden="true">
              {[0, 1, 2].map((item) => (
                <div key={item} className="club-link-thumbnail">
                  <ProductVariantImage
                    productTitle={product.title}
                    placeholderLabel={product.imagePlaceholderLabel}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="club-link-summary">
            {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
            <h1>{product.title}</h1>
            <ProductVariantPriceStatus fallbackPriceLabel={priceLabel} />
            <p className="club-link-intro">{introCopy}</p>

            <ProductCustomizationForm
              productLabel={productTypeLabel}
              methods={isBallMarker ? ballMarkerPersonalizationMethods : undefined}
              fontStyles={isBallMarker ? undefined : clubLinkFontStyles}
              clubLinksPreviewEnabled={!isBallMarker}
              logoUploadEnabled
              ballMarkerSides={ballMarkerSides}
            />
          </div>
        </article>
      </ProductVariantProvider>

      <section className="club-link-info-panels" aria-label={`${productTypeLabel} product information`}>
        {infoPanels.map((panel) => (
          <article key={panel.title} className="club-link-info-panel">
            <div className="club-link-info-heading">
              <span className={`club-link-info-icon is-${panel.icon}`} aria-hidden="true">
                {panel.icon}
              </span>
              <h2>{panel.title}</h2>
            </div>
            <p>{panel.copy}</p>
          </article>
        ))}
      </section>
    </>
  );
}

export async function generateStaticParams() {
  const shopifyProducts = await fetchShopifyProducts();
  const products = shopifyProducts?.length ? shopifyProducts : getAllProducts();

  return products.map((product) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getAvailableProduct(handle);

  if (!product) {
    return {};
  }

  return {
    title: product.title,
    description: `${product.shortDescription} Contact Signature Swings to inquire about this product.`,
    // Keep individual products out of search until the catalog content is launch-ready.
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  const [product, bestSellerProducts] = await Promise.all([
    getAvailableProduct(handle),
    fetchShopifyProductsByCollectionHandle("best-sellers"),
  ]);

  if (!product) {
    notFound();
  }

  const categoryTitle = getProductCategoryTitle(product);
  const usesDivotToolCustomizer = isBottleOpenerDivotTool(product);

  return (
    <main className="product-detail-page">
      <Link href="/shop" className="product-detail-back-link">
        Back To Shop
      </Link>

      {isClubLinkProduct(product, categoryTitle) || isBallMarkerProduct(product, categoryTitle) ? (
        <ClubLinkProductDetail
          product={product}
          categoryTitle={categoryTitle}
          variant={isBallMarkerProduct(product, categoryTitle) ? "ball-marker" : "club-link"}
        />
      ) : (
        <>
          <ProductVariantProvider
            variants={product.variants ?? []}
            fallbackImage={product.image}
          >
            <article className="product-detail">
              <div className="product-detail-media">
                <ProductVariantImage
                  productTitle={product.title}
                  placeholderLabel={product.imagePlaceholderLabel}
                />
              </div>

              <div className="product-detail-summary">
                {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
                <h1>{product.title}</h1>
                <p className={styles.handle}>/{product.handle}</p>
                <p className="product-detail-description">{product.shortDescription}</p>
                <ProductVariantPriceStatus
                  fallbackPriceLabel={getDisplayPriceLabel(product.priceLabel)}
                />
                {usesDivotToolCustomizer ? (
                  <ProductCustomizationForm
                    productLabel="Divot Tool"
                    methods={divotToolPersonalizationMethods}
                    customerDetailsRequired={false}
                    methodDescription="Choose either simple engraved text or describe what you want and let our team create the design."
                    textHeading="Add Name or Message"
                    textLabel="Name or Message"
                    textPlaceholder="e.g., Four Amigos or Happy Birthday, Dad"
                    textAttributeKey="Name or Message"
                    showFontStyles={false}
                    designPlaceholder="Describe the name, message, theme, occasion, or style you want us to create for this divot tool."
                  />
                ) : (
                  <ProductAddToCartForm />
                )}
              </div>
            </article>
          </ProductVariantProvider>

          <section className="product-detail-panels" aria-label="Future product information">
            <article className="product-detail-panel">
              <h2>Customization Options</h2>
              <p>
                {usesDivotToolCustomizer
                  ? "Personalize this divot tool with a name or short message, or describe your idea and let our team prepare a design for you."
                  : "Customization details are being prepared. Future inquiries can cover artwork, personalization, gifting, and bulk order ideas for this product."}
              </p>
            </article>
            <article className="product-detail-panel">
              <h2>Product Information</h2>
              <p>
                Pricing and available product imagery shown here come from the current catalog
                when provided. Contact us for current customization and fulfillment details.
              </p>
            </article>
          </section>
        </>
      )}

      <CompleteGolfSetup products={(bestSellerProducts ?? []).slice(0, 4)} />
    </main>
  );
}
