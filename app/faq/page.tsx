import type { Metadata } from "next";
import { faqItems } from "../../lib/faq-content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Signature Swings",
  description:
    "Answers about custom golf accessories, custom golf ball markers, personalized golf gifts, and bulk custom golf accessory orders.",
};

export default function FaqPage() {
  return (
    <main className="faq-page">
      <section className="faq-header" aria-labelledby="faq-heading">
        <p className="faq-kicker">Customer Support</p>
        <h1 id="faq-heading">Frequently Asked Questions</h1>
        <p className="faq-intro">
          Learn more about our custom golf accessories, personalized golf gifts, and how to
          discuss custom or bulk order ideas while online inquiry tools are coming soon.
        </p>
      </section>

      <dl className="faq-list">
        {faqItems.map((item) => (
          <div key={item.id} className="faq-item">
            <dt>
              <h2>{item.question}</h2>
            </dt>
            <dd>
              <p>{item.answer}</p>
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
