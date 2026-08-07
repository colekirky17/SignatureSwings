"use client";

import { useId, useRef } from "react";
import { usePreviewModalBehavior } from "./use-preview-modal-behavior";

type DivotToolPreviewModalProps = {
  isOpen: boolean;
  engravingText: string;
  fontStyleId: string;
  fontStyleLabel: string;
  selectedColor?: string;
  previewVariant?: "standard" | "single-prong" | "two-prong";
  personalizationMethod?: "text" | "logo";
  logoFileName?: string;
  logoPreviewUrl?: string | null;
  onClose: () => void;
  onEdit: () => void;
};

export const engravingFontFamilies: Record<string, string> = {
  classic: '"Times New Roman", Georgia, serif',
  modern: "Arial, Helvetica, sans-serif",
  script: '"Brush Script MT", "Segoe Script", cursive',
  minimal: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
};

const ENGRAVING_PANEL = {
  x: 615,
  y: 118,
  width: 520,
  height: 104,
  paddingX: 56,
  paddingY: 18,
};

const TWO_PRONG_TEXT_PANEL = {
  x: 270,
  y: 410,
  width: 480,
  height: 190,
  paddingX: 36,
  paddingY: 24,
};

const TWO_PRONG_LOGO_PANEL = {
  x: 392,
  y: 405,
  size: 240,
};

const SINGLE_PRONG_TEXT_PANEL = {
  x: 248,
  y: 80,
  width: 520,
  height: 140,
  paddingX: 54,
  paddingY: 28,
};

