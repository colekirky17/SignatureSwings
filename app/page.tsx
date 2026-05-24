import Link from "next/link";

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">Custom golf accessories</p>
        <h1>Signature Swings</h1>
        <p className="hero-copy">Premium custom golf accessories.</p>
        <div className="actions">
          <Link href="/shop" className="button">
            Shop
          </Link>
          <Link href="/contact" className="button button-secondary">
            Contact
          </Link>
        </div>
      </section>
    </main>
  );
}
