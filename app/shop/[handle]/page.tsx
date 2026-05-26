import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProducts,
  getProductByHandle,
  getProductCategory,
} from "../../../lib/catalog";

type ProductDetailPageProps = {
  params: Promise<{ handle: string }>;
};

export function generateStaticParams() {
  return getAllProducts().map((product) => ({
    handle: product.handle,
  }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);

  if (!product) {
    return {};
  }

  return {
    title: product.title,
    description: `${product.shortDescription} Preview this custom golf accessory from Signature Swings. Product inquiries are coming soon.`,
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { handle } = await params;
  const product = getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const category = getProductCategory(product.categorySlug);

  return (
    <main className="product-detail-page">
      <Link href="/shop" className="product-detail-back-link">
        &lt;- Back To Collection
      </Link>

      <article className="product-detail">
        <div className="product-detail-media">
          <span className="media-label">{product.imagePlaceholderLabel}</span>
        </div>

        <div className="product-detail-summary">
          <p className="product-category">{category.title}</p>
          <h1>{product.title}</h1>
          <p className="product-detail-description">{product.shortDescription}</p>
          <p className="product-detail-price">{product.priceLabel}</p>

          <section className="product-detail-notice" aria-label="Product inquiry availability">
            <h2>{product.ctaLabel}</h2>
            <p>
              Live purchasing and add to cart are not available yet. Contact us to discuss
              this product while online inquiry tools and future Shopify checkout are prepared.
            </p>
            <Link href="/contact" className="product-detail-contact-link">
              View Inquiry Information
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
          <h2>Future Product Details</h2>
          <p>
            Final variants, pricing, availability, and Shopify-powered checkout will be added
            later when the product catalog is connected for live ordering.
          </p>
        </article>
      </section>
    </main>
  );
}
