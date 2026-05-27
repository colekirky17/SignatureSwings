import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../../../components/catalog-product-media.module.css";
import {
  getAllProducts,
  getProductByHandle,
  getProductCategoryTitle,
} from "../../../lib/catalog";
import {
  fetchShopifyProductByHandle,
  fetchShopifyProducts,
} from "../../../lib/shopify";

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>;
};

export const revalidate = 300;

async function getAvailableProduct(handle: string) {
  return (await fetchShopifyProductByHandle(handle)) ?? getProductByHandle(handle);
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

      <article className="product-detail">
        <div className="product-detail-media">
          {product.image ? (
            <img
              className={styles.detailImage}
              src={product.image.url}
              alt={product.image.altText || product.title}
              width={product.image.width ?? undefined}
              height={product.image.height ?? undefined}
            />
          ) : (
            <span className="media-label">{product.imagePlaceholderLabel}</span>
          )}
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
    </main>
  );
}
