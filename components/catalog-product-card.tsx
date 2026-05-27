import Link from "next/link";
import type { ProductSummary } from "../lib/catalog";
import styles from "./catalog-product-media.module.css";

type CatalogProductCardProps = {
  product: ProductSummary;
};

function getPreviewPriceLabel(priceLabel: string): string | undefined {
  const cleanPrice = priceLabel
    .replace(/\s*-\s*inquiry only\s*$/i, "")
    .replace(/\binquiry only\b/gi, "")
    .trim();

  if (!cleanPrice || /^pricing by inquiry$/i.test(cleanPrice)) {
    return "Price coming soon";
  }

  return cleanPrice;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const priceLabel = getPreviewPriceLabel(product.priceLabel);

  return (
    <article className="product-card">
      <Link href={`/shop/${product.handle}`} className="product-card-link">
        <div className="product-media">
          {product.image ? (
            <img
              className={styles.cardImage}
              src={product.image.url}
              alt={product.image.altText || product.title}
              width={product.image.width ?? undefined}
              height={product.image.height ?? undefined}
              loading="lazy"
            />
          ) : (
            <span className="media-label">{product.imagePlaceholderLabel}</span>
          )}
        </div>
        <div className="product-body">
          <h3>{product.title}</h3>
          {priceLabel ? <p className="product-price">{priceLabel}</p> : null}
        </div>
      </Link>
    </article>
  );
}
