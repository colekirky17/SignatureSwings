import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../components/catalog-product-media.module.css";
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

const clubLinkFinishes = [
  { name: "Satin Silver", swatchClassName: "is-silver" },
  { name: "Brushed Black", swatchClassName: "is-black" },
  { name: "Champagne Gold", swatchClassName: "is-gold" },
  { name: "Gunmetal", swatchClassName: "is-gunmetal" },
];

const clubLinkDesignStyles = ["Classic", "Modern", "Initials", "Minimal"];

const clubLinkHighlights = [
  {
    title: "Premium Quality",
    copy: "High-grade materials",
  },
  {
    title: "Custom Engraved",
    copy: "Your details, your style",
  },
  {
    title: "Secure Fit",
    copy: "Made to sit flush in the grip",
  },
  {
    title: "Built To Last",
    copy: "Durable and corrosion resistant",
  },
];

const clubLinkInfoPanels = [
  {
    title: "Description",
    copy:
      "Club Links are personalized golf club ID tags designed to add a clean custom detail to your grip. This placeholder section will later pull richer product copy from Shopify.",
  },
  {
    title: "Specifications",
    copy:
      "Placeholder specs: metal finish options, engraved name or phone number, optional initials, and sizing details to be finalized per product.",
  },
  {
    title: "Reviews",
    copy: "Placeholder review summary until review data is connected.",
  },
  {
    title: "Shipping & Returns",
    copy:
      "Custom orders are handled by inquiry for now. Shipping timing and return details will be confirmed before production.",
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
}: {
  product: ProductSummary;
  categoryTitle?: string;
}) {
  const priceLabel = getDisplayPriceLabel(product.priceLabel);

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
          <div className="club-link-highlights" aria-label="Club Links highlights">
            {clubLinkHighlights.map((highlight) => (
              <div key={highlight.title} className="club-link-highlight">
                <span aria-hidden="true" />
                <div>
                  <h2>{highlight.title}</h2>
                  <p>{highlight.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="club-link-summary">
          {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
          <h1>{product.title}</h1>
          <p className="club-link-price">{priceLabel}</p>
          <p className="club-link-intro">
            Custom engraved Club Links made to personalize the top of your golf grip with a
            clean, durable finish. Final options and availability will be confirmed by inquiry.
          </p>
          <div className="club-link-reviews" aria-label="Placeholder product reviews">
            <span aria-hidden="true">* * * * *</span>
            <strong>5.0</strong>
            <span>(24 reviews)</span>
          </div>

          <section className="club-link-option-block" aria-labelledby="club-link-finish-heading">
            <h2 id="club-link-finish-heading">Select Finish</h2>
            <div className="club-link-finish-grid">
              {clubLinkFinishes.map((finish) => (
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
                <div className="club-link-field">
                  <span>Name</span>
                  <p>e.g., John Smith</p>
                </div>
                <div className="club-link-field">
                  <span>Phone Number</span>
                  <p>e.g., (800) 123-4561</p>
                </div>
                <div className="club-link-field">
                  <span>Initials / Short Text</span>
                  <p>e.g., JS</p>
                </div>
                <div className="club-link-style-group">
                  <span>Design Style</span>
                  <div className="club-link-style-grid">
                    {clubLinkDesignStyles.map((style) => (
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
              <div className="club-link-actions">
                <Link href="/contact" className="club-link-primary-action">
                  Start An Inquiry
                </Link>
                <Link href="/contact" className="club-link-secondary-action">
                  Request Bulk Order
                </Link>
              </div>
            </div>

            <aside className="club-link-preview" aria-label="Club Links live preview placeholder">
              <h2>Live Preview</h2>
              <div className="club-link-preview-image">
                <ProductImage product={product} className={styles.detailImage} />
              </div>
              <p>Preview is approximate. Final engraving may vary slightly.</p>
            </aside>
          </section>
        </div>
      </article>

      <section className="club-link-info-panels" aria-label="Club Links product information">
        {clubLinkInfoPanels.map((panel) => (
          <article key={panel.title} className="club-link-info-panel">
            <h2>{panel.title}</h2>
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
        &lt;- Back To Collection
      </Link>

      {isClubLinkProduct(product, categoryTitle) ? (
        <ClubLinkProductDetail product={product} categoryTitle={categoryTitle} />
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
