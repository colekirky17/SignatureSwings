import Link from "next/link";
import type { ProductSummary } from "../lib/catalog";

type CompleteGolfSetupProps = {
  products: ProductSummary[];
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

export function CompleteGolfSetup({ products }: CompleteGolfSetupProps) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="club-link-upsell" aria-labelledby="complete-golf-setup-heading">
      <div className="club-link-upsell-heading">
        <h2 id="complete-golf-setup-heading">Complete Your Golf Setup</h2>
        <p>Add matching custom accessories to your order.</p>
      </div>
      <div className="club-link-upsell-grid">
        {products.map((item) => (
          <article key={item.handle} className="club-link-upsell-card">
            <Link href={`/shop/${item.handle}`} className="club-link-upsell-card-link">
              <div className="club-link-upsell-media">
                {item.image ? (
                  <img
                    src={item.image.url}
                    alt={item.image.altText || item.title}
                    width={item.image.width ?? undefined}
                    height={item.image.height ?? undefined}
                    loading="lazy"
                  />
                ) : (
                  <span>{item.imagePlaceholderLabel}</span>
                )}
              </div>
              <div className="club-link-upsell-body">
                <h3>{item.title}</h3>
                <p>{item.shortDescription}</p>
                <strong>{getDisplayPriceLabel(item.priceLabel)}</strong>
                <span className="club-link-upsell-action">Customize This</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
