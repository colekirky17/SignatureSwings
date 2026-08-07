"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PersonalizationMethodId } from "./product-customization-form";
import { usePreviewModalBehavior } from "./use-preview-modal-behavior";

export type BallMarkerPreviewSide = {
  side: "front" | "back";
  methodId: PersonalizationMethodId;
  methodLabel: string;
  text: string;
  designRequest: string;
  logoFileName: string;
  logoPreviewUrl: string;
};

type BallMarkerPreviewModalProps = {
  isOpen: boolean;
  sides: BallMarkerPreviewSide[];
  finishName: string;
  finishColor: string;
  onClose: () => void;
  onEdit: () => void;
};

function normalizeHexColor(color: string): string {
  const normalized = color.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3,4}$/i.test(normalized)) {
    return normalized
      .slice(0, 3)
      .split("")
      .map((character) => character.repeat(2))
      .join("");
  }

  return /^[0-9a-f]{6,8}$/i.test(normalized)
    ? normalized.slice(0, 6)
    : "c5c8ca";
}

function mixHexColor(color: string, target: string, amount: number): string {
  const sourceHex = normalizeHexColor(color);
  const targetHex = normalizeHexColor(target);
  const channels = [0, 2, 4].map((offset) => {
    const sourceChannel = Number.parseInt(sourceHex.slice(offset, offset + 2), 16);
    const targetChannel = Number.parseInt(targetHex.slice(offset, offset + 2), 16);

    return Math.round(sourceChannel + (targetChannel - sourceChannel) * amount)
      .toString(16)
      .padStart(2, "0");
  });

  return `#${channels.join("")}`;
}

const BALL_MARKER_ARTWORK = {
  x: 160,
  y: 160,
  textSafeWidth: 196,
  textSafeHeight: 112,
  textMinFontSize: 24,
  textMaxFontSize: 70,
  textLineHeight: 0.92,
  textLetterSpacing: 1,
  logoSize: 198,
  guideRadius: 78,
};

const BALL_MARKER_TEXT_FONT =
  "Arial, Helvetica, sans-serif";
const BALL_MARKER_TEXT_FONT_WEIGHT = 800;

type BallMarkerTextLayout = {
  lines: string[];
  fontSize: number;
  lineHeight: number;
  mayBeTooLong: boolean;
};

let measurementCanvasContext: CanvasRenderingContext2D | null | undefined;

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
      return total + 1.24;
    }

    return total + 1;
  }, 0);
}

function getMeasurementContext(): CanvasRenderingContext2D | null {
  if (measurementCanvasContext !== undefined) {
    return measurementCanvasContext;
  }

  if (typeof document === "undefined") {
    measurementCanvasContext = null;
    return measurementCanvasContext;
  }

  measurementCanvasContext = document.createElement("canvas").getContext("2d");

  return measurementCanvasContext;
}

function measureBallMarkerTextLine(text: string, fontSize: number): number {
  const context = getMeasurementContext();
  const letterSpacing =
    Math.max(0, Array.from(text).length - 1) * BALL_MARKER_ARTWORK.textLetterSpacing;

  if (!context) {
    return (
      getWeightedTextLength(text) * fontSize * 0.58 +
      letterSpacing
    );
  }

  context.font = `${BALL_MARKER_TEXT_FONT_WEIGHT} ${fontSize}px ${BALL_MARKER_TEXT_FONT}`;

  return context.measureText(text).width + letterSpacing;
}

function getBallMarkerLayoutHeight(lineCount: number, fontSize: number): number {
  return lineCount === 1
    ? fontSize
    : fontSize * BALL_MARKER_ARTWORK.textLineHeight * lineCount;
}

function doBallMarkerLinesFit(lines: string[], fontSize: number): boolean {
  const widestLine = Math.max(
    ...lines.map((line) => measureBallMarkerTextLine(line, fontSize)),
  );
  const layoutHeight = getBallMarkerLayoutHeight(lines.length, fontSize);

  return (
    widestLine <= BALL_MARKER_ARTWORK.textSafeWidth &&
    layoutHeight <= BALL_MARKER_ARTWORK.textSafeHeight
  );
}

