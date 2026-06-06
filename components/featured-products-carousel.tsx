"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { homepageFeaturedCollections, type ProductSummary } from "../lib/catalog";
import type { ShopifyCollectionProductGroup } from "../lib/shopify";
import styles from "./catalog-product-media.module.css";

type FeaturedProductsCarouselProps = {
  products: ProductSummary[];
  collectionGroups?: ShopifyCollectionProductGroup[] | null;
};

type FeaturedCollection = {
  id: string;
  label: string;
  products: ProductSummary[];
};

const staticFeaturedHandles = {
  "best-sellers": [
    "custom-ball-marker",
    "premium-divot-repair-tool",
    "club-link-tag",
    "signature-bundle",
    "custom-event-marker",
  ],
  offers: [
    "signature-bundle",
    "groomsmen-gift-set",
    "bulk-order-starter-pack",
    "custom-ball-marker",
  ],
  seasonal: [
    "custom-event-marker",
    "groomsmen-gift-set",
    "signature-bundle",
    "club-link-tag",
  ],
};

function getFeaturedCollections(
  products: ProductSummary[],
  collectionGroups: ShopifyCollectionProductGroup[] | null | undefined,
): FeaturedCollection[] {
  if (collectionGroups !== null && collectionGroups !== undefined) {
    return homepageFeaturedCollections
      .map((placement) => {
        const group = collectionGroups.find(
          (collection) => collection.placementId === placement.id,
        );

        return {
          id: placement.id,
          label: group?.title ?? placement.title,
          products: group?.products ?? [],
        };
      })
      .filter((collection) => collection.products.length > 0);
  }

  return homepageFeaturedCollections.map((placement) => ({
    id: placement.id,
    label: placement.title,
    products: (staticFeaturedHandles[placement.id as keyof typeof staticFeaturedHandles] ?? [])
      .map((handle) => products.find((product) => product.handle === handle))
      .filter((product): product is ProductSummary => product !== undefined),
  }));
}

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

export function FeaturedProductsCarousel({
  products,
  collectionGroups,
}: FeaturedProductsCarouselProps) {
  const featuredCollections = getFeaturedCollections(products, collectionGroups);
  const [activeCollectionId, setActiveCollectionId] = useState(featuredCollections[0]?.id);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeCollection =
    featuredCollections.find((collection) => collection.id === activeCollectionId) ??
    featuredCollections[0];
  const visibleProducts = activeCollection?.products ?? [];

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

  if (!featuredCollections.length || !activeCollection) {
    return null;
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
      <p className="home-featured-note">
        Shopify collections control featured placement. Pricing remains by inquiry.
      </p>

      <div
        ref={trackRef}
        id="featured-products-track"
        className="home-featured-track"
        role="tabpanel"
        aria-labelledby={`featured-tab-${activeCollection.id}`}
      >
        {visibleProducts.map((product) => {
          const priceLabel = getPreviewPriceLabel(product.priceLabel);

          return (
            <article key={product.handle} className="featured-product-card">
              <Link href={`/shop/${product.handle}`} className="featured-product-card-link">
                <div className="featured-product-media">
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
                <div className="featured-product-body">
                  <h3>{product.title}</h3>
                  {priceLabel ? <p className="featured-product-price">{priceLabel}</p> : null}
                  {product.availableForSale !== undefined ? (
                    <p
                      className={`inventory-status ${
                        product.availableForSale ? "is-in-stock" : "is-out-of-stock"
                      }`}
                    >
                      {product.availableForSale ? "In stock" : "Out of stock"}
                    </p>
                  ) : null}
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
