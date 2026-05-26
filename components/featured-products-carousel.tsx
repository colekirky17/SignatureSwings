"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProductCategory, type ProductSummary } from "../lib/catalog";

type FeaturedProductsCarouselProps = {
  products: ProductSummary[];
};

type FeaturedCollection = {
  id: string;
  label: string;
  handles: string[];
};

const featuredCollections: FeaturedCollection[] = [
  {
    id: "best-sellers",
    label: "Best Sellers",
    handles: [
      "custom-ball-marker",
      "premium-divot-repair-tool",
      "club-link-tag",
      "signature-bundle",
      "custom-event-marker",
    ],
  },
  {
    id: "offers",
    label: "20% Off",
    handles: [
      "signature-bundle",
      "groomsmen-gift-set",
      "bulk-order-starter-pack",
      "custom-ball-marker",
    ],
  },
  {
    id: "seasonal",
    label: "Seasonal",
    handles: [
      "custom-event-marker",
      "groomsmen-gift-set",
      "signature-bundle",
      "club-link-tag",
    ],
  },
];

export function FeaturedProductsCarousel({ products }: FeaturedProductsCarouselProps) {
  const [activeCollectionId, setActiveCollectionId] = useState(featuredCollections[0].id);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeCollection =
    featuredCollections.find((collection) => collection.id === activeCollectionId) ??
    featuredCollections[0];
  const visibleProducts = activeCollection.handles
    .map((handle) => products.find((product) => product.handle === handle))
    .filter((product): product is ProductSummary => product !== undefined);

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeCollectionId]);

  function scrollProducts(direction: -1 | 1) {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * track.clientWidth * 0.9,
      behavior: "smooth",
    });
  }

  return (
    <section className="home-featured" aria-labelledby="home-featured-heading">
      <div className="home-featured-header">
        <div>
          <h2 id="home-featured-heading">Shop Favorites</h2>
          <p>
            Start with our most popular custom golf accessories, seasonal picks, and featured
            offers.
          </p>
        </div>
        <div className="home-featured-arrows" aria-label="Browse featured products">
          <button
            type="button"
            aria-label="Scroll featured products left"
            onClick={() => scrollProducts(-1)}
          >
            &lt;
          </button>
          <button
            type="button"
            aria-label="Scroll featured products right"
            onClick={() => scrollProducts(1)}
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="home-featured-tabs" role="tablist" aria-label="Featured collections">
        {featuredCollections.map((collection) => (
          <button
            key={collection.id}
            id={`featured-tab-${collection.id}`}
            type="button"
            role="tab"
            className={collection.id === activeCollection.id ? "is-active" : ""}
            aria-controls="featured-products-track"
            aria-selected={collection.id === activeCollection.id}
            onClick={() => setActiveCollectionId(collection.id)}
          >
            {collection.label}
          </button>
        ))}
      </div>
      <p className="home-featured-note">Preview collections only. Pricing remains by inquiry.</p>

      <div
        ref={trackRef}
        id="featured-products-track"
        className="home-featured-track"
        role="tabpanel"
        aria-labelledby={`featured-tab-${activeCollection.id}`}
      >
        {visibleProducts.map((product) => {
          const category = getProductCategory(product.categorySlug);

          return (
            <article key={product.handle} className="featured-product-card">
              <div className="featured-product-media">
                <span className="media-label">{product.imagePlaceholderLabel}</span>
              </div>
              <div className="featured-product-body">
                <p className="featured-product-category">{category.title}</p>
                <h3>{product.title}</h3>
                <p className="featured-product-description">{product.shortDescription}</p>
                <p className="featured-product-price">{product.priceLabel}</p>
                <Link href={`/shop/${product.handle}`} className="featured-product-link">
                  View Product
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
