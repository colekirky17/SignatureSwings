import Link from "next/link";
import { getProductCategoryTitle, type ProductSummary } from "../lib/catalog";
import styles from "./catalog-product-media.module.css";

type CatalogProductCardProps = {
  product: ProductSummary;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const categoryTitle = getProductCategoryTitle(product);

  return (
    <article className="product-card">
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
        {categoryTitle ? <p className="product-category">{categoryTitle}</p> : null}
        <h3>{product.title}</h3>
        <p className={styles.handle}>/{product.handle}</p>
        <p className="product-description">{product.shortDescription}</p>
        <div className="product-actions">
          <p className="product-price">{product.priceLabel}</p>
          <Link href={`/shop/${product.handle}`} className="product-button">
            View Product
          </Link>
        </div>
      </div>
    </article>
  );
}