const fontWidthRatios: Record<string, number> = {
  classic: 0.54,
  modern: 0.58,
  script: 0.42,
  minimal: 0.68,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getWeightedTextLength(text: string): number {
  return Array.from(text.trim()).reduce((total, character) => {
    if (character === " ") {
      return total + 0.42;
    }

    if (/['.,-]/.test(character)) {
      return total + 0.36;
    }

    if (/[ilI1]/.test(character)) {
      return total + 0.52;
    }

    if (/[mwMW]/.test(character)) {
      return total + 1.25;
    }

    return total + 1;
  }, 0);
}

function getEngravingFontSize(text: string, fontStyleId: string): number {
  const weightedLength = Math.max(1, getWeightedTextLength(text));
  const widthRatio = fontWidthRatios[fontStyleId] ?? fontWidthRatios.classic;
  const safeWidth = ENGRAVING_PANEL.width - ENGRAVING_PANEL.paddingX * 2;
  const safeHeight = ENGRAVING_PANEL.height - ENGRAVING_PANEL.paddingY * 2;
  const characterTarget =
    weightedLength <= 5
      ? 0.86
      : weightedLength <= 9
        ? 0.82
        : weightedLength <= 13
          ? 0.76
          : 0.7;
  const widthBasedSize = (safeWidth * characterTarget) / (weightedLength * widthRatio);
  const heightBasedSize = safeHeight * (fontStyleId === "script" ? 1.08 : 0.96);
  const maxSize = fontStyleId === "script" ? 90 : 82;
  const minSize = fontStyleId === "minimal" ? 34 : 38;

  return Math.round(clamp(Math.min(widthBasedSize, heightBasedSize), minSize, maxSize));
}

function getTwoProngTextFontSize(text: string, fontStyleId: string): number {
  const weightedLength = Math.max(1, getWeightedTextLength(text));
  const widthRatio = fontWidthRatios[fontStyleId] ?? fontWidthRatios.classic;
  const safeWidth = TWO_PRONG_TEXT_PANEL.width - TWO_PRONG_TEXT_PANEL.paddingX * 2;
  const safeHeight = TWO_PRONG_TEXT_PANEL.height - TWO_PRONG_TEXT_PANEL.paddingY * 2;
  const characterTarget =
    weightedLength <= 5
      ? 0.96
      : weightedLength <= 10
        ? 0.9
        : weightedLength <= 15
          ? 0.82
          : 0.74;
  const widthBasedSize =
    (safeWidth * characterTarget) / (weightedLength * widthRatio);
  const heightBasedSize = safeHeight * (fontStyleId === "script" ? 1.08 : 0.92);
  const maxSize = fontStyleId === "script" ? 122 : 112;

  return Math.round(clamp(Math.min(widthBasedSize, heightBasedSize), 38, maxSize));
}

function getSingleProngTextFontSize(text: string, fontStyleId: string): number {
  const weightedLength = Math.max(1, getWeightedTextLength(text));
  const widthRatio = fontWidthRatios[fontStyleId] ?? fontWidthRatios.classic;
  const safeWidth = SINGLE_PRONG_TEXT_PANEL.width - SINGLE_PRONG_TEXT_PANEL.paddingX * 2;
  const safeHeight =
    SINGLE_PRONG_TEXT_PANEL.height - SINGLE_PRONG_TEXT_PANEL.paddingY * 2;
  const widthBasedSize = (safeWidth * 0.86) / (weightedLength * widthRatio);
  const heightBasedSize = safeHeight * (fontStyleId === "script" ? 1.04 : 0.9);

  return Math.round(clamp(Math.min(widthBasedSize, heightBasedSize), 30, 74));
}

function getTwoProngRenderImage(selectedColor: string | undefined): string {
  const normalizedColor = selectedColor?.trim().toLowerCase() ?? "";

  return normalizedColor.includes("copper")
    ? "/images/two-prong-divot-tool-copper.png"
    : "/images/two-prong-divot-tool-silver.png";
}

function getTwoProngEngravingColor(selectedColor: string | undefined): string {
  const normalizedColor = selectedColor?.trim().toLowerCase() ?? "";

  return normalizedColor.includes("copper") ? "#22140d" : "#1f2422";
}

function getSingleProngRenderImage(selectedColor: string | undefined): string {
  const normalizedColor = selectedColor?.trim().toLowerCase() ?? "";

  if (normalizedColor.includes("black")) {
    return "/images/single-prong-divot-tool-black.png";
  }

  if (normalizedColor.includes("gold")) {
    return "/images/single-prong-divot-tool-gold.png";
  }

  return "/images/single-prong-divot-tool-silver.png";
}

function getSingleProngEngravingColor(selectedColor: string | undefined): string {
  const normalizedColor = selectedColor?.trim().toLowerCase() ?? "";

  return normalizedColor.includes("black") ? "#c9ccc7" : "#161915";
}

export function DivotToolPreviewModal({
  isOpen,
  engravingText,
  fontStyleId,
  fontStyleLabel,
  selectedColor,
  previewVariant = "standard",
  personalizationMethod = "text",
  logoFileName = "",
  logoPreviewUrl = null,
  onClose,
  onEdit,
}: DivotToolPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const clipPathId = useId().replace(/:/g, "");
  const logoClipPathId = useId().replace(/:/g, "");
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  usePreviewModalBehavior(isOpen, onClose, closeButtonRef);

  if (!isOpen) {
    return null;
  }

  const fontFamily =
    engravingFontFamilies[fontStyleId] ?? engravingFontFamilies.classic;
  const fontSize = getEngravingFontSize(engravingText, fontStyleId);
  const isTwoProngPreview = previewVariant === "two-prong";
  const isSingleProngPreview = previewVariant === "single-prong";
  const isLogoPreview = isTwoProngPreview && personalizationMethod === "logo";
  const twoProngImage = getTwoProngRenderImage(selectedColor);
  const twoProngEngravingColor = getTwoProngEngravingColor(selectedColor);
  const twoProngTextFontSize = getTwoProngTextFontSize(engravingText, fontStyleId);
  const singleProngImage = getSingleProngRenderImage(selectedColor);
  const singleProngEngravingColor = getSingleProngEngravingColor(selectedColor);
  const singleProngTextFontSize = getSingleProngTextFontSize(
    engravingText,
    fontStyleId,
  );
  const summaryLabel = isLogoPreview ? "Logo / Image" : "Engraving Text";
  const summaryValue = isLogoPreview ? logoFileName || "Uploaded logo" : engravingText;

  return (
    <div
      className="club-links-preview-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="club-links-preview-modal divot-tool-preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitleId}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="club-links-preview-close"
          aria-label="Close design preview"
          onClick={onClose}
        >
          <span aria-hidden="true">&times;</span>
        </button>

        <header className="club-links-preview-header">
          <p className="shop-kicker">Engraving Preview</p>
          <h2 id={titleId}>Review Your Divot Tool Design</h2>
          <p id={subtitleId}>
            {isTwoProngPreview
              ? "This is a close estimate of the two-prong divot tool engraving placement. Text previews run with the tool, while logo previews are shown upright on a vertical tool."
              : isSingleProngPreview
                ? "This is a close estimate of the single-prong divot tool engraving placement with the selected finish."
              : "This is a close estimate of the engraving placement. Final sizing may be adjusted slightly for the cleanest production result."}
          </p>
        </header>

        <div className="club-links-preview-layout divot-tool-preview-layout">
          <div className="club-links-preview-stage divot-tool-preview-stage">
            {isTwoProngPreview ? (
              <svg
                className={`divot-tool-preview-svg two-prong-divot-preview-svg${
                  isLogoPreview ? " is-logo-layout" : " is-text-layout"
                }`}
                viewBox={isLogoPreview ? "0 0 1024 1536" : "0 0 1536 1024"}
                role="img"
                aria-label={
                  isLogoPreview
                    ? "Two-prong divot tool logo engraving preview"
                    : `Two-prong divot tool engraved with ${engravingText}`
                }
              >
                <defs>
                  <clipPath id={clipPathId}>
                    <rect
                      x={TWO_PRONG_TEXT_PANEL.x}
                      y={TWO_PRONG_TEXT_PANEL.y}
                      width={TWO_PRONG_TEXT_PANEL.width}
                      height={TWO_PRONG_TEXT_PANEL.height}
                      rx="10"
                    />
                  </clipPath>
                  <clipPath id={logoClipPathId}>
                    <rect
                      x={TWO_PRONG_LOGO_PANEL.x}
                      y={TWO_PRONG_LOGO_PANEL.y}
                      width={TWO_PRONG_LOGO_PANEL.size}
                      height={TWO_PRONG_LOGO_PANEL.size}
                      rx="14"
                    />
                  </clipPath>
                </defs>
                {isLogoPreview ? (
                  <g transform="translate(1024 0) rotate(90)">
                    <image
                      href={twoProngImage}
                      x="0"
                      y="0"
                      width="1536"
                      height="1024"
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </g>
                ) : (
                  <image
                    href={twoProngImage}
                    x="0"
                    y="0"
                    width="1536"
                    height="1024"
                    preserveAspectRatio="xMidYMid meet"
                  />
                )}

                {isLogoPreview && logoPreviewUrl ? (
                  <image
                    href={logoPreviewUrl}
                    x={TWO_PRONG_LOGO_PANEL.x}
                    y={TWO_PRONG_LOGO_PANEL.y}
                    width={TWO_PRONG_LOGO_PANEL.size}
                    height={TWO_PRONG_LOGO_PANEL.size}
                    preserveAspectRatio="xMidYMid meet"
                    clipPath={`url(#${logoClipPathId})`}
                    opacity="0.86"
                  />
                ) : isLogoPreview ? (
                  <g className="two-prong-logo-placeholder">
                    <rect
                      x={TWO_PRONG_LOGO_PANEL.x}
                      y={TWO_PRONG_LOGO_PANEL.y}
                      width={TWO_PRONG_LOGO_PANEL.size}
                      height={TWO_PRONG_LOGO_PANEL.size}
                      rx="14"
                    />
                    <text
                      x={TWO_PRONG_LOGO_PANEL.x + TWO_PRONG_LOGO_PANEL.size / 2}
                      y={TWO_PRONG_LOGO_PANEL.y + TWO_PRONG_LOGO_PANEL.size / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      LOGO
                    </text>
                  </g>
                ) : (
                  <text
                    x={TWO_PRONG_TEXT_PANEL.x + TWO_PRONG_TEXT_PANEL.width / 2}
                    y={TWO_PRONG_TEXT_PANEL.y + TWO_PRONG_TEXT_PANEL.height / 2 + 5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    clipPath={`url(#${clipPathId})`}
                    className={`divot-tool-preview-text is-${fontStyleId}`}
                    style={{
                      fontFamily,
                      fontSize: twoProngTextFontSize,
                      fill: twoProngEngravingColor,
                    }}
                  >
                    {engravingText}
                  </text>
                )}
              </svg>
            ) : isSingleProngPreview ? (
              <svg
                className="divot-tool-preview-svg single-prong-divot-preview-svg"
                viewBox="0 0 1536 300"
                role="img"
                aria-label={`Single-prong divot tool engraved with ${engravingText}`}
              >
                <defs>
                  <clipPath id={clipPathId}>
                    <rect
                      x={SINGLE_PRONG_TEXT_PANEL.x}
                      y={SINGLE_PRONG_TEXT_PANEL.y}
                      width={SINGLE_PRONG_TEXT_PANEL.width}
                      height={SINGLE_PRONG_TEXT_PANEL.height}
                      rx="10"
                    />
                  </clipPath>
                </defs>
                <g transform="translate(1536 0) scale(-1 1)">
                  <image
                    href={singleProngImage}
                    x="0"
                    y="0"
                    width="1536"
                    height="300"
                    preserveAspectRatio="xMidYMid meet"
                  />
                </g>
                <text
                  x={SINGLE_PRONG_TEXT_PANEL.x + SINGLE_PRONG_TEXT_PANEL.width / 2}
                  y={SINGLE_PRONG_TEXT_PANEL.y + SINGLE_PRONG_TEXT_PANEL.height / 2 + 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  clipPath={`url(#${clipPathId})`}
                  className={`divot-tool-preview-text is-${fontStyleId}`}
                  style={{
                    fontFamily,
                    fontSize: singleProngTextFontSize,
                    fill: singleProngEngravingColor,
                  }}
                >
                  {engravingText}
                </text>
              </svg>
            ) : (
              <svg
                className="divot-tool-preview-svg"
                viewBox="0 0 1448 300"
                role="img"
                aria-label={`Divot tool engraved with ${engravingText}`}
              >
                <defs>
                  <clipPath id={clipPathId}>
                    <rect
                      x={ENGRAVING_PANEL.x}
                      y={ENGRAVING_PANEL.y}
                      width={ENGRAVING_PANEL.width}
                      height={ENGRAVING_PANEL.height}
                      rx="8"
                    />
                  </clipPath>
                </defs>
                <image
                  href="/images/divot-tool.png"
                  x="0"
                  y="0"
                  width="1448"
                  height="300"
                  preserveAspectRatio="xMidYMid meet"
                />
                <text
                  x={ENGRAVING_PANEL.x + ENGRAVING_PANEL.width / 2}
                  y={ENGRAVING_PANEL.y + ENGRAVING_PANEL.height / 2 + 5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  clipPath={`url(#${clipPathId})`}
                  className={`divot-tool-preview-text is-${fontStyleId}`}
                  style={{ fontFamily, fontSize }}
                >
                  {engravingText}
                </text>
              </svg>
            )}
          </div>

          <div className="club-links-preview-details">
            <h3>Customization Summary</h3>
            <dl>
              <div className="is-full">
                <dt>{summaryLabel}</dt>
                <dd>{summaryValue}</dd>
              </div>
              {!isLogoPreview ? (
                <div className="is-full">
                  <dt>Font Style</dt>
                  <dd>{fontStyleLabel}</dd>
                </div>
              ) : null}
              {isTwoProngPreview || isSingleProngPreview ? (
                <div className="is-full">
                  <dt>Finish</dt>
                  <dd>{selectedColor || "Silver"}</dd>
                </div>
              ) : null}
            </dl>
            <p className="club-links-preview-callout">
              {isTwoProngPreview
                ? "Text is shown horizontally along the tool. Uploaded logos are shown upright with the prongs at the bottom for a clearer proof."
                : isSingleProngPreview
                  ? "Engraving is centered on the flat handle panel. Black tools preview with light gray engraving; gold and silver tools preview with dark engraving."
                : "Engraving is centered within the flat panel and kept clear of the grip, opener, tip, and outer edges."}
            </p>
          </div>
        </div>

        <div className="club-links-preview-actions">
          <button type="button" className="is-primary" onClick={onClose}>
            Looks Good
          </button>
          <button type="button" className="is-secondary" onClick={onEdit}>
            Edit Design
          </button>
        </div>
      </section>
    </div>
  );
}
