import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Order Inquiries",
  description:
    "Learn how to discuss ideas for custom golf accessories, personalized golf gifts, and bulk custom golf accessories with Signature Swings.",
};

export default function ContactPage() {
  return (
    <main className="page">
      <section className="page-header">
        <h1>Custom Order Inquiries</h1>
        <p className="page-intro">
          Interested in custom golf accessories, personalized golf gifts, or a bulk custom
          order? Our online inquiry form is coming soon. If you are already in contact with
          Signature Swings, please continue that conversation directly for now.
        </p>
      </section>

      <section className="form-card">
        <h2>Custom order inquiry coming soon</h2>
        <form className="form-grid" aria-label="Custom order inquiry form coming soon">
          <label className="field">
            Name
            <input
              type="text"
              disabled
              className="field-input"
            />
          </label>
          <label className="field">
            Email
            <input
              type="email"
              disabled
              className="field-input"
            />
          </label>
          <label className="field">
            Request details
            <textarea disabled rows={4} className="field-input" />
          </label>
          <button type="button" disabled className="button button-muted">
            Online Inquiry Coming Soon
          </button>
        </form>
      </section>
    </main>
  );
}
