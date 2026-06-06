"use client";

import { FormEvent, useState } from "react";

const inquiryTypes = [
  "Product question",
  "Custom order",
  "Bulk order",
  "Design help",
  "Existing project",
];

const supportEmail = "support@signatureswingsgolf.com";

type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  inquiryType: string;
  message: string;
  website: string;
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  inquiryType: "",
  message: "",
  website: "",
};

export function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(initialFormState);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  function updateField(field: keyof ContactFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
    setSubmitStatus("idle");
    setSubmitMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitStatus("submitting");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const result = (await response.json()) as {
        sent?: boolean;
        message?: string;
      };

      if (!response.ok || !result.sent) {
        throw new Error(result.message || "We could not send your message.");
      }

      setFormState(initialFormState);
      setSubmitStatus("success");
      setSubmitMessage("Thanks. Your message was sent to the Signature Swings team.");
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "We could not send your message.",
      );
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-grid">
        <label className="contact-field">
          <span>Name</span>
          <input
            value={formState.name}
            required
            type="text"
            autoComplete="name"
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>

        <label className="contact-field">
          <span>Email</span>
          <input
            value={formState.email}
            required
            type="email"
            autoComplete="email"
            onChange={(event) => updateField("email", event.target.value)}
          />
        </label>

        <label className="contact-field contact-field-wide">
          <span>Phone (optional)</span>
          <input
            value={formState.phone}
            type="tel"
            autoComplete="tel"
            onChange={(event) => updateField("phone", event.target.value)}
          />
        </label>

        <label className="contact-field contact-field-wide">
          <span>Inquiry Type</span>
          <select
            value={formState.inquiryType}
            required
            onChange={(event) => updateField("inquiryType", event.target.value)}
          >
            <option value="">Select an option</option>
            {inquiryTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="contact-field contact-field-wide">
          <span>Message</span>
          <textarea
            value={formState.message}
            required
            rows={5}
            placeholder="Tell us how we can help..."
            onChange={(event) => updateField("message", event.target.value)}
          />
        </label>
      </div>

      <label className="contact-honeypot" aria-hidden="true">
        <span>Website</span>
        <input
          type="text"
          name="website"
          value={formState.website}
          tabIndex={-1}
          autoComplete="off"
          onChange={(event) => updateField("website", event.target.value)}
        />
      </label>

      <div className="contact-form-note">
        <span aria-hidden="true">i</span>
        <p>
          Artwork uploads are not available yet. We will reply by email if we need a logo or
          reference file.
        </p>
      </div>

      <button
        type="submit"
        className="contact-submit-button"
        disabled={submitStatus === "submitting"}
      >
        {submitStatus === "submitting" ? "Sending..." : "Send Message"}
      </button>

      {submitMessage ? (
        <p
          className={`contact-submit-status is-${submitStatus}`}
          role={submitStatus === "error" ? "alert" : "status"}
        >
          {submitMessage}
          {submitStatus === "error" ? (
            <>
              {" "}
              You can also email{" "}
              <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
            </>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
