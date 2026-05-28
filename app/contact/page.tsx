import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "../../components/contact-form";

export const metadata: Metadata = {
  title: "Contact Signature Swings",
  description:
    "Contact Signature Swings about custom golf accessories, personalized golf gifts, design help, and bulk custom golf accessory orders.",
};

const contactTopics = [
  {
    label: "?",
    title: "Product Questions",
    copy: "Not sure which ball marker, divot tool, ClubLink, or gift set is right for you? We're happy to help.",
  },
  {
    label: "2+",
    title: "Custom & Bulk Orders",
    copy: "Planning a tournament, wedding, corporate gift, or large order? Let's bring your vision to life.",
  },
  {
    label: "/",
    title: "Design Help",
    copy: "Need help with names, initials, logos, images, or a rough idea? Our team can assist.",
  },
];

const contactBenefits = [
  {
    label: "PQ",
    title: "Premium Quality",
    copy: "Crafted to the highest standards",
  },
  {
    label: "PY",
    title: "Personalized for You",
    copy: "Custom designs made to last",
  },
  {
    label: "GG",
    title: "Perfect for Any Occasion",
    copy: "Golf gifts that leave a lasting impression",
  },
  {
    label: "DS",
    title: "Dedicated Support",
    copy: "We're here to help every step of the way",
  },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-heading">
        <div className="contact-copy">
          <p className="contact-kicker">Contact Us</p>
          <h1 id="contact-heading">Contact Signature Swings</h1>
          <span className="contact-title-rule" aria-hidden="true" />
          <p className="contact-intro">
            Have a question about custom golf accessories, personalized gifts, bulk orders,
            or an existing project? Reach out and we'll help point you in the right direction.
          </p>

          <div className="contact-topic-list" aria-label="Common contact topics">
            {contactTopics.map((topic) => (
              <article key={topic.title} className="contact-topic-card">
                <span className="contact-topic-icon" aria-hidden="true">
                  {topic.label}
                </span>
                <div>
                  <h2>{topic.title}</h2>
                  <p>{topic.copy}</p>
                </div>
                <span className="contact-card-arrow" aria-hidden="true">
                  -&gt;
                </span>
              </article>
            ))}

            <article className="contact-topic-card contact-email-card">
              <span className="contact-topic-icon" aria-hidden="true">
                @
              </span>
              <div>
                <h2>Email us directly</h2>
                <a href="mailto:support@signatureswingsgolf.com">
                  support@signatureswingsgolf.com
                </a>
                <p>We typically respond within 1 business day.</p>
              </div>
            </article>

            <div className="contact-faq-strip">
              <span className="contact-faq-icon" aria-hidden="true">
                ?
              </span>
              <div>
                <h2>Looking for quick answers?</h2>
                <p>Browse our FAQs for ordering, customization, and shipping info.</p>
              </div>
              <Link href="/faq" className="contact-faq-link">
                Visit the FAQ
                <span aria-hidden="true">-&gt;</span>
              </Link>
            </div>
          </div>
        </div>

        <section className="contact-panel" aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading">Send Us a Message</h2>
          <ContactForm />
        </section>
      </section>

      <section className="contact-benefits" aria-label="Signature Swings contact benefits">
        {contactBenefits.map((benefit) => (
          <article key={benefit.title} className="contact-benefit">
            <span aria-hidden="true">{benefit.label}</span>
            <div>
              <h2>{benefit.title}</h2>
              <p>{benefit.copy}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
