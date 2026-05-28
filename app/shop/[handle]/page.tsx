import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../components/catalog-product-media.module.css";
import { ProductCustomizationForm } from "../../../components/product-customization-form";
import {
  getAllProducts,
  getProductByHandle,
  getProductCategoryTitle,
  type ProductSummary,
} from "../../../lib/catalog";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProducts,
} from "../../../lib/shopify";

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>;
};

const ballMarkerFinishes = [
  { name: "Polished Silver", swatchClassName: "is-silver" },
  { name: "Brushed Black", swatchClassName: "is-black" },
  { name: "Copper", swatchClassName: "is-copper" },
  { name: "Champagne Gold", swatchClassName: "is-gold" },
];

const ballMarkerDesignStyles = ["Classic", "Logo", "Initials", "Event"];

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
  {
    title: "Reviews",
    icon: "r",
    copy: "See what golfers are saying about Signature Swings.",
    rating: "5.0 (24 reviews)",
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
  {
    title: "Reviews",
    icon: "r",
    copy: "See what golfers are saying about Signature Swings.",
    rating: "5.0 (24 reviews)",
  },
];

const setupUpsells = [
  {
    title: "Custom Divot Tool",
    copy: "Precision engraved tool to match your custom set.",
    price: "$29.99",
    cta: "Add To Cart",
    href: "/shop/premium-divot-repair-tool",
    imageLabel: "Divot tool",
  },
  {
    title: "Custom Ball Markers",
    copy: "Add matching markers to complete your set.",
    price: "$24.99",
    cta: "Add To Cart",
    href: "/shop/custom-ball-marker",
    imageLabel: "Ball markers",
  },
  {
    title: "Gift Set Bundle",
    copy: "Club Links, divot tool, and ball marker in a premium box.",
    price: "$129.99",
    cta: "View Bundle",
    href: "/shop/signature-bundle",
    imageLabel: "Gift bundle",
  },
  {
    title: "Need 10 Or More?",
    copy: "Get custom pricing for tournaments, events, or group gifts.",
    price: "",
    cta: "Request Bulk Order",
    href: "/contact",
    imageLabel: "Bulk order",
  },
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

function ProductImage({
  product,
  className,
}: {
  product: ProductSummary;
  className?: string;
}) {
  return product.image ? (
    <img
      className={className}
      src={product.image.url}
      alt={product.image.altText || product.title}
      width={product.image.width ?? undefined}
      height={product.image.height ?? undefined}
    />
  ) : (
    <span className="media-label">{product.imagePlaceholderLabel}</span>
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
  const finishes = ballMarkerFinishes;
  const designStyles = ballMarkerDesignStyles;
  const infoPanels = isBallMarker ? ballMarkerInfoPanels : clubLinkInfoPanels;
  const introCopy = isBallMarker
    ? "Custom engraved ball markers made for logos, initials, events, and personal artwork with a clean circular finish. Final options and availability will be confirmed by inquiry."
    : "Custom engraved Club Links made to personalize the top of your golf grip with a clean, durable finish. Final options and availability will be confirmed by inquiry.";
  const customizationFields = isBallMarker
    ? [
        { label: "Name", placeholder: "e.g., John Smith" },
        { label: "Phone Number", placeholder: "e.g., (800) 123-4561" },
        { label: "Initials / Short Text", placeholder: "e.g., JS" },
      ]
    : [
        { label: "Name", placeholder: "e.g., John Smith" },
        { label: "Phone Number", placeholder: "e.g., (800) 123-4561" },
        { label: "Initials / Short Text", placeholder: "e.g., JS" },
      ];

  return (
    <>
      <article className="club-link-detail">
        <div className="club-link-gallery" aria-label={`${product.title} images`}>
          <div className="club-link-main-image">
            <ProductImage product={product} className={styles.detailImage} />
          </div>
          <div className="club-link-thumbnails" aria-hidden="true">
            {[0, 1, 2].map((item) => (
              <div key={item} className="club-link-thumbnail">
                <ProductImage product={product} className={styles.detailImage} />
              </div>
            ))}
          </div>
        </div>

        <div className="club-link-summary">
          {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
          <h1>{product.title}</h1>
          <p className="club-link-price">{priceLabel}</p>
          <p className="club-link-intro">{introCopy}</p>
          <div className="club-link-reviews" aria-label="Placeholder product reviews">
            <span aria-hidden="true">* * * * *</span>
            <strong>5.0</strong>
            <span>(24 reviews)</span>
          </div>

          {isBallMarker ? (
            <>
              <section className="club-link-option-block" aria-labelledby="club-link-finish-heading">
                <h2 id="club-link-finish-heading">Select Finish</h2>
                <div className="club-link-finish-grid">
                  {finishes.map((finish) => (
                    <div key={finish.name} className="club-link-finish">
                      <span className={`club-link-swatch ${finish.swatchClassName}`} />
                      <span>{finish.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="club-link-customizer"
                aria-labelledby="club-link-customizer-heading"
              >
                <div className="club-link-customizer-main">
                  <h2 id="club-link-customizer-heading">Customize Your Design</h2>
                  <div className="club-link-customizer-grid">
                    {customizationFields.map((field) => (
                      <div key={field.label} className="club-link-field">
                        <span>{field.label}</span>
                        <p>{field.placeholder}</p>
                      </div>
                    ))}
                    <div className="club-link-style-group">
                      <span>Design Style</span>
                      <div className="club-link-style-grid">
                        {designStyles.map((style) => (
                          <div key={style} className="club-link-style">
                            {style}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="club-link-logo-row">
                    <div>
                      <span>Upload Your Logo</span>
                      <p>PNG, JPG, or SVG placeholder</p>
                    </div>
                    <div className="club-link-upload-placeholder">Upload Image</div>
                  </div>
                  <div className="club-link-notes">
                    <span>Additional Notes</span>
                    <p>Any special requests or instructions...</p>
                  </div>
                  <p className="club-link-action-helper">
                    Enter your customization details before checkout. A preview tool will be added
                    soon so you can review your design before ordering.
                  </p>
                  <div className="club-link-actions">
                    <button type="button" className="club-link-primary-action">
                      ADD TO CART
                    </button>
                    <Link href="/contact" className="club-link-secondary-action">
                      REQUEST BULK ORDER
                    </Link>
                    <button type="button" className="club-link-preview-action" disabled>
                      GENERATE DESIGN PREVIEW
                    </button>
                  </div>
                  <div className="club-link-preview-note">
                    Design preview generation coming soon.
                  </div>
                </div>
              </section>
            </>
          ) : (
            <ProductCustomizationForm productLabel="Club Links" />
          )}
        </div>
      </article>

      <section className="club-link-upsell" aria-labelledby="club-link-upsell-heading">
        <div className="club-link-upsell-heading">
          <h2 id="club-link-upsell-heading">Complete Your Golf Setup</h2>
          <p>Add matching accessories and make it a complete set.</p>
        </div>
        <div className="club-link-upsell-grid">
          {setupUpsells.map((item) => (
            <article key={item.title} className="club-link-upsell-card">
              <div className="club-link-upsell-media" aria-hidden="true">
                <span>{item.imageLabel}</span>
              </div>
              <div className="club-link-upsell-body">
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                {item.price ? <strong>{item.price}</strong> : null}
                <Link href={item.href} className="club-link-upsell-action">
                  {item.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="club-link-info-panels" aria-label={`${productTypeLabel} product information`}>
        {infoPanels.map((panel) => (
          <article key={panel.title} className="club-link-info-panel">
            <div className="club-link-info-heading">
              <span className={`club-link-info-icon is-${panel.icon}`} aria-hidden="true">
                {panel.icon}
              </span>
              <h2>{panel.title}</h2>
            </div>
            {panel.rating ? (
              <div className="club-link-panel-rating" aria-label={`Rated ${panel.rating}`}>
                <span aria-hidden="true">* * * * *</span>
                <strong>{panel.rating}</strong>
              </div>
            ) : null}
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
  const product = await getAvailableProduct(handle);

  if (!product) {
    notFound();
  }

  const categoryTitle = getProductCategoryTitle(product);

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
          <article className="product-detail">
            <div className="product-detail-media">
              <ProductImage product={product} className={styles.detailImage} />
            </div>

            <div className="product-detail-summary">
              {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
              <h1>{product.title}</h1>
              <p className={styles.handle}>/{product.handle}</p>
              <p className="product-detail-description">{product.shortDescription}</p>
              <p className="product-detail-price">{product.priceLabel}</p>

              <section className="product-detail-notice" aria-label="Product inquiry availability">
                <h2>Product Inquiry</h2>
                <p>
                  Contact us to discuss customization, quantities, and availability for this
                  product. We will help plan the right details for your order.
                </p>
                <Link href="/contact" className="product-detail-contact-link">
                  Start An Inquiry
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </section>
            </div>
          </article>

          <section className="product-detail-panels" aria-label="Future product information">
            <article className="product-detail-panel">
              <h2>Customization Options</h2>
              <p>
                Customization details are being prepared. Future inquiries can cover artwork,
                personalization, gifting, and bulk order ideas for this product.
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
    </main>
  );
}
