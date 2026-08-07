import Link from "next/link";
import type { ProductCategory } from "../lib/catalog";

type CategoryCardProps = {
  category: ProductCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  const shopHref = `/shop#collection-${category.shopifyCollectionHandle ?? category.slug}`;

  return (
    <article className="home-category-card">
      <div className="category-media">
        {category.image ? (
          <img
            src={category.image.url}
            alt={category.image.altText ?? category.title}
            loading="lazy"
            width={category.image.width ?? undefined}
            height={category.image.height ?? undefined}
            className="category-media-image"
          />
        ) : (
          <span className="media-label">Collection image unavailable</span>
        )}
      </div>
      <div className="category-body">
        <h3>{category.title}</h3>
        <p>{category.shortDescription}</p>
        <Link href={shopHref} className="category-link">
          Shop
        </Link>
      </div>
    </article>
  );
}