function getFittedBallMarkerFontSize(lines: string[]): {
  fontSize: number;
  fits: boolean;
} {
  let low = BALL_MARKER_ARTWORK.textMinFontSize;
  let high = BALL_MARKER_ARTWORK.textMaxFontSize;
  let best = low;

  while (low <= high) {
    const candidate = Math.floor((low + high) / 2);

    if (doBallMarkerLinesFit(lines, candidate)) {
      best = candidate;
      low = candidate + 1;
    } else {
      high = candidate - 1;
    }
  }

  return {
    fontSize: best,
    fits: doBallMarkerLinesFit(lines, best),
  };
}

function getBalancedTwoLineBallMarkerText(text: string): string[] | null {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (words.length < 2) {
    return null;
  }

  let bestLines: string[] | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (let splitIndex = 1; splitIndex < words.length; splitIndex += 1) {
    const lines = [
      words.slice(0, splitIndex).join(" "),
      words.slice(splitIndex).join(" "),
    ];
    const lineWidths = lines.map((line) =>
      measureBallMarkerTextLine(line, BALL_MARKER_ARTWORK.textMaxFontSize),
    );
    const longestWidth = Math.max(...lineWidths);
    const widthDifference = Math.abs(lineWidths[0] - lineWidths[1]);
    const characterDifference = Math.abs(lines[0].length - lines[1].length);
    const score = longestWidth + widthDifference * 0.28 + characterDifference * 2.5;

    if (score < bestScore) {
      bestScore = score;
      bestLines = lines;
    }
  }

  return bestLines;
}

function getBallMarkerTextLayout(text: string): BallMarkerTextLayout {
  const normalizedText = text.trim().replace(/\s+/g, " ") || "TEXT";
  const singleLine = [normalizedText];
  const singleLineAtMaxWidth = measureBallMarkerTextLine(
    normalizedText,
    BALL_MARKER_ARTWORK.textMaxFontSize,
  );

  if (
    singleLineAtMaxWidth <= BALL_MARKER_ARTWORK.textSafeWidth &&
    getBallMarkerLayoutHeight(1, BALL_MARKER_ARTWORK.textMaxFontSize) <=
      BALL_MARKER_ARTWORK.textSafeHeight
  ) {
    return {
      lines: singleLine,
      fontSize: BALL_MARKER_ARTWORK.textMaxFontSize,
      lineHeight: BALL_MARKER_ARTWORK.textLineHeight,
      mayBeTooLong: false,
    };
  }

  const balancedLines = normalizedText.includes(" ")
    ? getBalancedTwoLineBallMarkerText(normalizedText)
    : null;

  if (balancedLines) {
    const fittedTwoLineLayout = getFittedBallMarkerFontSize(balancedLines);

    if (fittedTwoLineLayout.fits) {
      return {
        lines: balancedLines,
        fontSize: fittedTwoLineLayout.fontSize,
        lineHeight: BALL_MARKER_ARTWORK.textLineHeight,
        mayBeTooLong:
          fittedTwoLineLayout.fontSize <= BALL_MARKER_ARTWORK.textMinFontSize,
      };
    }
  }

  const fittedSingleLineLayout = getFittedBallMarkerFontSize(singleLine);

  return {
    lines: singleLine,
    fontSize: fittedSingleLineLayout.fontSize,
    lineHeight: BALL_MARKER_ARTWORK.textLineHeight,
    mayBeTooLong:
      !fittedSingleLineLayout.fits ||
      fittedSingleLineLayout.fontSize <= BALL_MARKER_ARTWORK.textMinFontSize,
  };
}

