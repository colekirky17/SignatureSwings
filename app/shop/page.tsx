const categories = ["Ball Markers", "Divot Tools", "Club Links", "Bundles", "Custom Orders"];

export default function ShopPage() {
  return (
    <main className="py-12 sm:py-16">
      <section className="max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Shop Signature Swings</h1>
        <p className="mt-4 text-base leading-7 text-slate-300">
          Product categories will be added here as the storefront develops.
        </p>
      </section>

      <section aria-label="Shop categories" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category} className="rounded-lg border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-lg font-medium">{category}</h2>
            <p className="mt-2 text-sm text-slate-400">Category placeholder</p>
          </div>
        ))}
      </section>
    </main>
  );
}
