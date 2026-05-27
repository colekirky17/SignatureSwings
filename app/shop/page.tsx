import type { Metadata } from "next";
import { CatalogProductCard } from "../../components/catalog-product-card";
import styles from "../../components/catalog-product-media.module.css";
import {
  getAllProducts,
  getProductsByCategory,
  productCategories,
  shopCategoryCollections,
} from "../../lib/catalog";
import {
  fetchShopifyCollectionProductGroups,
  fetchShopifyProducts,
  type ShopifyCollectionProductGroup,
} from "../../lib/shopify";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Custom Golf Accessories Collection",
  description:
    "Browse previews of custom golf ball markers, custom divot repair tools, personalized golf gifts, and bulk custom golf accessories from Signature Swings.",
};

function getFallbackCollectionGroups(): ShopifyCollectionProductGroup[] {
  return shopCategoryCollections.map((collection) => ({
    title:
      productCategories.find((category) => category.slug === collection.categorySlug)?.title ??
      collection.title,
    handle: collection.handle,
    placementId: collection.id,
    products: collection.categorySlug
      ? getProductsByCategory(collection.categorySlug)
      : [],
  }));
}

function getEmptyShopifyCollectionGroups(): ShopifyCollectionProductGroup[] {
  return shopCategoryCollections.map((collection) => ({
    title: collection.title,
    handle: collection.handle,
    placementId: collection.id,
    products: [],
  }));
}

export default async function ShopPage() {
  const [shopifyProducts, shopifyCollectionGroups] = await Promise.all([
    fetchShopifyProducts(),
    fetchShopifyCollectionProductGroups(shopCategoryCollections),
  ]);
  const usingShopify = Boolean(shopifyProducts?.length);
  const products = usingShopify ? shopifyProducts! : getAllProducts();
  const collectionGroups = usingShopify
    ? shopifyCollectionGroups ?? getEmptyShopifyCollectionGroups()
    : getFallbackCollectionGroups();

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
          {collectionGroups.map((collection) => (
            <a
              key={collection.handle}
              href={`#collection-${collection.handle}`}
              className={`shop-tab ${styles.shopTabLink}`}
            >
              {collection.title}
            </a>
          ))}
        </div>
      </section>

      <section className="product-section" aria-labelledby="product-grid-heading">
        <div className="product-section-heading">
          <div>
            <p className="shop-kicker">{usingShopify ? "Product Catalog" : "Product Preview"}</p>
            <h2 id="product-grid-heading">Explore The Collection</h2>
          </div>
          <p className="product-count">
            {products.length} {usingShopify ? "products" : "product previews"}
          </p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <CatalogProductCard key={product.handle} product={product} />
          ))}
        </div>
      </section>

      <section
        className={`product-section ${styles.collectionSectionList}`}
        aria-label="Shopify collections"
      >
        {collectionGroups.map((collection) => (
          <section
            key={collection.handle}
            id={`collection-${collection.handle}`}
            className={styles.collectionSection}
            aria-labelledby={`collection-heading-${collection.handle}`}
          >
            <div className="product-section-heading">
              <div>
                <p className="shop-kicker">Shopify Collection</p>
                <h2 id={`collection-heading-${collection.handle}`}>{collection.title}</h2>
              </div>
              <p className="product-count">
                {collection.products.length}{" "}
                {collection.products.length === 1 ? "product" : "products"}
              </p>
            </div>

            {collection.products.length ? (
              <div className="product-grid">
                {collection.products.map((product) => (
                  <CatalogProductCard
                    key={`${collection.handle}-${product.handle}`}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>{collection.title} products coming soon</h3>
                <p>
                  Add products to this Shopify collection to place them in this section.
                </p>
              </div>
            )}
          </section>
        ))}
      </section>
    </main>
  );
}
