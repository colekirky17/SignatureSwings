"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type PersonalizationMethodId = "initials" | "logo" | "design";

type PersonalizationMethodOption = {
  id: PersonalizationMethodId;
  label: string;
  summary: string;
  reviewDesignEnabled: boolean;
};

type FontStyleOption = {
  id: string;
  label: string;
};

type ProductCustomizationFormProps = {
  productLabel?: string;
  bulkOrderHref?: string;
  methods?: PersonalizationMethodOption[];
  fontStyles?: FontStyleOption[];
};

const defaultPersonalizationMethods: PersonalizationMethodOption[] = [
  {
    id: "initials",
    label: "Use Initials",
    summary: "Add initials or short text.",
    reviewDesignEnabled: true,
  },
  {
    id: "logo",
    label: "Upload Logo",
    summary: "Use a logo or image file.",
    reviewDesignEnabled: true,
  },
  {
    id: "design",
    label: "Let Us Design It",
    summary: "Share your idea with our team.",
    reviewDesignEnabled: false,
  },
];

const defaultFontStyles: FontStyleOption[] = [
  { id: "classic", label: "Classic" },
  { id: "bold", label: "Bold" },
  { id: "script", label: "Script" },
  { id: "modern", label: "Modern" },
];

export function ProductCustomizationForm({
  productLabel = "Club Links",
  bulkOrderHref = "/contact",
  methods = defaultPersonalizationMethods,
  fontStyles = defaultFontStyles,
}: ProductCustomizationFormProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethodId, setSelectedMethodId] =
    useState<PersonalizationMethodId | null>(null);
  const [initials, setInitials] = useState("");
  const [selectedFontStyleId, setSelectedFontStyleId] = useState(fontStyles[0]?.id ?? "");
  const [designRequest, setDesignRequest] = useState("");

  const selectedMethod = useMemo(
    () => methods.find((method) => method.id === selectedMethodId) ?? null,
    [methods, selectedMethodId],
  );

  const hasRequiredCustomerDetails = name.trim().length > 0 && phoneNumber.trim().length > 0;
  const hasRequiredPersonalization =
    selectedMethodId === "initials"
      ? initials.trim().length > 0
      : selectedMethodId === "design"
        ? designRequest.trim().length > 0
        : selectedMethodId === "logo";
  const canAddToCart = hasRequiredCustomerDetails && hasRequiredPersonalization;
  const canReviewDesign = Boolean(selectedMethod?.reviewDesignEnabled);

  return (
    <section className="club-link-customizer" aria-labelledby="club-link-customizer-heading">
      <form
        className="club-link-customizer-main"
        onSubmit={(event) => event.preventDefault()}
      >
        <h2 id="club-link-customizer-heading">Customize Your {productLabel}</h2>

        <div className="club-link-required-grid">
          <label className="club-link-input-field">
            <span>
              Name <strong aria-hidden="true">*</strong>
            </span>
            <input
              type="text"
              name="customer-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., John Smith"
              autoComplete="name"
              required
            />
          </label>

          <label className="club-link-input-field">
            <span>
              Phone Number <strong aria-hidden="true">*</strong>
            </span>
            <input
              type="tel"
              name="phone-number"
              value={phoneNumber}
              onChange={(event) => setPhoneNumber(event.target.value)}
              placeholder="e.g., (800) 123-4561"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <fieldset className="club-link-method-block">
          <legend>Choose Your Personalization Method</legend>
          <p>
            Select one option below. You can use initials, upload a logo, or have us create a
            design for you.
          </p>
          <div className="club-link-method-grid" role="radiogroup">
            {methods.map((method) => {
              const isSelected = method.id === selectedMethodId;

              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`club-link-method-card${isSelected ? " is-selected" : ""}`}
                  onClick={() => setSelectedMethodId(method.id)}
                >
                  <span className="club-link-method-radio" aria-hidden="true" />
                  <span className="club-link-method-label">{method.label}</span>
                  <span className="club-link-method-summary">{method.summary}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {selectedMethodId === "initials" ? (
          <section
            className="club-link-personalization-panel"
            aria-labelledby="club-link-initials-heading"
          >
            <h3 id="club-link-initials-heading">Initials / Short Text</h3>
            <label className="club-link-input-field">
              <span>
                Initials / Short Text <strong aria-hidden="true">*</strong>
              </span>
              <input
                type="text"
                name="initials-short-text"
                value={initials}
                onChange={(event) => setInitials(event.target.value)}
                placeholder="e.g., JS"
                required
              />
            </label>

            <fieldset className="club-link-font-style-block">
              <legend>Font Style</legend>
              <div className="club-link-font-style-grid" role="radiogroup">
                {fontStyles.map((style) => {
                  const isSelected = style.id === selectedFontStyleId;

                  return (
                    <button
                      key={style.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`club-link-font-style${isSelected ? " is-selected" : ""}`}
                      onClick={() => setSelectedFontStyleId(style.id)}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>
        ) : null}

        {selectedMethodId === "logo" ? (
          <section
            className="club-link-personalization-panel"
            aria-labelledby="club-link-upload-heading"
          >
            <h3 id="club-link-upload-heading">Upload Logo/Image</h3>
            <div className="club-link-upload-coming-soon">
              <span>Upload Image</span>
              <p>
                Upload feature coming soon. This will support logo/image files for design preview
                and ordering.
              </p>
            </div>
          </section>
        ) : null}

        {selectedMethodId === "design" ? (
          <section
            className="club-link-personalization-panel"
            aria-labelledby="club-link-design-request-heading"
          >
            <label className="club-link-textarea-field">
              <span id="club-link-design-request-heading">
                Tell Us What You Want <strong aria-hidden="true">*</strong>
              </span>
              <textarea
                name="design-request"
                value={designRequest}
                onChange={(event) => setDesignRequest(event.target.value)}
                placeholder="Describe the design idea, theme, logo concept, initials, event, or style you want us to create."
                required
              />
            </label>
            <p className="club-link-method-helper">
              Our team will review your request and prepare a design direction before production.
            </p>
          </section>
        ) : null}

        <p className="club-link-preview-note" id="club-link-preview-helper">
          Design preview functionality will be added soon.
        </p>

        <div className="club-link-actions">
          <button type="button" className="club-link-primary-action" disabled={!canAddToCart}>
            ADD TO CART
          </button>
          <Link href={bulkOrderHref} className="club-link-secondary-action">
            REQUEST BULK ORDER
          </Link>
          <button
            type="button"
            className="club-link-preview-action"
            disabled={!canReviewDesign}
            aria-describedby="club-link-preview-helper"
          >
            REVIEW DESIGN
          </button>
        </div>
      </form>
    </section>
  );
}
