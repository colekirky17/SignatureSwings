const categories = [
  "Golf Ball Markers",
  "Divot Repair Tools",
  "Club Links",
  "Miscellaneous",
  "Bundles",
];

// Replace this placeholder catalog with mapped Shopify product data when commerce is connected.
const products = [
  {
    title: "Custom Ball Marker",
    handle: "custom-ball-marker",
    category: "Golf Ball Markers",
    description: "Engraved detail for a personal finish on every green.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Ball marker image",
  },
  {
    title: "Premium Divot Repair Tool",
    handle: "premium-divot-repair-tool",
    category: "Divot Repair Tools",
    description: "A precision course essential with a refined feel.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Divot tool image",
  },
  {
    title: "Club Link Tag",
    handle: "club-link-tag",
    category: "Club Links",
    description: "A clean custom tag made to identify your club.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Club link image",
  },
  {
    title: "Signature Bundle",
    handle: "signature-bundle",
    category: "Bundles",
    description: "Coordinated golf accessories presented as one giftable set.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Bundle image",
  },
  {
    title: "Groomsmen Gift Set",
    handle: "groomsmen-gift-set",
    category: "Bundles",
    description: "Personalized pieces for the golfers in your wedding party.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Gift set image",
  },
  {
    title: "Custom Event Marker",
    handle: "custom-event-marker",
    category: "Golf Ball Markers",
    description: "Event-ready markers for outings and memorable occasions.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Event marker image",
  },
  {
    title: "Miscellaneous Golf Accessory",
    handle: "miscellaneous-golf-accessory",
    category: "Miscellaneous",
    description: "A small premium addition made to complement your gear.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Accessory image",
  },
  {
    title: "Bulk Order Starter Pack",
    handle: "bulk-order-starter-pack",
    category: "Bundles",
    description: "A simple starting point for tournaments and group gifts.",
    priceLabel: "From $XX",
    imagePlaceholderLabel: "Bulk order image",
  },
];

export default function ShopPage() {
  return (
    <main className="shop-page">
      <section className="shop-hero">
        <p className="shop-kicker">Signature Collection</p>
        <h1>Shop Signature Swings</h1>
        <p>Custom golf accessories built to represent your game.</p>
      </section>

      <section className="shop-category-panel" aria-labelledby="shop-category-heading">
        <h2 id="shop-category-heading">Browse Categories</h2>
        <div className="shop-tabs" aria-label="Product categories">
          {categories.map((category) => (
            <span key={category} className="shop-tab">
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="product-section" aria-labelledby="product-grid-heading">
        <div className="product-section-heading">
          <div>
            <p className="shop-kicker">All Products</p>
            <h2 id="product-grid-heading">Explore The Collection</h2>
          </div>
          <p className="product-count">{products.length} products</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
            <article key={product.handle} className="product-card">
              <div className="product-media">
                <span className="media-label">{product.imagePlaceholderLabel}</span>
              </div>
              <div className="product-body">
                <p className="product-category">{product.category}</p>
                <h3>{product.title}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-actions">
                  <p className="product-price">{product.priceLabel}</p>
                  <button className="product-button" type="button" disabled>
                    View Product
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
