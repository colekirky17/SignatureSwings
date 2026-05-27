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
        <span className="media-label">Image placeholder</span>
      </div>
      <div className="category-body">
        <h3>{category.title}</h3>
        <p>{category.shortDescription}</p>
        <Link href={shopHref} className="category-link">
          Shop
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </article>
  );
}
