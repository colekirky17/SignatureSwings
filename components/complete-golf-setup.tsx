import Link from "next/link";
import type { ProductSummary } from "../lib/catalog";

type CompleteGolfSetupProps = {
  products: ProductSummary[];
};

type UpsellCardDetails = {
  badge: string;
  badgeTone: "gold" | "green";
  description: string;
};

function getDisplayPriceLabel(priceLabel: string): string {
  const cleanPrice = priceLabel
    .replace(/\s*-\s*inquiry only\s*$/i, "")
    .replace(/\binquiry only\b/gi, "")
    .trim();

  if (!cleanPrice || /^pricing by inquiry$/i.test(cleanPrice)) {
    return "Price coming soon";
  }

  return cleanPrice;
}

function getUpsellCardDetails(product: ProductSummary): UpsellCardDetails {
  const productKeys = [
    product.categorySlug,
    product.title,
    product.handle,
    ...(product.collectionHandles ?? []),
    ...(product.collectionTitles ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");

  if (productKeys.includes("divot")) {
    return {
      badge: "Essential",
      badgeTone: "gold",
      description:
        "Enhance your golfing essentials with a personalized divot tool, expertly crafted from premium stainless steel and brass.",
    };
  }

  if (productKeys.includes("ball marker")) {
    return {
      badge: "Best Seller",
      badgeTone: "green",
      description:
        "Elevate your game with precision engraved ball markers, crafted for golfers who appreciate the details.",
    };
  }

  if (productKeys.includes("club link")) {
    return {
      badge: "Complete Set",
      badgeTone: "green",
      description:
        "Never lose a club again. Personalized Club Links keep your contact information attached so a found club can make its way back to you.",
    };
  }

  return {
    badge: "Made For You",
    badgeTone: "green",
    description: product.shortDescription,
  };
}

function getUpsellPriority(product: ProductSummary): number {
  const productKeys = [
    product.categorySlug,
    product.title,
    product.handle,
    ...(product.collectionHandles ?? []),
    ...(product.collectionTitles ?? []),
  ]
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ");

  if (productKeys.includes("divot")) {
    return 0;
  }

  if (productKeys.includes("ball marker")) {
    return 1;
  }

  if (productKeys.includes("club link")) {
    return 2;
  }

  return 3;
}

const setupBenefits = [
  {
    title: "Premium Quality",
    description: "Crafted to last, round after round.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M24 4 40 10v12c0 10-6.8 17.7-16 22-9.2-4.3-16-12-16-22V10z" />
        <path d="m17 24 5 5 10-11" />
      </svg>
    ),
  },
  {
    title: "Perfect Gift",
    description: "Thoughtful, personal, unforgettable.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M6 20h36v23H6zM4 13h40v9H4zM24 13v30" />
        <path d="M24 13H13c-4 0-6-2-6-5s2-5 5-5c6 0 12 10 12 10ZM24 13h11c4 0 6-2 6-5s-2-5-5-5c-6 0-12 10-12 10Z" />
      </svg>
    ),
  },
  {
    title: "Fast Shipping",
    description: "Quick turnaround, right to your door.",
    icon: (
      <svg viewBox="0 0 48 48">
        <path d="M4 11h25v23H4zM29 20h8l7 8v6H29z" />
        <circle cx="13" cy="37" r="5" />
        <circle cx="36" cy="37" r="5" />
        <path d="M29 28h15" />
      </svg>
    ),
  },
];

export function CompleteGolfSetup({ products }: CompleteGolfSetupProps) {
  if (!products.length) {
    return null;
  }

  const featuredProducts = [...products]
    .sort((left, right) => getUpsellPriority(left) - getUpsellPriority(right))
    .slice(0, 3);

  return (
    <section className="club-link-upsell" aria-labelledby="complete-golf-setup-heading">
      <div className="club-link-upsell-heading">
        <div className="club-link-upsell-crown" aria-hidden="true">
          <span />
          <svg viewBox="0 0 48 48">
            <path d="m7 15 9 8 8-15 8 15 9-8-4 21H11zM12 41h24" />
            <circle cx="7" cy="13" r="2" />
            <circle cx="24" cy="6" r="2" />
            <circle cx="41" cy="13" r="2" />
          </svg>
          <span />
        </div>
        <h2 id="complete-golf-setup-heading">Complete Your Golf Setup</h2>
        <p>Add matching custom accessories to your order.</p>
      </div>
      <div className="club-link-upsell-grid">
        {featuredProducts.map((item) => {
          const details = getUpsellCardDetails(item);

          return (
            <article
              key={item.handle}
              className={`club-link-upsell-card is-${details.badgeTone}`}
            >
              <Link href={`/shop/${item.handle}`} className="club-link-upsell-card-link">
                <div className="club-link-upsell-media">
                  <span
                    className={`club-link-upsell-badge is-${details.badgeTone}`}
                  >
                    <span aria-hidden="true">*</span>
                    {details.badge}
                  </span>
                  {item.image ? (
                    <img
                      src={item.image.url}
                      alt={item.image.altText || item.title}
                      width={item.image.width ?? undefined}
                      height={item.image.height ?? undefined}
                      loading="lazy"
                    />
                  ) : (
                    <span className="club-link-upsell-placeholder">
                      {item.imagePlaceholderLabel}
                    </span>
                  )}
                </div>
                <div className="club-link-upsell-body">
                  <h3>{item.title}</h3>
                  <span className="club-link-upsell-title-rule" aria-hidden="true" />
                  <p>{details.description}</p>
                  <strong>{getDisplayPriceLabel(item.priceLabel)}</strong>
                  <span className="club-link-upsell-action">
                    Customize Now
                    <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>

      <div className="club-link-upsell-benefits" aria-label="Product benefits">
        {setupBenefits.map((benefit) => (
          <article key={benefit.title} className="club-link-upsell-benefit">
            <span className="club-link-upsell-benefit-icon" aria-hidden="true">
              {benefit.icon}
            </span>
            <div>
              <h3>{benefit.title}</h3>
              <p>{benefit.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
