import type { Metadata } from "next";
import Link from "next/link";
import { CategoryCard } from "../components/category-card";
import { FaqList } from "../components/faq-list";
import { FeaturedProductsCarousel } from "../components/featured-products-carousel";
import {
  getAllProducts,
  homepageFeaturedCollections,
  productCategories,
} from "../lib/catalog";
import { homepageFaqItems } from "../lib/faq-content";
import {
  fetchShopifyCollectionProductGroups,
  fetchShopifyProducts,
} from "../lib/shopify";
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
  .map((category) => ({
    ...category,
    title: category.slug === "divot-repair-tools" ? "Divot Tools" : category.title,
  }));

const processSteps = [
  {
    title: "Select Your Item",
    copy: "Choose from our collection of custom golf accessories.",
    icon: "cart",
  },
  {
    title: "Personalize It",
    copy: "Add names, initials, logos, or your own design.",
    icon: "personalize",
  },
  {
    title: "Perfect for Gifting",
    copy: "Create something memorable for golfers, events, and special occasions.",
    icon: "gift",
  },
  {
    title: "Fast Turnaround",
    copy: "Quick production and reliable shipping get it to you on time.",
    icon: "truck",
  },
] as const;

const trustPoints = [
  {
    title: "Premium Quality",
    copy: "Crafted to last. Built for the course.",
    icon: "shield",
  },
  {
    title: "Made for You",
    copy: "Every detail reflects your game.",
    icon: "star",
  },
  {
    title: "Secure Ordering",
    copy: "Safe and simple Shopify checkout.",
    icon: "lock",
  },
  {
    title: "Here to Help",
    copy: "Questions? Our team is ready.",
    icon: "support",
  },
] as const;

type ProcessIconName =
  | (typeof processSteps)[number]["icon"]
  | (typeof trustPoints)[number]["icon"];

function ProcessIcon({ name }: { name: ProcessIconName }) {
  const commonProps = {
    viewBox: "0 0 64 64",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "cart") {
    return (
      <svg {...commonProps}>
        <path d="M8 13h7l5 28h27l7-20H18" />
        <path d="M27 21v20M38 21v20M18 30h32" />
        <circle cx="25" cy="50" r="3" />
        <circle cx="45" cy="50" r="3" />
        <path d="M49 10v8M45 14h8" />
      </svg>
    );
  }

  if (name === "personalize") {
    return (
      <svg {...commonProps}>
        <circle cx="27" cy="36" r="17" />
        <path d="M27 25v22M21 29h8a5 5 0 0 1 0 10h-8" />
        <path d="m39 20 11-11 5 5-11 11-8 3 3-8Z" />
      </svg>
    );
  }

  if (name === "gift") {
    return (
      <svg {...commonProps}>
        <path d="M10 27h44v29H10zM7 19h50v10H7zM32 19v37" />
        <path d="M32 19c-9 0-14-3-14-8 0-4 3-6 6-6 6 0 8 8 8 14ZM32 19c9 0 14-3 14-8 0-4-3-6-6-6-6 0-8 8-8 14Z" />
      </svg>
    );
  }

  if (name === "truck") {
    return (
      <svg {...commonProps}>
        <path d="M5 18h34v27H5zM39 28h10l9 10v7H39z" />
        <circle cx="17" cy="48" r="5" />
        <circle cx="49" cy="48" r="5" />
        <path d="M1 25h11M1 32h8M1 39h11" />
      </svg>
    );
  }

  if (name === "shield") {
    return (
      <svg {...commonProps}>
        <path d="M32 6c8 6 15 7 22 8v16c0 14-9 23-22 29C19 53 10 44 10 30V14c7-1 14-2 22-8Z" />
        <path d="m22 33 7 7 14-16" />
      </svg>
    );
  }

  if (name === "star") {
    return (
      <svg {...commonProps}>
        <path d="m32 6 8 17 19 2-14 13 4 19-17-9-17 9 4-19L5 25l19-2 8-17Z" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...commonProps}>
        <rect x="12" y="27" width="40" height="31" rx="3" />
        <path d="M21 27V17a11 11 0 0 1 22 0v10M32 40v7" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M10 35v-6a22 22 0 0 1 44 0v6" />
      <path d="M10 34H7a4 4 0 0 0-4 4v9a4 4 0 0 0 4 4h7V34ZM54 34h3a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-7V34Z" />
      <path d="M50 52c-3 5-8 7-15 7h-5" />
    </svg>
  );
}

export const revalidate = 300;

export default async function Home() {
  const [shopifyProducts, featuredCollectionGroups] = await Promise.all([
    fetchShopifyProducts(),
    fetchShopifyCollectionProductGroups(homepageFeaturedCollections),
  ]);
  const usingShopify = shopifyProducts !== null;
  const featuredProducts = usingShopify ? shopifyProducts : getAllProducts();

  return (
    <main className="home-page">
      <section className="home-hero" aria-label="Featured collection">
        <div className="home-hero-media" />
        <div className="container home-hero-layout">
          <div className="home-hero-content">
            <p className="home-eyebrow">Custom Golf Accessories</p>
            <h1>
              Your Game Feels Different
              <br />
              When It&apos;s Yours.
            </h1>
            <p className="home-hero-copy">
              Personalized golf accessories engineered to bring confidence, character, and a
              personal edge to every round.
            </p>
            <Link href="/shop" className="home-button">
              Shop Custom Golf Gear
            </Link>
          </div>
          <div className="hero-dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section className="home-categories" aria-labelledby="categories-heading">
        <h2 id="categories-heading" className="home-section-title">
          Browse By Category
        </h2>
        <div className="home-category-grid">
          {homepageCategories.map((category) => (
            <CategoryCard key={category.slug} category={category} />
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

      <FeaturedProductsCarousel
        products={featuredProducts}
        collectionGroups={usingShopify ? featuredCollectionGroups ?? [] : null}
      />

      <section className="home-process" aria-labelledby="home-process-heading">
        <div className="home-process-header">
          <p>How It Works</p>
          <div className="home-process-title-row">
            <span aria-hidden="true" />
            <h2 id="home-process-heading">Personalized Golf. Made Simple.</h2>
            <span aria-hidden="true" />
          </div>
          <p className="home-process-intro">
            From your idea to the course in just a few easy steps.
          </p>
        </div>

        <div className="home-process-grid">
          {processSteps.map((step, index) => (
            <article key={step.title} className="home-process-card">
              <div className="home-process-icon">
                <ProcessIcon name={step.icon} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3>{step.title}</h3>
              <span className="home-process-rule" aria-hidden="true" />
              <p>{step.copy}</p>
            </article>
          ))}
        </div>

        <div className="home-trust-row" aria-label="Why order from Signature Swings">
          {trustPoints.map((point) => (
            <article key={point.title} className="home-trust-point">
              <span className="home-trust-icon">
                <ProcessIcon name={point.icon} />
              </span>
              <div>
                <h3>{point.title}</h3>
                <p>{point.copy}</p>
              </div>
            </article>
          ))}
        </div>
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
          </Link>
        </div>
        <FaqList items={homepageFaqItems} variant="preview" />
      </section>
    </main>
  );
}
