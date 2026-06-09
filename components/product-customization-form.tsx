"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useRef, useState } from "react";
import { CartSuccessActions } from "./cart-success-actions";
import { ClubLinksPreviewModal } from "./club-links-preview-modal";
import { useProductVariant } from "./product-variant-context";
import { CUSTOMIZATION_REQUIRED_KEY } from "../lib/product-customization";

export type PersonalizationMethodId = "initials" | "logo" | "design";

export type PersonalizationMethodOption = {
  id: PersonalizationMethodId;
  label: string;
  summary: string;
  reviewDesignEnabled: boolean;
};

export type FontStyleOption = {
  id: string;
  label: string;
};

type ProductCustomizationFormProps = {
  productLabel?: string;
  bulkOrderHref?: string;
  methods?: PersonalizationMethodOption[];
  fontStyles?: FontStyleOption[];
  customerDetailsRequired?: boolean;
  methodDescription?: string;
  textHeading?: string;
  textLabel?: string;
  textPlaceholder?: string;
  textAttributeKey?: string;
  showFontStyles?: boolean;
  designPlaceholder?: string;
  clubLinksPreviewEnabled?: boolean;
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
  customerDetailsRequired = true,
  methodDescription = "Select one option below. You can use initials, upload a logo, or have us create a design for you.",
  textHeading = "Initials / Short Text",
  textLabel = "Initials / Short Text",
  textPlaceholder = "e.g., JS",
  textAttributeKey = "Initials / Short Text",
  showFontStyles = true,
  designPlaceholder = "Describe the design idea, theme, logo concept, initials, event, or style you want us to create.",
  clubLinksPreviewEnabled = false,
}: ProductCustomizationFormProps) {
  const {
    options,
    selectedOptions,
    selectedVariant,
    setSelectedOption,
  } = useProductVariant();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedMethodId, setSelectedMethodId] =
    useState<PersonalizationMethodId | null>(null);
  const [initials, setInitials] = useState("");
  const [selectedFontStyleId, setSelectedFontStyleId] = useState(fontStyles[0]?.id ?? "");
  const [designRequest, setDesignRequest] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [previewValidationMessage, setPreviewValidationMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const customizerRef = useRef<HTMLElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);

  const selectedMethod = useMemo(
    () => methods.find((method) => method.id === selectedMethodId) ?? null,
    [methods, selectedMethodId],
  );

  const hasRequiredCustomerDetails =
    !customerDetailsRequired ||
    (name.trim().length > 0 && phoneNumber.trim().length > 0);
  const hasRequiredPersonalization =
    selectedMethodId === "initials"
      ? initials.trim().length > 0
      : selectedMethodId === "design"
        ? designRequest.trim().length > 0
        : false;
  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    hasRequiredCustomerDetails &&
    hasRequiredPersonalization &&
    submitStatus !== "submitting";
  const previewMissingFields = useMemo(() => {
    if (!clubLinksPreviewEnabled) {
      return [];
    }

    const missingFields: string[] = [];

    if (!name.trim()) missingFields.push("Name");
    if (!phoneNumber.trim()) missingFields.push("Phone Number");
    if (!selectedMethodId) missingFields.push("Personalization Method");
    if (selectedMethodId === "initials" && !initials.trim()) {
      missingFields.push("Initials / Short Text");
    }
    if (selectedMethodId === "design" && !designRequest.trim()) {
      missingFields.push("Design Request");
    }

    return missingFields;
  }, [
    clubLinksPreviewEnabled,
    designRequest,
    initials,
    name,
    phoneNumber,
    selectedMethodId,
  ]);
  const canReviewDesign = clubLinksPreviewEnabled
    ? previewMissingFields.length === 0
    : Boolean(selectedMethod?.reviewDesignEnabled);
  const selectedFontStyle =
    fontStyles.find((style) => style.id === selectedFontStyleId) ?? fontStyles[0];

  function handleReviewDesign() {
    if (!clubLinksPreviewEnabled) {
      return;
    }

    if (previewMissingFields.length) {
      setPreviewValidationMessage(
        `Complete the following before reviewing your design: ${previewMissingFields.join(", ")}.`,
      );
      return;
    }

    setPreviewValidationMessage("");
    setIsPreviewOpen(true);
  }

  function clearPreviewValidation() {
    if (previewValidationMessage) {
      setPreviewValidationMessage("");
    }
  }

  function closePreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() => previewButtonRef.current?.focus());
  }

  function editPreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() => {
      customizerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      previewButtonRef.current?.focus();
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAddToCart || !selectedVariant || !selectedMethod) {
      return;
    }

    const attributes = [
      { key: CUSTOMIZATION_REQUIRED_KEY, value: "Yes" },
      { key: "Personalization Method", value: selectedMethod.label },
      customerDetailsRequired ? { key: "Name", value: name } : null,
      customerDetailsRequired ? { key: "Phone Number", value: phoneNumber } : null,
      selectedMethodId === "initials"
        ? { key: textAttributeKey, value: initials }
        : null,
      selectedMethodId === "initials" && showFontStyles
        ? {
            key: "Font Style",
            value:
              fontStyles.find((style) => style.id === selectedFontStyleId)?.label ??
              selectedFontStyleId,
          }
        : null,
      selectedMethodId === "design"
        ? { key: "Design Request", value: designRequest }
        : null,
    ].filter((attribute): attribute is { key: string; value: string } => Boolean(attribute));

    setSubmitStatus("submitting");
    setSubmitMessage("");

    try {
      const response = await fetch("/api/cart/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          attributes,
        }),
      });
      const result = (await response.json()) as {
        added?: boolean;
        totalQuantity?: number;
        message?: string;
      };

      if (!response.ok || !result.added) {
        throw new Error(result.message || "Could not add this item to the cart.");
      }

      setSubmitStatus("success");
      setSubmitMessage(
        `Added to cart. ${result.totalQuantity ?? 1} ${
          result.totalQuantity === 1 ? "item" : "items"
        } in cart.`,
      );
      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: { totalQuantity: result.totalQuantity ?? 1 },
        }),
      );
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Could not add this item to the cart.",
      );
    }
  }

  return (
    <section
      ref={customizerRef}
      className="club-link-customizer"
      aria-labelledby="club-link-customizer-heading"
    >
      <form className="club-link-customizer-main" onSubmit={handleSubmit}>
        <h2 id="club-link-customizer-heading">Customize Your {productLabel}</h2>

        {options.length ? (
          <fieldset className="product-variant-options">
            <legend>Choose Product Options</legend>
            <div className="product-variant-option-grid">
              {options.map((option) => (
                <label key={option.name} className="club-link-input-field">
                  <span>{option.name}</span>
                  <select
                    value={selectedOptions[option.name] ?? ""}
                    onChange={(event) =>
                      setSelectedOption(option.name, event.target.value)
                    }
                  >
                    {option.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </fieldset>
        ) : null}

        {customerDetailsRequired ? (
          <div className="club-link-required-grid">
            <label className="club-link-input-field">
              <span>
                Name <strong aria-hidden="true">*</strong>
              </span>
              <input
                type="text"
                name="customer-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  clearPreviewValidation();
                }}
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
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  clearPreviewValidation();
                }}
                placeholder="e.g., (800) 123-4561"
                autoComplete="tel"
                required
              />
            </label>
          </div>
        ) : null}

        <fieldset className="club-link-method-block">
          <legend>Choose Your Personalization Method</legend>
          <p>{methodDescription}</p>
          <div
            className={`club-link-method-grid${methods.length === 2 ? " is-two-options" : ""}`}
            role="radiogroup"
          >
            {methods.map((method) => {
              const isSelected = method.id === selectedMethodId;

              return (
                <button
                  key={method.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`club-link-method-card${isSelected ? " is-selected" : ""}`}
                  onClick={() => {
                    setSelectedMethodId(method.id);
                    clearPreviewValidation();
                  }}
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
            <h3 id="club-link-initials-heading">{textHeading}</h3>
            <label className="club-link-input-field">
              <span>
                {textLabel} <strong aria-hidden="true">*</strong>
              </span>
              <input
                type="text"
                name="initials-short-text"
                value={initials}
                onChange={(event) => {
                  setInitials(event.target.value);
                  clearPreviewValidation();
                }}
                placeholder={textPlaceholder}
                required
              />
            </label>

            {showFontStyles ? (
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
            ) : null}
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
                onChange={(event) => {
                  setDesignRequest(event.target.value);
                  clearPreviewValidation();
                }}
                placeholder={designPlaceholder}
                required
              />
            </label>
            <p className="club-link-method-helper">
              Our team will review your request and prepare a design direction before production.
            </p>
          </section>
        ) : null}

        <p className="club-link-preview-note" id="club-link-preview-helper">
          {clubLinksPreviewEnabled
            ? "Review an approximate engraving preview before adding this item to your cart."
            : "Design preview functionality will be added soon."}
        </p>

        <div className="club-link-actions">
          <button type="submit" className="club-link-primary-action" disabled={!canAddToCart}>
            {submitStatus === "submitting" ? "ADDING..." : "ADD TO CART"}
          </button>
          <Link href={bulkOrderHref} className="club-link-secondary-action">
            REQUEST BULK ORDER
          </Link>
          <button
            ref={previewButtonRef}
            type="button"
            className="club-link-preview-action"
            disabled={!clubLinksPreviewEnabled && !canReviewDesign}
            data-preview-incomplete={
              clubLinksPreviewEnabled && !canReviewDesign ? "true" : undefined
            }
            aria-describedby={
              previewValidationMessage
                ? "club-link-preview-validation"
                : "club-link-preview-helper"
            }
            onClick={handleReviewDesign}
          >
            REVIEW DESIGN
          </button>
        </div>
        {previewValidationMessage ? (
          <p
            id="club-link-preview-validation"
            className="club-link-preview-validation"
            role="alert"
          >
            {previewValidationMessage}
          </p>
        ) : null}
        {submitMessage ? (
          <>
            <p
              className={`cart-submit-status is-${submitStatus}`}
              role={submitStatus === "error" ? "alert" : "status"}
            >
              {submitMessage}
            </p>
            {submitStatus === "success" ? (
              <CartSuccessActions />
            ) : null}
          </>
        ) : null}
      </form>
      {clubLinksPreviewEnabled && selectedMethodId && selectedMethod ? (
        <ClubLinksPreviewModal
          isOpen={isPreviewOpen}
          name={name.trim()}
          phoneNumber={phoneNumber.trim()}
          methodId={selectedMethodId}
          methodLabel={selectedMethod.label}
          initials={initials.trim()}
          fontStyleId={selectedFontStyle?.id ?? "classic"}
          fontStyleLabel={selectedFontStyle?.label ?? "Classic"}
          designRequest={designRequest.trim()}
          onClose={closePreview}
          onEdit={editPreview}
        />
      ) : null}
    </section>
  );
}
