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
  return shopCategoryCollections
    .map((collection) => ({
      title:
        productCategories.find((category) => category.slug === collection.categorySlug)?.title ??
        collection.title,
      handle: collection.handle,
      placementId: collection.id,
      products: collection.categorySlug
        ? getProductsByCategory(collection.categorySlug)
        : [],
    }))
    .filter((collection) => collection.products.length > 0);
}

export default async function ShopPage() {
  const [shopifyProducts, shopifyCollectionGroups] = await Promise.all([
    fetchShopifyProducts(),
    fetchShopifyCollectionProductGroups(shopCategoryCollections),
  ]);
  const usingShopify = shopifyProducts !== null;
  const products = usingShopify ? shopifyProducts : getAllProducts();
  const collectionGroups = (
    usingShopify ? shopifyCollectionGroups ?? [] : getFallbackCollectionGroups()
  ).filter((collection) => collection.products.length > 0);

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

      {collectionGroups.length ? (
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
                  <h2 id={`collection-heading-${collection.handle}`}>{collection.title}</h2>
                </div>
                <p className="product-count">
                  {collection.products.length}{" "}
                  {collection.products.length === 1 ? "product" : "products"}
                </p>
              </div>

              <div className="product-grid">
                {collection.products.map((product) => (
                  <CatalogProductCard
                    key={`${collection.handle}-${product.handle}`}
                    product={product}
                  />
                ))}
              </div>
            </section>
          ))}
        </section>
      ) : null}
    </main>
  );
}
