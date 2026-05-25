import Link from "next/link";
import { homepageFaqItems } from "../lib/faq-content";

const categories = [
  {
    title: "Ball Markers",
    copy: "Make your mark. Stand out on every green.",
    cta: "Explore Ball Markers",
    icon: "01",
  },
  {
    title: "Divot Tools",
    copy: "Precision tools for course perfection.",
    cta: "Explore Divot Tools",
    icon: "02",
  },
  {
    title: "Club Links",
    copy: "The perfect touch for your club.",
    cta: "Explore Club Links",
    icon: "03",
  },
  {
    title: "Bundles",
    copy: "Curated sets. Better together.",
    cta: "Explore Bundles",
    icon: "04",
  },
];

const benefits = [
  {
    title: "Premium Quality",
    copy: "Crafted from the finest materials.",
    icon: "PQ",
  },
  {
    title: "Fully Customizable",
    copy: "Personalize every detail to represent you.",
    icon: "FC",
  },
  {
    title: "Fast Turnaround",
    copy: "Quick production and reliable shipping.",
    icon: "FT",
  },
  {
    title: "Dedicated Support",
    copy: "We're here to help every step of the way.",
    icon: "DS",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-label="Featured collection">
        <div className="home-hero-content">
          <p className="home-eyebrow">Custom Golf Accessories</p>
          <h1>Elevate Every Round</h1>
          <p className="home-hero-copy">
            Custom designed. Premium crafted.
            <br />
            Browse the collection. Website ordering coming soon.
          </p>
          <Link href="/shop" className="home-button">
            Explore Collection
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
        <div className="home-hero-media">
          <span className="media-label">Golf lifestyle image placeholder</span>
        </div>
        <div className="hero-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
      </section>

      <section className="home-categories" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="home-section-title">
          Browse By Category
        </h2>
        <div className="home-category-grid">
          {categories.map((category) => (
            <article key={category.title} className="home-category-card">
              <div className="category-media">
                <span className="media-label">Image placeholder</span>
              </div>
              <div className="category-body">
                <span className="category-icon" aria-hidden="true">
                  {category.icon}
                </span>
                <h3>{category.title}</h3>
                <p>{category.copy}</p>
                <Link href="/shop" className="category-link">
                  {category.cta}
                  <span aria-hidden="true">-&gt;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-benefits" aria-label="Signature Swings benefits">
        {benefits.map((benefit) => (
          <article key={benefit.title} className="benefit">
            <span className="benefit-icon" aria-hidden="true">
              {benefit.icon}
            </span>
            <div>
              <h2>{benefit.title}</h2>
              <p>{benefit.copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="home-faq-preview" aria-labelledby="home-faq-heading">
        <div className="home-faq-header">
          <div>
            <p className="faq-kicker">Need To Know</p>
            <h2 id="home-faq-heading" className="home-section-title">
              Frequently Asked Questions
            </h2>
          </div>
          <Link href="/faq" className="faq-link">
            View all FAQs
            <span aria-hidden="true">-&gt;</span>
          </Link>
        </div>
        <dl className="home-faq-grid">
          {homepageFaqItems.map((item) => (
            <div key={item.id} className="faq-item home-faq-item">
              <dt>
                <h3>{item.question}</h3>
              </dt>
              <dd>
                <p>{item.answer}</p>
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
