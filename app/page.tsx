import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "../components/category-card";
import { FaqList } from "../components/faq-list";
import { productCategories } from "../lib/catalog";
import { homepageFaqItems } from "../lib/faq-content";
import "./home-custom.css";

export const metadata: Metadata = {
  title: {
    absolute: "Signature Swings | Custom Golf Accessories",
  },
  description:
    "Explore Signature Swings custom golf accessories, including custom golf ball markers, custom divot repair tools, personalized golf gifts, and bulk order ideas.",
};

const homepageCategories = productCategories
  .filter((category) => category.slug !== "miscellaneous")
  .map((category, index) => ({
    ...category,
    icon: `0${index + 1}`,
  }));

const benefits = [
  {
    title: "Premium Quality",
    copy: "Crafted to feel polished, durable, and gift-worthy.",
    icon: "PQ",
  },
  {
    title: "Customized for You",
    copy: "Personalize every detail to represent your game.",
    icon: "CY",
  },
  {
    title: "Fast Turnaround",
    copy: "Quick production and reliable shipping.",
    icon: "FT",
  },
  {
    title: "Perfect Golf Gift",
    copy: "Made for golfers, tournaments, weddings, and special moments.",
    icon: "GG",
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
          {homepageCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} icon={category.icon} />
          ))}
        </div>
      </section>

      <section className="home-custom" aria-labelledby="home-custom-heading">
        <div className="home-custom-content">
          <h2 id="home-custom-heading">Make It Custom</h2>
          <p className="home-custom-copy">
            Add names, initials, logos, images &mdash; or let us help turn your idea into a design
            that feels made for your game.
          </p>
          <Link href="/contact" className="home-custom-button">
            Start Custom Order
          </Link>
        </div>
        <div className="home-custom-media">
          <span className="media-label">Custom image banner placeholder</span>
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
        <FaqList items={homepageFaqItems} variant="preview" />
      </section>
    </main>
  );
}
