import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteGolfSetup } from "../../../components/complete-golf-setup";
import { ProductAddToCartForm } from "../../../components/product-add-to-cart-form";
import {
  ProductCustomizationForm,
  type PersonalizationMethodOption,
} from "../../../components/product-customization-form";
import { ProductVariantProvider } from "../../../components/product-variant-context";
import {
  ProductImageGallery,
  ProductVariantPriceStatus,
} from "../../../components/product-variant-display";
import { ProductViewTracker } from "../../../components/product-view-tracker";
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

function getProductRoutingKeys(product: ProductSummary, categoryTitle?: string): string[] {
  return [
    product.categorySlug,
    categoryTitle,
    product.handle,
    product.title,
    ...(product.collectionHandles ?? []),
    ...(product.collectionTitles ?? []),
    ...(product.tags ?? []),
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());
}

function isClubLinkProduct(product: ProductSummary, categoryTitle?: string): boolean {
  const productKeys = getProductRoutingKeys(product, categoryTitle);

  return productKeys.some(
    (value) =>
      value === "club-links" ||
      value === "club links" ||
      value.includes("club link") ||
      value.includes("clublink"),
  );
}

function isBallMarkerProduct(product: ProductSummary, categoryTitle?: string): boolean {
  const productKeys = getProductRoutingKeys(product, categoryTitle);

  return productKeys.some(
    (value) =>
      value === "ball-markers" ||
      value === "ball markers" ||
      value.includes("ball marker"),
  );
}

function isDivotToolProduct(product: ProductSummary, categoryTitle?: string): boolean {
  return getProductRoutingKeys(product, categoryTitle).some((value) =>
    value.includes("divot"),
  );
}

function getBallMarkerCustomizationSides(product: ProductSummary): 1 | 2 {
  const tags = new Set(product.tags?.map((tag) => tag.trim().toLowerCase()));
  const isExplicitlyOneSided = tags.has("customization-one-sided");
  const isExplicitlyTwoSided = tags.has("customization-two-sided");

  return isExplicitlyTwoSided && !isExplicitlyOneSided ? 2 : 1;
}

function isBottleOpenerDivotTool(product: ProductSummary, categoryTitle?: string): boolean {
  return [
    "custom-divot-tool-flat",
    "premium-custom-divot-tool-with-bottle-opener",
    "premium-divot-repair-tool",
    "single-prong-divot-tool",
    "two-pronged-divot-tools",
    "two-prong-divot-tool",
  ].includes(product.handle) || isDivotToolProduct(product, categoryTitle);
}

function isTwoProngDivotTool(product: ProductSummary): boolean {
  const productKey = `${product.handle} ${product.title}`.toLowerCase();

  return productKey.includes("two-prong") || productKey.includes("two prong");
}

function isSingleProngDivotTool(product: ProductSummary): boolean {
  const productKey = `${product.handle} ${product.title}`.toLowerCase();

  return (
    !productKey.includes("bottle opener") &&
    !isTwoProngDivotTool(product) &&
    (product.handle === "custom-divot-tool-flat" ||
      product.handle === "single-prong-divot-tool" ||
      productKey.includes("single-pronged") ||
      productKey.includes("single-prong") ||
      productKey.includes("single prong"))
  );
}

function getProductIntroCopy(product: ProductSummary): string {
  if (isBottleOpenerDivotTool(product)) {
    return "A premium divot repair tool with a refined metal finish, personalized engraving options, and a built-in bottle opener for the course.";
  }

  return product.shortDescription;
}

function ProductInformation({ product }: { product: ProductSummary }) {
  return (
    <section className="product-information" aria-label={`${product.title} product information`}>
      <article className="product-description-card">
        <h2>Description</h2>
        {product.descriptionHtml ? (
          <div
            className="shopify-rich-text"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
        ) : (
          <div className="shopify-rich-text">
            <p>{product.shortDescription}</p>
          </div>
        )}
      </article>

      <div className="product-policy-card">
        <article className="product-policy-section">
          <span className="product-policy-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M4 11h25v23H4zM29 20h8l7 8v6H29z" />
              <circle cx="13" cy="37" r="5" />
              <circle cx="36" cy="37" r="5" />
              <path d="M29 28h15" />
            </svg>
          </span>
          <div>
            <h2>Shipping Information</h2>
            <p>Free shipping on orders over $75.</p>
            <p>
              Orders are typically processed within 1-2 business days and delivered within 3-7
              business days.
            </p>
            <p>Custom products are non-returnable unless there is a defect.</p>
          </div>
        </article>

        <article className="product-policy-section">
          <span className="product-policy-icon" aria-hidden="true">
            <svg viewBox="0 0 48 48">
              <path d="M37 17V7l7 7-7 7v-4a15 15 0 1 0 2 18" />
              <path d="M11 31v10l-7-7 7-7v4" />
              <circle cx="24" cy="24" r="5" />
            </svg>
          </span>
          <div>
            <h2>Returns &amp; Exchanges</h2>
            <p>
              We want you to love your purchase. If there is an issue with your order, contact us
              within 14 days of delivery and we&apos;ll make it right.
            </p>
            <p>Custom items are non-returnable unless there is a defect.</p>
          </div>
        </article>
      </div>
    </section>
  );
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
          <ProductImageGallery
            productTitle={product.title}
            placeholderLabel={product.imagePlaceholderLabel}
            images={product.images}
            galleryClassName="club-link-gallery product-detail-gallery"
            mainImageWrapperClassName="club-link-main-image"
            thumbnailsClassName="club-link-thumbnails"
            thumbnailClassName="club-link-thumbnail"
          />

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
              colorOptions={product.colorOptions}
            />
          </div>
        </article>
      </ProductVariantProvider>

      <ProductInformation product={product} />
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
    description: `${getProductIntroCopy(product)} Contact Signature Swings to inquire about this product.`,
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
  const usesDivotToolCustomizer = isBottleOpenerDivotTool(product, categoryTitle);
  const usesSingleProngDivotPreview = isSingleProngDivotTool(product);
  const usesTwoProngDivotPreview = isTwoProngDivotTool(product);

  return (
    <main className="product-detail-page">
      <ProductViewTracker product={product} />
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
              <ProductImageGallery
                productTitle={product.title}
                placeholderLabel={product.imagePlaceholderLabel}
                images={product.images}
              />

              <div className="product-detail-summary">
                {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
                <h1>{product.title}</h1>
                <p className="product-detail-description">{getProductIntroCopy(product)}</p>
                <ProductVariantPriceStatus
                  fallbackPriceLabel={getDisplayPriceLabel(product.priceLabel)}
                />
                {usesDivotToolCustomizer ? (
                  <ProductCustomizationForm
                    productLabel="Divot Tool"
                    fontStyles={clubLinkFontStyles}
                    divotToolPreviewEnabled
                    singleProngDivotToolPreviewEnabled={usesSingleProngDivotPreview}
                    twoProngDivotToolPreviewEnabled={usesTwoProngDivotPreview}
                    logoUploadEnabled={usesTwoProngDivotPreview}
                    colorOptions={product.colorOptions}
                  />
                ) : (
                  <ProductAddToCartForm />
                )}
              </div>
            </article>
          </ProductVariantProvider>

          <ProductInformation product={product} />
        </>
      )}

      <CompleteGolfSetup products={(bestSellerProducts ?? getAllProducts()).slice(0, 3)} />
    </main>
  );
}
