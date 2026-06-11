import type { FaqItem } from "../lib/faq-content";

type FaqListProps = {
  items: FaqItem[];
  variant?: "full" | "preview";
};

export function FaqList({ items, variant = "full" }: FaqListProps) {
  const isPreview = variant === "preview";

  if (isPreview) {
    return (
      <dl className="home-faq-grid">
        {items.map((item) => (
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
    );
  }

  return (
    <div className="faq-list">
      {items.map((item) => (
        <details key={item.id} className="faq-accordion">
          <summary>
            <span className="faq-accordion-question">{item.question}</span>
            <span className="faq-accordion-icon" aria-hidden="true" />
          </summary>
          <div className="faq-accordion-answer">
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
