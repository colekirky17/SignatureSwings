"use client";

import { FormEvent, useMemo, useState } from "react";

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
};

const initialFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  inquiryType: "",
  message: "",
};

function buildMailtoHref(formState: ContactFormState, fileName: string) {
  const subjectDetail = formState.inquiryType || "Website inquiry";
  const subject = `Signature Swings ${subjectDetail}`;
  const body = [
    `Name: ${formState.name}`,
    `Email: ${formState.email}`,
    `Phone: ${formState.phone || "Not provided"}`,
    `Inquiry type: ${formState.inquiryType || "Not selected"}`,
    fileName ? `Artwork/file selected: ${fileName}` : "Artwork/file selected: None",
    "",
    "Message:",
    formState.message,
  ].join("\n");

  return `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactForm() {
  const [formState, setFormState] = useState<ContactFormState>(initialFormState);
  const [fileName, setFileName] = useState("");
  const [hasOpenedDraft, setHasOpenedDraft] = useState(false);

  const mailtoHref = useMemo(
    () => buildMailtoHref(formState, fileName),
    [fileName, formState],
  );

  function updateField(field: keyof ContactFormState, value: string) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
    setHasOpenedDraft(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasOpenedDraft(true);
    window.location.href = mailtoHref;
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

      <label className="contact-file-drop">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf,.svg"
          onChange={(event) => {
            setFileName(event.target.files?.[0]?.name ?? "");
            setHasOpenedDraft(false);
          }}
        />
        <span className="contact-file-icon" aria-hidden="true">
          ^
        </span>
        <span>{fileName || "Drag and drop a file here"}</span>
        <strong>or click to browse</strong>
        <small>Accepted formats: JPG, PNG, PDF, SVG. Attach selected files after the email draft opens.</small>
      </label>

      <div className="contact-form-note">
        <span aria-hidden="true">i</span>
        <p>
          This opens a prefilled email draft for now. Online form submission will come later.
        </p>
      </div>

      <button type="submit" className="contact-submit-button">
        Open Email Draft
      </button>

      {hasOpenedDraft ? (
        <p className="contact-submit-status" role="status">
          Your email draft should be opening. If it does not, email us directly at{" "}
          <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
        </p>
      ) : null}
    </form>
  );
}
