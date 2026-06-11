import type { Metadata } from "next";
import { FaqList } from "../../components/faq-list";
import { faqItems } from "../../lib/faq-content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers about custom golf accessories, custom golf ball markers, custom divot repair tools, personalized golf gifts, and bulk custom golf accessories.",
};

export default function FaqPage() {
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <main className="faq-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
      <section className="faq-header" aria-labelledby="faq-heading">
        <p className="faq-kicker">Customer Support</p>
        <h1 id="faq-heading">Frequently Asked Questions</h1>
        <p className="faq-intro">
          Learn more about our custom golf accessories, personalized golf gifts, and how to
          discuss custom or bulk order ideas while online inquiry tools are coming soon.
        </p>
      </section>

      <FaqList items={faqItems} />
    </main>
  );
}
