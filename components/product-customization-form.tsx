"use client";

import Link from "next/link";
import {
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BallMarkerPreviewModal,
  type BallMarkerPreviewSide,
} from "./ball-marker-preview-modal";
import { CartSuccessActions } from "./cart-success-actions";
import { ClubLinksPreviewModal } from "./club-links-preview-modal";
import {
  DivotToolPreviewModal,
  engravingFontFamilies,
} from "./divot-tool-preview-modal";
import { useProductVariant } from "./product-variant-context";
import {
  CUSTOMIZATION_REQUIRED_KEY,
  DIVOT_TOOL_MAX_CHARACTERS,
} from "../lib/product-customization";
import type { ProductColorOption } from "../lib/catalog";
import { trackMetaStandardEvent } from "../lib/analytics";

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
  ballMarkerSides?: 1 | 2;
  colorOptions?: ProductColorOption[];
  divotToolPreviewEnabled?: boolean;
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

const NAMED_COLOR_SWATCHES: Record<string, string> = {
  black: "#171717",
  blue: "#2563eb",
  bronze: "#a97142",
  copper: "#b87333",
  gold: "#d6a400",
  gray: "#8b9290",
  green: "#24834b",
  grey: "#8b9290",
  red: "#c83c3c",
  silver: "#c5c8ca",
  white: "#f4f4f0",
};

function getColorSwatch(option: ProductColorOption): string {
  const normalizedName = option.name.trim().toLowerCase();
  const namedColor = Object.entries(NAMED_COLOR_SWATCHES).find(([name]) =>
    normalizedName.includes(name),
  )?.[1];

  return option.swatch || namedColor || "#607269";
}

function getDefaultBallMarkerColor(colorOptions: ProductColorOption[]): string {
  return (
    colorOptions.find((option) =>
      option.name.trim().toLowerCase().includes("silver"),
    )?.name ??
    (colorOptions.length === 1 ? colorOptions[0].name : "")
  );
}

