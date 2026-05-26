import Link from "next/link";
import type { ProductCategory } from "../lib/catalog";

type CategoryCardProps = {
  category: ProductCategory;
  icon: string;
};

export function CategoryCard({ category, icon }: CategoryCardProps) {
  return (
    <article className="home-category-card">
      <div className="category-media">
        <span className="media-label">Image placeholder</span>
      </div>
      <div className="category-body">
        <span className="category-icon" aria-hidden="true">
          {icon}
        </span>
        <h3>{category.title}</h3>
        <p>{category.shortDescription}</p>
        <Link href="/shop" className="category-link">
          Explore {category.title}
          <span aria-hidden="true">-&gt;</span>
        </Link>
      </div>
    </article>
  );
}
