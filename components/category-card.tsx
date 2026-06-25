import Link from "next/link";
import Image from "next/image";
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
          <Image
            src={category.image.url}
            alt={category.image.altText ?? category.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 900px) 50vw, 25vw"
            loading="lazy"
            className="category-media-image"
          />
        ) : (
          <span className="media-label">Image placeholder</span>
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
