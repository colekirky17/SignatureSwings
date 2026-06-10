"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  logoUploadEnabled?: boolean;
};

type UploadedLogo = {
  fileId: string;
  fileName: string;
  previewUrl: string | null;
  url: string | null;
};

const MAX_LOGO_FILE_SIZE = 25 * 1024 * 1024;
const ACCEPTED_LOGO_FILE_TYPES = new Set(["image/png", "image/jpeg"]);
const ACCEPTED_LOGO_FILE_EXTENSIONS = /\.(?:png|jpe?g)$/i;
const UNSUPPORTED_LOGO_FILE_MESSAGE =
  "Please choose a PNG, JPG, or JPEG image. Other file types are not supported.";
const LOGO_PREVIEW_UNAVAILABLE_MESSAGE =
  "Preview unavailable for this artwork. Our design team will review your logo before production.";

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function getColorDistance(
  red: number,
  green: number,
  blue: number,
  background: RgbColor,
): number {
  return Math.sqrt(
    (red - background.red) ** 2 +
      (green - background.green) ** 2 +
      (blue - background.blue) ** 2,
  );
}

function getCornerBackgroundColor(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
): RgbColor {
  const sampleSize = Math.max(1, Math.floor(Math.min(width, height) * 0.04));
  const samples = [
    { startX: 0, startY: 0 },
    { startX: Math.max(0, width - sampleSize), startY: 0 },
    { startX: 0, startY: Math.max(0, height - sampleSize) },
    {
      startX: Math.max(0, width - sampleSize),
      startY: Math.max(0, height - sampleSize),
    },
  ];
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (const sample of samples) {
    for (let y = sample.startY; y < sample.startY + sampleSize; y += 1) {
      for (let x = sample.startX; x < sample.startX + sampleSize; x += 1) {
        const offset = (y * width + x) * 4;

        if (pixels[offset + 3] < 16) {
          continue;
        }

        red += pixels[offset];
        green += pixels[offset + 1];
        blue += pixels[offset + 2];
        count += 1;
      }
    }
  }

  return count
    ? { red: red / count, green: green / count, blue: blue / count }
    : { red: 255, green: 255, blue: 255 };
}

