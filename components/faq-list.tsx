import type { FaqItem } from "../lib/faq-content";

type FaqListProps = {
  items: FaqItem[];
  variant?: "full" | "preview";
};

export function FaqList({ items, variant = "full" }: FaqListProps) {
  const isPreview = variant === "preview";
  const Heading = isPreview ? "h3" : "h2";

  return (
    <dl className={isPreview ? "home-faq-grid" : "faq-list"}>
      {items.map((item) => (
        <div key={item.id} className={isPreview ? "faq-item home-faq-item" : "faq-item"}>
          <dt>
            <Heading>{item.question}</Heading>
          </dt>
          <dd>
            <p>{item.answer}</p>
          </dd>
        </div>
      ))}
    </dl>
  );
}