function BallMarkerCoin({
  design,
  finishColor,
}: {
  design: BallMarkerPreviewSide;
  finishColor: string;
}) {
  const shadowId = useId().replace(/:/g, "");
  const metalId = `${shadowId}-metal`;
  const rimId = `${shadowId}-rim`;
  const textClipPathId = `${shadowId}-text-safe-zone`;
  const [isLogoPreviewAvailable, setIsLogoPreviewAvailable] = useState(
    Boolean(design.logoPreviewUrl),
  );
  const text = design.text.trim() || "TEXT";
  const textLayout = getBallMarkerTextLayout(text);
  const metalHighlight = mixHexColor(finishColor, "#ffffff", 0.72);
  const metalMidtone = mixHexColor(finishColor, "#ffffff", 0.22);
  const metalShadow = mixHexColor(finishColor, "#000000", 0.3);
  const metalDeepShadow = mixHexColor(finishColor, "#000000", 0.5);

  useEffect(() => {
    setIsLogoPreviewAvailable(Boolean(design.logoPreviewUrl));
  }, [design.logoPreviewUrl]);

  return (
    <div className="ball-marker-preview-coin">
      <p>{design.side === "front" ? "Front" : "Back"}</p>
      <svg
        className="club-links-preview-svg"
        viewBox="0 0 320 320"
        role="img"
        aria-label={`${design.side} ball marker engraving preview`}
      >
        <defs>
          <radialGradient id={metalId} cx="36%" cy="28%" r="78%">
            <stop offset="0%" stopColor={metalHighlight} />
            <stop offset="38%" stopColor={metalMidtone} />
            <stop offset="75%" stopColor={finishColor} />
            <stop offset="100%" stopColor={metalShadow} />
          </radialGradient>
          <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={metalHighlight} />
            <stop offset="48%" stopColor={metalDeepShadow} />
            <stop offset="100%" stopColor={metalMidtone} />
          </linearGradient>
          <filter id={`${shadowId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodOpacity="0.38" />
          </filter>
          <clipPath id={textClipPathId}>
            <rect
              x={-BALL_MARKER_ARTWORK.textSafeWidth / 2}
              y={-BALL_MARKER_ARTWORK.textSafeHeight / 2}
              width={BALL_MARKER_ARTWORK.textSafeWidth}
              height={BALL_MARKER_ARTWORK.textSafeHeight}
              rx="8"
            />
          </clipPath>
        </defs>

        <circle
          cx="160"
          cy="160"
          r="126"
          fill={`url(#${metalId})`}
          stroke={`url(#${rimId})`}
          strokeWidth="8"
          filter={`url(#${shadowId}-shadow)`}
        />

        {design.methodId === "initials" ? (
          <g
            className="ball-marker-preview-center-artwork"
            transform={`translate(${BALL_MARKER_ARTWORK.x} ${BALL_MARKER_ARTWORK.y})`}
          >
            <text
              x="0"
              textAnchor="middle"
              dominantBaseline="central"
              alignmentBaseline="central"
              className="ball-marker-preview-center-text"
              clipPath={`url(#${textClipPathId})`}
              style={{
                fontSize: textLayout.fontSize,
                letterSpacing: BALL_MARKER_ARTWORK.textLetterSpacing,
              }}
            >
              {textLayout.lines.map((line, index) => {
                const firstLineOffset =
                  -((textLayout.lines.length - 1) * textLayout.fontSize *
                    textLayout.lineHeight) /
                  2;

                return (
                  <tspan
                    key={`${line}-${index}`}
                    x="0"
                    y={
                      firstLineOffset +
                      index * textLayout.fontSize * textLayout.lineHeight
                    }
                  >
                    {line}
                  </tspan>
                );
              })}
            </text>
            {textLayout.mayBeTooLong ? (
              <title>This text may be too long for clean engraving.</title>
            ) : null}
          </g>
        ) : null}

        {design.methodId === "logo" ? (
          design.logoPreviewUrl && isLogoPreviewAvailable ? (
            <image
              className="club-links-preview-logo"
              href={design.logoPreviewUrl}
              x={BALL_MARKER_ARTWORK.x - BALL_MARKER_ARTWORK.logoSize / 2}
              y={BALL_MARKER_ARTWORK.y - BALL_MARKER_ARTWORK.logoSize / 2}
              width={BALL_MARKER_ARTWORK.logoSize}
              height={BALL_MARKER_ARTWORK.logoSize}
              preserveAspectRatio="xMidYMid meet"
              onError={() => setIsLogoPreviewAvailable(false)}
            />
          ) : (
            <g className="club-links-preview-logo-fallback">
              <circle
                cx={BALL_MARKER_ARTWORK.x}
                cy={BALL_MARKER_ARTWORK.y}
                r={BALL_MARKER_ARTWORK.guideRadius}
              />
              <text
                x={BALL_MARKER_ARTWORK.x}
                y={BALL_MARKER_ARTWORK.y}
                textAnchor="middle"
                dominantBaseline="central"
                alignmentBaseline="central"
              >
                LOGO
              </text>
            </g>
          )
        ) : null}

        {design.methodId === "design" ? (
          <g className="club-links-preview-placeholder">
            <circle
              cx={BALL_MARKER_ARTWORK.x}
              cy={BALL_MARKER_ARTWORK.y}
              r={BALL_MARKER_ARTWORK.guideRadius}
              strokeDasharray="7 6"
            />
            <text
              x={BALL_MARKER_ARTWORK.x}
              y={BALL_MARKER_ARTWORK.y - 10}
              textAnchor="middle"
            >
              <tspan x={BALL_MARKER_ARTWORK.x}>DESIGN</tspan>
              <tspan x={BALL_MARKER_ARTWORK.x} dy="20">
                REQUEST
              </tspan>
            </text>
          </g>
        ) : null}
      </svg>
      {design.methodId === "initials" && textLayout.mayBeTooLong ? (
        <p className="ball-marker-preview-warning">
          This text may be too long for clean engraving.
        </p>
      ) : null}
    </div>
  );
}

export function BallMarkerPreviewModal({
  isOpen,
  sides,
  finishName,
  finishColor,
  onClose,
  onEdit,
}: BallMarkerPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  usePreviewModalBehavior(isOpen, onClose, closeButtonRef);

  if (!isOpen) {
    return null;
  }

  const hasLogo = sides.some((design) => design.methodId === "logo");

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
        className="club-links-preview-modal ball-marker-preview-modal"
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
          <h2 id={titleId}>Review Your Ball Marker Design</h2>
          <p id={subtitleId}>
            This preview is an estimate of your engraving layout. Uploaded artwork is shown as
            a simplified black preview, and our team will review it before production.
          </p>
        </header>

        <div className="club-links-preview-layout">
          <div
            className={`club-links-preview-stage ball-marker-preview-stage${
              sides.length === 2 ? " is-two-sided" : ""
            }`}
          >
            {sides.map((design) => (
              <BallMarkerCoin
                key={design.side}
                design={design}
                finishColor={finishColor}
              />
            ))}
          </div>

          <div className="club-links-preview-details">
            <h3>Customization Summary</h3>
            <dl>
              <div className="is-full">
                <dt>Marker Color</dt>
                <dd>{finishName}</dd>
              </div>
              {sides.map((design) => (
                <div key={design.side} className="is-full">
                  <dt>{design.side === "front" ? "Front" : "Back"} Design</dt>
                  <dd>
                    {design.methodLabel}
                    {design.methodId === "initials" ? `: ${design.text}` : ""}
                    {design.methodId === "logo" ? (
                      <span className="ball-marker-preview-file">
                        Artwork uploaded
                        {design.logoFileName ? `: ${design.logoFileName}` : ""}
                      </span>
                    ) : null}
                    {design.methodId === "design" ? (
                      <span className="ball-marker-preview-request">
                        {design.designRequest}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            {hasLogo ? (
              <div className="club-links-preview-artwork-guidance">
                <h4>Logo preview look wrong?</h4>
                <p>
                  Detailed, shaded, or multi-color artwork may not convert cleanly to a one-color
                  engraving preview. We’ll review your artwork before production and adjust it
                  when possible.
                </p>
              </div>
            ) : null}
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
