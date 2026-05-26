import Link from "next/link";
import { getProductCategory, type ProductSummary } from "../lib/catalog";

type CatalogProductCardProps = {
  product: ProductSummary;
};

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  const category = getProductCategory(product.categorySlug);

  return (
    <article className="product-card">
      <div className="product-media">
        <span className="media-label">{product.imagePlaceholderLabel}</span>
      </div>
      <div className="product-body">
        <p className="product-category">{category.title}</p>
        <h3>{product.title}</h3>
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
