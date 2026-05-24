const categories = ["Ball Markers", "Divot Tools", "Club Links", "Bundles", "Custom Orders"];

export default function ShopPage() {
  return (
    <main className="page">
      <section className="page-header">
        <h1>Shop Signature Swings</h1>
        <p className="page-intro">
          Product categories will be added here as the storefront develops.
        </p>
      </section>

      <section aria-label="Shop categories" className="card-grid">
        {categories.map((category) => (
          <div key={category} className="card">
            <h2 className="card-title">{category}</h2>
            <p className="muted">Category placeholder</p>
          </div>
        ))}
      </section>
    </main>
  );
}
