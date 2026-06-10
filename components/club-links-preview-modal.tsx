"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PersonalizationMethodId } from "./product-customization-form";

type ClubLinksPreviewModalProps = {
  isOpen: boolean;
  name: string;
  phoneNumber: string;
  methodId: PersonalizationMethodId;
  methodLabel: string;
  initials: string;
  fontStyleId: string;
  fontStyleLabel: string;
  designRequest: string;
  logoFileName: string;
  logoPreviewUrl: string;
  onClose: () => void;
  onEdit: () => void;
  onUseDesignService: () => void;
};

const fontFamilies: Record<string, string> = {
  classic: '"Times New Roman", Georgia, serif',
  modern: 'Arial, Helvetica, sans-serif',
  script: '"Brush Script MT", "Segoe Script", cursive',
  minimal: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
};

export function ClubLinksPreviewModal({
  isOpen,
  name,
  phoneNumber,
  methodId,
  methodLabel,
  initials,
  fontStyleId,
  fontStyleLabel,
  designRequest,
  logoFileName,
  logoPreviewUrl,
  onClose,
  onEdit,
  onUseDesignService,
}: ClubLinksPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const topPathId = useId().replace(/:/g, "");
  const bottomPathId = useId().replace(/:/g, "");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [isLogoPreviewAvailable, setIsLogoPreviewAvailable] = useState(
    Boolean(logoPreviewUrl),
  );

  useEffect(() => {
    setIsLogoPreviewAvailable(Boolean(logoPreviewUrl));
  }, [logoPreviewUrl]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const centerFontFamily = fontFamilies[fontStyleId] ?? fontFamilies.classic;
  const centerText = initials.trim() || "INITIALS";
  const nameText = name.trim();
  const centerFontSize =
    (centerText.length <= 2
      ? 66
      : centerText.length <= 4
        ? 58
        : centerText.length <= 6
          ? 48
          : 40) * 1.5;
  const shouldFitNameToArc = nameText.length > 12;

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
        className="club-links-preview-modal"
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
          <h2 id={titleId}>Review Your Club Links Design</h2>
          <p id={subtitleId}>
            This preview is only an estimate of your engraving layout. Club Links are engraved
            in one color, so uploaded logos are shown as a simplified black preview. If your
            artwork looks off, our team will review and adjust it before production.
          </p>
        </header>

        <div className="club-links-preview-layout">
          <div className="club-links-preview-stage">
            <svg
              className="club-links-preview-svg"
              viewBox="0 0 320 320"
              role="img"
              aria-label={`Silver Club Links tag engraved for ${name}`}
            >
              <defs>
                <radialGradient id={`${topPathId}-metal`} cx="38%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="35%" stopColor="#d9ddd9" />
                  <stop offset="72%" stopColor="#a6aca8" />
                  <stop offset="100%" stopColor="#777e7a" />
                </radialGradient>
                <linearGradient id={`${topPathId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f7faf8" />
                  <stop offset="48%" stopColor="#8f9692" />
                  <stop offset="100%" stopColor="#e4e8e5" />
                </linearGradient>
                <filter id={`${topPathId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="10" stdDeviation="9" floodOpacity="0.38" />
                </filter>
                <path id={topPathId} d="M 66.7 116.5 A 103 103 0 0 1 253.3 116.5" />
                <path id={bottomPathId} d="M 66.7 203.5 A 103 103 0 0 0 253.3 203.5" />
              </defs>

              <circle
                cx="160"
                cy="160"
                r="126"
                fill={`url(#${topPathId}-metal)`}
                stroke={`url(#${topPathId}-rim)`}
                strokeWidth="10"
                filter={`url(#${topPathId}-shadow)`}
              />

              <text className="club-links-preview-arc-text is-top" dy="5">
                <textPath
                  href={`#${topPathId}`}
                  startOffset="50%"
                  textAnchor="middle"
                  textLength={shouldFitNameToArc ? 178 : undefined}
                  lengthAdjust={shouldFitNameToArc ? "spacingAndGlyphs" : undefined}
                >
                  {nameText}
                </textPath>
              </text>
              <text className="club-links-preview-arc-text is-bottom" dy="5">
                <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle">
                  {phoneNumber.trim()}
                </textPath>
              </text>

              {methodId === "initials" ? (
                <text
                  x="160"
                  y="176"
                  textAnchor="middle"
                  className={`club-links-preview-center-text is-${fontStyleId}`}
                  style={{ fontFamily: centerFontFamily, fontSize: centerFontSize }}
                >
                  {centerText}
                </text>
              ) : null}

              {methodId === "logo" ? (
                logoPreviewUrl && isLogoPreviewAvailable ? (
                  <image
                    className="club-links-preview-logo"
                    href={logoPreviewUrl}
                    x="102"
                    y="102"
                    width="116"
                    height="116"
                    preserveAspectRatio="xMidYMid meet"
                    onError={() => setIsLogoPreviewAvailable(false)}
                  />
                ) : (
                  <g className="club-links-preview-logo-fallback">
                    <circle cx="160" cy="160" r="48" />
                    <text x="160" y="165" textAnchor="middle">
                      LOGO
                    </text>
                  </g>
                )
              ) : null}

            </svg>
          </div>

          <div className="club-links-preview-details">
            <h3>Customization Summary</h3>
            <dl>
              <div>
                <dt>Name</dt>
                <dd>{name}</dd>
              </div>
              <div>
                <dt>Phone Number</dt>
                <dd>{phoneNumber}</dd>
              </div>
              <div>
                <dt>Personalization Method</dt>
                <dd>{methodLabel}</dd>
              </div>
              {methodId === "initials" ? (
                <>
                  <div>
                    <dt>Initials / Short Text</dt>
                    <dd>{initials}</dd>
                  </div>
                  <div>
                    <dt>Font Style</dt>
                    <dd>{fontStyleLabel}</dd>
                  </div>
                </>
              ) : null}
              {methodId === "design" ? (
                <div className="is-full">
                  <dt>Design Request</dt>
                  <dd>{designRequest}</dd>
                </div>
              ) : null}
              {methodId === "logo" && logoFileName ? (
                <div className="club-links-preview-artwork-summary">
                  <dt>Artwork</dt>
                  <dd>
                    Uploaded
                    <span>{logoFileName}</span>
                  </dd>
                </div>
              ) : null}
            </dl>

            {methodId === "logo" ? (
              <div className="club-links-preview-artwork-guidance">
                <h4>Logo preview look wrong?</h4>
                <p>
                  {isLogoPreviewAvailable
                    ? "Some multi-color, detailed, or shaded artwork may not convert cleanly to a one-color engraving preview. We’ll review your uploaded artwork before production and adjust it when possible."
                    : "Preview unavailable for this artwork. Our design team will review your logo before production and adjust it when possible."}
                </p>
                <button type="button" onClick={onUseDesignService}>
                  Having trouble? Let us design it for you
                </button>
              </div>
            ) : null}
            {methodId === "design" ? (
              <p className="club-links-preview-callout">
                Our team will prepare a design proof based on your request.
              </p>
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
