import type { Metadata } from "next";
import { CatalogProductCard } from "../../components/catalog-product-card";
import { productCategories, products } from "../../lib/catalog";

export const metadata: Metadata = {
  title: "Custom Golf Accessories Collection",
  description:
    "Browse previews of custom golf ball markers, custom divot repair tools, personalized golf gifts, and bulk custom golf accessories from Signature Swings.",
};

export default function ShopPage() {
  return (
    <main className="shop-page">
      <section className="shop-hero">
        <p className="shop-kicker">Signature Collection</p>
        <h1>Browse Signature Swings</h1>
        <p>
          Preview custom golf accessories built to represent your game. Website ordering is
          coming soon; custom and bulk orders are currently discussed through direct inquiry.
        </p>
      </section>

      <section className="shop-category-panel" aria-labelledby="shop-category-heading">
        <h2 id="shop-category-heading">Browse Categories</h2>
        <div className="shop-tabs" aria-label="Product categories">
          {productCategories.map((category) => (
            <span key={category.slug} className="shop-tab">
              {category.title}
            </span>
          ))}
        </div>
      </section>

      <section className="product-section" aria-labelledby="product-grid-heading">
        <div className="product-section-heading">
          <div>
            <p className="shop-kicker">Product Preview</p>
            <h2 id="product-grid-heading">Explore The Collection</h2>
          </div>
          <p className="product-count">{products.length} product previews</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <CatalogProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