async function createEngravingPreviewUrl(file: File): Promise<string | null> {
  let bitmap: ImageBitmap | null = null;

  try {
    bitmap = await createImageBitmap(file);
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = width;
    sourceCanvas.height = height;
    const sourceContext = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!sourceContext) {
      return null;
    }

    sourceContext.drawImage(bitmap, 0, 0, width, height);
    const sourceImage = sourceContext.getImageData(0, 0, width, height);
    const pixels = sourceImage.data;
    const hasTransparency = pixels.some(
      (_, index) => index % 4 === 3 && pixels[index] < 250,
    );
    const background = getCornerBackgroundColor(pixels, width, height);
    const visibleMask = new Uint8ClampedArray(width * height);
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const pixelIndex = y * width + x;
        const offset = pixelIndex * 4;
        const alpha = pixels[offset + 3];
        const distance = getColorDistance(
          pixels[offset],
          pixels[offset + 1],
          pixels[offset + 2],
          background,
        );
        const engravingAlpha = hasTransparency
          ? alpha
          : Math.round(Math.min(255, Math.max(0, (distance - 18) * 7)));

        if (engravingAlpha < 20) {
          continue;
        }

        visibleMask[pixelIndex] = engravingAlpha;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    const padding = Math.max(2, Math.round(Math.max(width, height) * 0.015));
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);
    const outputWidth = maxX - minX + 1;
    const outputHeight = maxY - minY + 1;
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      return null;
    }

    const outputImage = outputContext.createImageData(outputWidth, outputHeight);

    for (let y = 0; y < outputHeight; y += 1) {
      for (let x = 0; x < outputWidth; x += 1) {
        const sourceIndex = (y + minY) * width + x + minX;
        const outputOffset = (y * outputWidth + x) * 4;
        outputImage.data[outputOffset] = 0;
        outputImage.data[outputOffset + 1] = 0;
        outputImage.data[outputOffset + 2] = 0;
        outputImage.data[outputOffset + 3] = visibleMask[sourceIndex];
      }
    }

    outputContext.putImageData(outputImage, 0, 0);
    const previewBlob = await new Promise<Blob | null>((resolve) => {
      outputCanvas.toBlob(resolve, "image/png");
    });

    return previewBlob ? URL.createObjectURL(previewBlob) : null;
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}

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
  logoUploadEnabled = false,
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
  const [uploadedLogo, setUploadedLogo] = useState<UploadedLogo | null>(null);
  const [logoUploadStatus, setLogoUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [logoUploadMessage, setLogoUploadMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [previewValidationMessage, setPreviewValidationMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const customizerRef = useRef<HTMLElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previewUrl = uploadedLogo?.previewUrl;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [uploadedLogo?.previewUrl]);

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
        : selectedMethodId === "logo"
          ? Boolean(uploadedLogo?.url)
          : false;
  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    hasRequiredCustomerDetails &&
    hasRequiredPersonalization &&
    submitStatus !== "submitting" &&
    logoUploadStatus !== "uploading";
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
    if (selectedMethodId === "logo" && !uploadedLogo) {
      missingFields.push("Logo Upload");
    }

    return missingFields;
  }, [
    clubLinksPreviewEnabled,
    designRequest,
    initials,
    name,
    phoneNumber,
    selectedMethodId,
    uploadedLogo,
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

    if (selectedMethodId === "logo" && !uploadedLogo) {
      setPreviewValidationMessage("Please upload your logo before reviewing the design.");
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

  async function handleLogoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadedLogo(null);
    setLogoUploadStatus("idle");
    setLogoUploadMessage("");
    clearPreviewValidation();

    if (file.size > MAX_LOGO_FILE_SIZE) {
      setLogoUploadStatus("error");
      setLogoUploadMessage(
        "This file is too large for upload. Please choose ‘Let Us Design It’ and describe what you want created.",
      );
      return;
    }

    const isAcceptedType =
      ACCEPTED_LOGO_FILE_TYPES.has(file.type) &&
      ACCEPTED_LOGO_FILE_EXTENSIONS.test(file.name);

    if (!isAcceptedType) {
      setLogoUploadStatus("error");
      setLogoUploadMessage(UNSUPPORTED_LOGO_FILE_MESSAGE);
      return;
    }

    setLogoUploadStatus("uploading");
    setLogoUploadMessage(`Preparing ${file.name} for preview...`);
    const previewUrl = await createEngravingPreviewUrl(file);

    setUploadedLogo({
      fileId: `preview-${file.lastModified}-${file.size}`,
      fileName: file.name,
      previewUrl,
      url: null,
    });
    setLogoUploadStatus("success");
    setLogoUploadMessage(
      previewUrl ? "Logo uploaded for preview." : LOGO_PREVIEW_UNAVAILABLE_MESSAGE,
    );
  }

  function removeUploadedLogo() {
    setUploadedLogo(null);
    setLogoUploadStatus("idle");
    setLogoUploadMessage("");
    logoInputRef.current?.focus();
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
      selectedMethodId === "logo" && uploadedLogo?.url
        ? { key: "Logo Upload", value: uploadedLogo.url }
        : null,
      selectedMethodId === "logo" && uploadedLogo?.url
        ? { key: "Logo File Name", value: uploadedLogo.fileName }
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
            {logoUploadEnabled ? (
              <div className="club-link-upload-control">
                <input
                  ref={logoInputRef}
                  className="club-link-file-input"
                  type="file"
                  name="logo-image"
                  accept="image/png,image/jpeg,.png,.jpg,.jpeg"
                  onChange={handleLogoFileChange}
                  disabled={logoUploadStatus === "uploading"}
                  hidden
                />
                <button
                  type="button"
                  className="club-link-upload-button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={logoUploadStatus === "uploading"}
                >
                  {logoUploadStatus === "uploading"
                    ? "Uploading..."
                    : uploadedLogo
                      ? "Replace Image"
                      : "Choose Image"}
                </button>
                <p className="club-link-upload-guidance">
                  PNG, JPG, or JPEG files up to 25 MB. Artwork is automatically fitted and
                  shown as a black engraving preview.
                </p>
                {uploadedLogo ? (
                  <div className="club-link-upload-file">
                    <span aria-hidden="true">Uploaded</span>
                    <strong>{uploadedLogo.fileName}</strong>
                    <button type="button" onClick={removeUploadedLogo}>
                      Remove
                    </button>
                  </div>
                ) : null}
                {logoUploadMessage ? (
                  <p
                    className={`club-link-upload-status is-${logoUploadStatus}`}
                    role={logoUploadStatus === "error" ? "alert" : "status"}
                  >
                    {logoUploadMessage}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="club-link-upload-coming-soon">
                <span>Upload Image</span>
                <p>
                  Upload feature coming soon. This will support logo/image files for design
                  preview and ordering.
                </p>
              </div>
            )}
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
          logoFileName={uploadedLogo?.fileName ?? ""}
          logoPreviewUrl={uploadedLogo?.previewUrl ?? ""}
          onClose={closePreview}
          onEdit={editPreview}
        />
      ) : null}
    </section>
  );
}