function ProductColorPicker({
  colorOptions,
  selectedColor,
  onSelect,
}: {
  colorOptions: ProductColorOption[];
  selectedColor: string;
  onSelect: (color: string) => void;
}) {
  if (!colorOptions.length) {
    return null;
  }

  return (
    <fieldset className="product-color-options">
      <legend>
        Color <strong aria-hidden="true">*</strong>
      </legend>
      <div className="product-color-option-grid" role="radiogroup">
        {colorOptions.map((option) => {
          const isSelected = selectedColor === option.name;
          const style = {
            "--product-color-swatch": getColorSwatch(option),
          } as CSSProperties;

          return (
            <button
              key={option.name}
              type="button"
              role="radio"
              aria-checked={isSelected}
              className={`product-color-option${isSelected ? " is-selected" : ""}`}
              onClick={() => onSelect(option.name)}
              style={style}
            >
              <span className="product-color-swatch" aria-hidden="true" />
              <span>{option.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

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
    let alphaTotal = 0;
    let weightedX = 0;
    let weightedY = 0;

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
        alphaTotal += engravingAlpha;
        weightedX += x * engravingAlpha;
        weightedY += y * engravingAlpha;
      }
    }

    if (maxX < minX || maxY < minY) {
      return null;
    }

    const padding = Math.max(2, Math.round(Math.max(width, height) * 0.015));
    const centerX = weightedX / alphaTotal;
    const centerY = weightedY / alphaTotal;
    const horizontalExtent = Math.max(centerX - minX, maxX - centerX);
    const verticalExtent = Math.max(centerY - minY, maxY - centerY);
    const outputWidth = Math.max(1, Math.ceil(horizontalExtent * 2) + padding * 2);
    const outputHeight = Math.max(1, Math.ceil(verticalExtent * 2) + padding * 2);
    const offsetX = Math.round(outputWidth / 2 - (centerX - minX));
    const offsetY = Math.round(outputHeight / 2 - (centerY - minY));
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = outputWidth;
    outputCanvas.height = outputHeight;
    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      return null;
    }

    const outputImage = outputContext.createImageData(outputWidth, outputHeight);

    for (let sourceY = minY; sourceY <= maxY; sourceY += 1) {
      for (let sourceX = minX; sourceX <= maxX; sourceX += 1) {
        const outputX = sourceX - minX + offsetX;
        const outputY = sourceY - minY + offsetY;

        if (
          outputX < 0 ||
          outputY < 0 ||
          outputX >= outputWidth ||
          outputY >= outputHeight
        ) {
          continue;
        }

        const sourceIndex = sourceY * width + sourceX;
        const outputOffset = (outputY * outputWidth + outputX) * 4;
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

function BallMarkerCustomizationForm({
  productLabel = "Ball Markers",
  bulkOrderHref = "/contact",
  methods = defaultPersonalizationMethods,
  logoUploadEnabled = false,
  ballMarkerSides = 1,
  colorOptions = [],
}: ProductCustomizationFormProps) {
  const {
    options,
    selectedOptions,
    selectedVariant,
    setSelectedOption,
  } = useProductVariant();
  const availableMethods = methods.filter(
    (method) => method.id !== "logo" || logoUploadEnabled,
  );
  const [frontMethodId, setFrontMethodId] =
    useState<PersonalizationMethodId | null>(null);
  const [backMethodId, setBackMethodId] =
    useState<PersonalizationMethodId | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [frontDesignRequest, setFrontDesignRequest] = useState("");
  const [backDesignRequest, setBackDesignRequest] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    getDefaultBallMarkerColor(colorOptions),
  );
  const [frontUploadedLogo, setFrontUploadedLogo] = useState<UploadedLogo | null>(null);
  const [backUploadedLogo, setBackUploadedLogo] = useState<UploadedLogo | null>(null);
  const [frontLogoUploadStatus, setFrontLogoUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [backLogoUploadStatus, setBackLogoUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [frontLogoUploadMessage, setFrontLogoUploadMessage] = useState("");
  const [backLogoUploadMessage, setBackLogoUploadMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [previewValidationMessage, setPreviewValidationMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const customizerRef = useRef<HTMLElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);
  const frontLogoInputRef = useRef<HTMLInputElement>(null);
  const backLogoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previewUrl = frontUploadedLogo?.previewUrl;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [frontUploadedLogo?.previewUrl]);

  useEffect(() => {
    const previewUrl = backUploadedLogo?.previewUrl;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [backUploadedLogo?.previewUrl]);

  const frontMethod =
    availableMethods.find((method) => method.id === frontMethodId) ?? null;
  const backMethod =
    availableMethods.find((method) => method.id === backMethodId) ?? null;
  const selectedColorOption =
    colorOptions.find((option) => option.name === selectedColor) ?? null;
  const previewFinishName = selectedColorOption?.name ?? "Silver";
  const previewFinishColor = selectedColorOption
    ? getColorSwatch(selectedColorOption)
    : NAMED_COLOR_SWATCHES.silver;
  const isFrontComplete =
    frontMethodId === "initials"
      ? Boolean(frontText.trim())
      : frontMethodId === "logo"
        ? Boolean(frontUploadedLogo)
      : frontMethodId === "design"
        ? Boolean(frontDesignRequest.trim())
        : false;
  const isBackComplete =
    backMethodId === "initials"
      ? Boolean(backText.trim())
      : backMethodId === "logo"
        ? Boolean(backUploadedLogo)
      : backMethodId === "design"
        ? Boolean(backDesignRequest.trim())
        : false;
  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    isFrontComplete &&
    (ballMarkerSides === 1 || isBackComplete) &&
    (!colorOptions.length || Boolean(selectedColor)) &&
    frontLogoUploadStatus !== "uploading" &&
    (ballMarkerSides === 1 || backLogoUploadStatus !== "uploading") &&
    submitStatus !== "submitting";

  function getSideAttributes(
    sideLabel: "Front" | "Back",
    methodId: PersonalizationMethodId,
    method: PersonalizationMethodOption,
    text: string,
    designRequest: string,
    uploadedLogo: UploadedLogo | null,
  ) {
    return [
      { key: `${sideLabel} Personalization Method`, value: method.label },
      methodId === "initials"
        ? { key: `${sideLabel} Short Text / Initials`, value: text }
        : null,
      methodId === "design"
        ? { key: `${sideLabel} Design Request`, value: designRequest }
        : null,
      methodId === "logo" && uploadedLogo
        ? { key: `${sideLabel} Logo File Name`, value: uploadedLogo.fileName }
        : null,
    ].filter((attribute): attribute is { key: string; value: string } => Boolean(attribute));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !canAddToCart ||
      !selectedVariant ||
      !frontMethod ||
      (ballMarkerSides === 2 && !backMethod)
    ) {
      return;
    }

    const attributes = [
      { key: CUSTOMIZATION_REQUIRED_KEY, value: "Yes" },
      selectedColor ? { key: "Color", value: selectedColor } : null,
      ...getSideAttributes(
        "Front",
        frontMethodId,
        frontMethod,
        frontText,
        frontDesignRequest,
        frontUploadedLogo,
      ),
      ...(ballMarkerSides === 2 && backMethod
        ? getSideAttributes(
            "Back",
            backMethodId as PersonalizationMethodId,
            backMethod,
            backText,
            backDesignRequest,
            backUploadedLogo,
          )
        : []),
    ].filter((attribute): attribute is { key: string; value: string } =>
      Boolean(attribute),
    );

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
      trackMetaStandardEvent("AddToCart", {
        content_ids: [selectedVariant.id],
        content_type: "product",
        currency: selectedVariant.price.currencyCode,
        value: Number(selectedVariant.price.amount),
      });
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Could not add this item to the cart.",
      );
    }
  }

  async function handleSideLogoFileChange(
    side: "front" | "back",
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const setUploadedLogo = side === "front" ? setFrontUploadedLogo : setBackUploadedLogo;
    const setUploadStatus =
      side === "front" ? setFrontLogoUploadStatus : setBackLogoUploadStatus;
    const setUploadMessage =
      side === "front" ? setFrontLogoUploadMessage : setBackLogoUploadMessage;

    setUploadedLogo(null);
    setUploadStatus("idle");
    setUploadMessage("");
    setPreviewValidationMessage("");

    if (file.size > MAX_LOGO_FILE_SIZE) {
      setUploadStatus("error");
      setUploadMessage(
        "This file is too large for upload. Please choose ‘Let Us Design It’ and describe what you want created.",
      );
      return;
    }

    const isAcceptedType =
      ACCEPTED_LOGO_FILE_TYPES.has(file.type) &&
      ACCEPTED_LOGO_FILE_EXTENSIONS.test(file.name);

    if (!isAcceptedType) {
      setUploadStatus("error");
      setUploadMessage(UNSUPPORTED_LOGO_FILE_MESSAGE);
      return;
    }

    setUploadStatus("uploading");
    setUploadMessage(`Preparing ${file.name} for preview...`);
    const previewUrl = await createEngravingPreviewUrl(file);

    setUploadedLogo({
      fileId: `preview-${file.lastModified}-${file.size}`,
      fileName: file.name,
      previewUrl,
      url: null,
    });
    setUploadStatus("success");
    setUploadMessage(
      previewUrl ? "Logo uploaded for preview." : LOGO_PREVIEW_UNAVAILABLE_MESSAGE,
    );
  }

  function removeSideLogo(side: "front" | "back") {
    if (side === "front") {
      setFrontUploadedLogo(null);
      setFrontLogoUploadStatus("idle");
      setFrontLogoUploadMessage("");
      frontLogoInputRef.current?.focus();
    } else {
      setBackUploadedLogo(null);
      setBackLogoUploadStatus("idle");
      setBackLogoUploadMessage("");
      backLogoInputRef.current?.focus();
    }
  }

  function handleReviewDesign() {
    const missingSides = [
      colorOptions.length && !selectedColor ? "Color" : null,
      !isFrontComplete ? "Front Design" : null,
      ballMarkerSides === 2 && !isBackComplete ? "Back Design" : null,
    ].filter((value): value is string => Boolean(value));

    if (missingSides.length) {
      setPreviewValidationMessage(
        `Complete the following before reviewing your design: ${missingSides.join(", ")}.`,
      );
      return;
    }

    setPreviewValidationMessage("");
    setIsPreviewOpen(true);
  }

  function closePreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() =>
      previewButtonRef.current?.focus({ preventScroll: true }),
    );
  }

  function editPreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() => {
      customizerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      previewButtonRef.current?.focus();
    });
  }

  function renderSide(
    side: "front" | "back",
    selectedMethodId: PersonalizationMethodId | null,
    setSelectedMethodId: (methodId: PersonalizationMethodId) => void,
    text: string,
    setText: (value: string) => void,
    designRequest: string,
    setDesignRequest: (value: string) => void,
    uploadedLogo: UploadedLogo | null,
    logoUploadStatus: "idle" | "uploading" | "success" | "error",
    logoUploadMessage: string,
    logoInputRef: RefObject<HTMLInputElement | null>,
  ) {
    const title = side === "front" ? "Front Design" : "Back Design";

    return (
      <section className="ball-marker-side-panel" aria-labelledby={`ball-marker-${side}-heading`}>
        <div className="ball-marker-side-heading">
          <span>{side === "front" ? "1" : "2"}</span>
          <h3 id={`ball-marker-${side}-heading`}>{title}</h3>
        </div>
        <p>Choose how you want to personalize the {side} of your ball marker.</p>
        <div className="club-link-method-grid" role="radiogroup">
          {availableMethods.map((method) => {
            const isSelected = method.id === selectedMethodId;

            return (
              <button
                key={`${side}-${method.id}`}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`club-link-method-card${isSelected ? " is-selected" : ""}`}
                onClick={() => {
                  setSelectedMethodId(method.id);
                  setPreviewValidationMessage("");
                }}
              >
                <span className="club-link-method-radio" aria-hidden="true" />
                <span className="club-link-method-label">{method.label}</span>
                <span className="club-link-method-summary">{method.summary}</span>
              </button>
            );
          })}
        </div>

        {selectedMethodId === "initials" ? (
          <label className="club-link-input-field ball-marker-side-field">
            <span>
              Short Text / Initials <strong aria-hidden="true">*</strong>
            </span>
            <input
              type="text"
              name={`${side}-short-text-initials`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="e.g., CK or Birdie Club"
              required
            />
          </label>
        ) : null}

        {selectedMethodId === "logo" ? (
          <div className="club-link-upload-control ball-marker-side-field">
            <input
              ref={logoInputRef}
              className="club-link-file-input"
              type="file"
              name={`${side}-logo-image`}
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              onChange={(event) => handleSideLogoFileChange(side, event)}
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
              PNG, JPG, or JPEG files up to 25 MB. Artwork is fitted to the center and shown as
              a black engraving preview.
            </p>
            {uploadedLogo ? (
              <div className="club-link-upload-file">
                <span aria-hidden="true">Uploaded</span>
                <strong>{uploadedLogo.fileName}</strong>
                <button type="button" onClick={() => removeSideLogo(side)}>
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
        ) : null}

        {selectedMethodId === "design" ? (
          <label className="club-link-textarea-field ball-marker-side-field">
            <span>
              Describe Your {title} <strong aria-hidden="true">*</strong>
            </span>
            <textarea
              name={`${side}-design-request`}
              value={designRequest}
              onChange={(event) => setDesignRequest(event.target.value)}
              placeholder={`Describe what you want on the ${side} of the ball marker.`}
              required
            />
          </label>
        ) : null}
      </section>
    );
  }

  return (
    <section
      ref={customizerRef}
      className="club-link-customizer"
      aria-labelledby="ball-marker-customizer-heading"
    >
      <form className="club-link-customizer-main" onSubmit={handleSubmit}>
        <h2 id="ball-marker-customizer-heading">Customize Your {productLabel}</h2>
        <p className="ball-marker-customizer-intro">
          {ballMarkerSides === 2
            ? "Create separate designs for the front and back of your ball marker."
            : "Create a design for the customizable side of your ball marker."}
        </p>

        <ProductColorPicker
          colorOptions={colorOptions}
          selectedColor={selectedColor}
          onSelect={(color) => {
            setSelectedColor(color);
            setPreviewValidationMessage("");
          }}
        />

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

        <div className="ball-marker-side-grid">
          {renderSide(
            "front",
            frontMethodId,
            setFrontMethodId,
            frontText,
            setFrontText,
            frontDesignRequest,
            setFrontDesignRequest,
            frontUploadedLogo,
            frontLogoUploadStatus,
            frontLogoUploadMessage,
            frontLogoInputRef,
          )}
          {ballMarkerSides === 2
            ? renderSide(
                "back",
                backMethodId,
                setBackMethodId,
                backText,
                setBackText,
                backDesignRequest,
                setBackDesignRequest,
                backUploadedLogo,
                backLogoUploadStatus,
                backLogoUploadMessage,
                backLogoInputRef,
              )
            : null}
        </div>

        <p className="club-link-preview-note" id="ball-marker-preview-helper">
          Review an approximate engraving preview before adding this item to your cart.
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
            data-preview-incomplete={
              !isFrontComplete || (ballMarkerSides === 2 && !isBackComplete)
                ? "true"
                : undefined
            }
            aria-describedby={
              previewValidationMessage
                ? "ball-marker-preview-validation"
                : "ball-marker-preview-helper"
            }
            onClick={handleReviewDesign}
          >
            REVIEW DESIGN
          </button>
        </div>
        {previewValidationMessage ? (
          <p
            id="ball-marker-preview-validation"
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
            {submitStatus === "success" ? <CartSuccessActions /> : null}
          </>
        ) : null}
      </form>
      <BallMarkerPreviewModal
        isOpen={isPreviewOpen}
        finishName={previewFinishName}
        finishColor={previewFinishColor}
        sides={
          [
            frontMethod
              ? {
                  side: "front",
                  methodId: frontMethod.id,
                  methodLabel: frontMethod.label,
                  text: frontText.trim(),
                  designRequest: frontDesignRequest.trim(),
                  logoFileName: frontUploadedLogo?.fileName ?? "",
                  logoPreviewUrl: frontUploadedLogo?.previewUrl ?? "",
                }
              : null,
            ballMarkerSides === 2 && backMethod
              ? {
                  side: "back",
                  methodId: backMethod.id,
                  methodLabel: backMethod.label,
                  text: backText.trim(),
                  designRequest: backDesignRequest.trim(),
                  logoFileName: backUploadedLogo?.fileName ?? "",
                  logoPreviewUrl: backUploadedLogo?.previewUrl ?? "",
                }
              : null,
          ].filter((side): side is BallMarkerPreviewSide => Boolean(side))
        }
        onClose={closePreview}
        onEdit={editPreview}
      />
    </section>
  );
}

function DivotToolCustomizationForm({
  productLabel = "Divot Tool",
  bulkOrderHref = "/contact",
  fontStyles = defaultFontStyles,
  colorOptions = [],
}: ProductCustomizationFormProps) {
  const {
    options,
    selectedOptions,
    selectedVariant,
    setSelectedOption,
  } = useProductVariant();
  const [engravingText, setEngravingText] = useState("");
  const [selectedFontStyleId, setSelectedFontStyleId] = useState(
    fontStyles[0]?.id ?? "classic",
  );
  const [selectedColor, setSelectedColor] = useState(
    colorOptions.length === 1 ? colorOptions[0].name : "",
  );
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const customizerRef = useRef<HTMLElement>(null);
  const previewButtonRef = useRef<HTMLButtonElement>(null);

  const trimmedText = engravingText.trim();
  const isTextTooLong = engravingText.length > DIVOT_TOOL_MAX_CHARACTERS;
  const hasValidText = Boolean(trimmedText) && !isTextTooLong;
  const hasRequiredColor = !colorOptions.length || Boolean(selectedColor);
  const selectedFontStyle =
    fontStyles.find((style) => style.id === selectedFontStyleId) ?? fontStyles[0];
  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) &&
    hasValidText &&
    hasRequiredColor &&
    submitStatus !== "submitting";

  function getValidationMessage(): string {
    if (!trimmedText) {
      return "Enter the engraving text before reviewing your design.";
    }

    if (isTextTooLong) {
      return `Keep the engraving to ${DIVOT_TOOL_MAX_CHARACTERS} characters or fewer so it fits cleanly on the tool.`;
    }

    if (!hasRequiredColor) {
      return "Choose a color before reviewing your design.";
    }

    return "";
  }

  function handleReviewDesign() {
    const message = getValidationMessage();

    if (message) {
      setValidationMessage(message);
      return;
    }

    setValidationMessage("");
    setIsPreviewOpen(true);
  }

  function closePreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() =>
      previewButtonRef.current?.focus({ preventScroll: true }),
    );
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

    if (!selectedVariant || !canAddToCart || !selectedFontStyle) {
      setValidationMessage(getValidationMessage());
      return;
    }

    const attributes = [
      { key: CUSTOMIZATION_REQUIRED_KEY, value: "Yes" },
      { key: "Personalization Method", value: "Engraving Text" },
      { key: "Name or Message", value: trimmedText },
      { key: "Font Style", value: selectedFontStyle.label },
      selectedColor ? { key: "Color", value: selectedColor } : null,
    ].filter((attribute): attribute is { key: string; value: string } =>
      Boolean(attribute),
    );

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
      trackMetaStandardEvent("AddToCart", {
        content_ids: [selectedVariant.id],
        content_type: "product",
        currency: selectedVariant.price.currencyCode,
        value: Number(selectedVariant.price.amount),
      });
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
      className="club-link-customizer divot-tool-customizer"
      aria-labelledby="divot-tool-customizer-heading"
    >
      <form className="club-link-customizer-main" onSubmit={handleSubmit}>
        <h2 id="divot-tool-customizer-heading">Customize Your {productLabel}</h2>
        <p className="divot-tool-customizer-intro">
          Add one line of engraving text and choose the style that fits it best.
        </p>

        <ProductColorPicker
          colorOptions={colorOptions}
          selectedColor={selectedColor}
          onSelect={(color) => {
            setSelectedColor(color);
            setValidationMessage("");
          }}
        />

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

        <section
          className="club-link-personalization-panel"
          aria-labelledby="divot-tool-engraving-heading"
        >
          <h3 id="divot-tool-engraving-heading">Engraving Details</h3>
          <label className="club-link-input-field">
            <span>
              Engraving Text <strong aria-hidden="true">*</strong>
            </span>
            <input
              type="text"
              name="divot-tool-engraving-text"
              value={engravingText}
              onChange={(event) => {
                setEngravingText(event.target.value);
                setValidationMessage("");
              }}
              placeholder="e.g., Four Amigos"
              aria-invalid={isTextTooLong || undefined}
              aria-describedby="divot-tool-character-count"
              required
            />
          </label>
          <p
            id="divot-tool-character-count"
            className={`divot-tool-character-count${isTextTooLong ? " is-error" : ""}`}
          >
            {engravingText.length}/{DIVOT_TOOL_MAX_CHARACTERS} characters
          </p>

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
                    className={`club-link-font-style is-${style.id}${
                      isSelected ? " is-selected" : ""
                    }`}
                    style={{
                      fontFamily:
                        engravingFontFamilies[style.id] ??
                        engravingFontFamilies.classic,
                    }}
                    onClick={() => setSelectedFontStyleId(style.id)}
                  >
                    {style.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </section>

        <p className="club-link-preview-note" id="divot-tool-preview-helper">
          Review the engraving placement before adding this item to your cart.
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
            data-preview-incomplete={!hasValidText || !hasRequiredColor ? "true" : undefined}
            aria-describedby={
              validationMessage
                ? "divot-tool-preview-validation"
                : "divot-tool-preview-helper"
            }
            onClick={handleReviewDesign}
          >
            REVIEW DESIGN
          </button>
        </div>

        {validationMessage ? (
          <p
            id="divot-tool-preview-validation"
            className="club-link-preview-validation"
            role="alert"
          >
            {validationMessage}
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
            {submitStatus === "success" ? <CartSuccessActions /> : null}
          </>
        ) : null}
      </form>

      <DivotToolPreviewModal
        isOpen={isPreviewOpen}
        engravingText={trimmedText}
        fontStyleId={selectedFontStyle?.id ?? "classic"}
        fontStyleLabel={selectedFontStyle?.label ?? "Classic"}
        onClose={closePreview}
        onEdit={editPreview}
      />
    </section>
  );
}

function StandardProductCustomizationForm({
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
  colorOptions = [],
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
  const [selectedColor, setSelectedColor] = useState(
    colorOptions.length === 1 ? colorOptions[0].name : "",
  );
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
  const designRequestRef = useRef<HTMLTextAreaElement>(null);
  const focusDesignRequestRef = useRef(false);

  useEffect(() => {
    const previewUrl = uploadedLogo?.previewUrl;

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [uploadedLogo?.previewUrl]);

  useEffect(() => {
    if (selectedMethodId === "design" && focusDesignRequestRef.current) {
      focusDesignRequestRef.current = false;
      designRequestRef.current?.focus();
    }
  }, [selectedMethodId]);

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
    (!colorOptions.length || Boolean(selectedColor)) &&
    submitStatus !== "submitting" &&
    logoUploadStatus !== "uploading";
  const previewMissingFields = useMemo(() => {
    if (!clubLinksPreviewEnabled) {
      return [];
    }

    const missingFields: string[] = [];

    if (colorOptions.length && !selectedColor) missingFields.push("Color");
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
    colorOptions.length,
    designRequest,
    initials,
    name,
    phoneNumber,
    selectedMethodId,
    selectedColor,
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
    window.requestAnimationFrame(() =>
      previewButtonRef.current?.focus({ preventScroll: true }),
    );
  }

  function editPreview() {
    setIsPreviewOpen(false);
    window.requestAnimationFrame(() => {
      customizerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      previewButtonRef.current?.focus();
    });
  }

  function useDesignService() {
    focusDesignRequestRef.current = true;
    setIsPreviewOpen(false);
    setSelectedMethodId("design");
    setPreviewValidationMessage("");
    window.requestAnimationFrame(() => {
      customizerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      selectedColor ? { key: "Color", value: selectedColor } : null,
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
      trackMetaStandardEvent("AddToCart", {
        content_ids: [selectedVariant.id],
        content_type: "product",
        currency: selectedVariant.price.currencyCode,
        value: Number(selectedVariant.price.amount),
      });
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

        <ProductColorPicker
          colorOptions={colorOptions}
          selectedColor={selectedColor}
          onSelect={(color) => {
            setSelectedColor(color);
            clearPreviewValidation();
          }}
        />

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
                ref={designRequestRef}
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
          onUseDesignService={useDesignService}
        />
      ) : null}
    </section>
  );
}

export function ProductCustomizationForm(props: ProductCustomizationFormProps) {
  if (props.divotToolPreviewEnabled) {
    return <DivotToolCustomizationForm {...props} />;
  }

  return props.ballMarkerSides ? (
    <BallMarkerCustomizationForm {...props} />
  ) : (
    <StandardProductCustomizationForm {...props} />
  );
}
