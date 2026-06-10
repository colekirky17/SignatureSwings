"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { PersonalizationMethodId } from "./product-customization-form";

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
  onClose: () => void;
  onEdit: () => void;
};

function BallMarkerCoin({ design }: { design: BallMarkerPreviewSide }) {
  const gradientId = useId().replace(/:/g, "");
  const [isLogoPreviewAvailable, setIsLogoPreviewAvailable] = useState(
    Boolean(design.logoPreviewUrl),
  );
  const text = design.text.trim() || "TEXT";
  const textSize =
    text.length <= 2 ? 100 : text.length <= 4 ? 80 : text.length <= 8 ? 58 : 44;

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
          <radialGradient id={`${gradientId}-metal`} cx="38%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#d9ddd9" />
            <stop offset="72%" stopColor="#a6aca8" />
            <stop offset="100%" stopColor="#777e7a" />
          </radialGradient>
          <linearGradient id={`${gradientId}-rim`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f7faf8" />
            <stop offset="48%" stopColor="#8f9692" />
            <stop offset="100%" stopColor="#e4e8e5" />
          </linearGradient>
          <filter id={`${gradientId}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="9" floodOpacity="0.38" />
          </filter>
        </defs>

        <circle
          cx="160"
          cy="160"
          r="126"
          fill={`url(#${gradientId}-metal)`}
          stroke={`url(#${gradientId}-rim)`}
          strokeWidth="10"
          filter={`url(#${gradientId}-shadow)`}
        />

        {design.methodId === "initials" ? (
          <text
            x="160"
            y="174"
            textAnchor="middle"
            className="ball-marker-preview-center-text"
            style={{ fontSize: textSize }}
            textLength={text.length > 8 ? 170 : undefined}
            lengthAdjust={text.length > 8 ? "spacingAndGlyphs" : undefined}
          >
            {text}
          </text>
        ) : null}

        {design.methodId === "logo" ? (
          design.logoPreviewUrl && isLogoPreviewAvailable ? (
            <image
              className="club-links-preview-logo"
              href={design.logoPreviewUrl}
              x="76"
              y="76"
              width="168"
              height="168"
              preserveAspectRatio="xMidYMid meet"
              onError={() => setIsLogoPreviewAvailable(false)}
            />
          ) : (
            <g className="club-links-preview-logo-fallback">
              <circle cx="160" cy="160" r="65" />
              <text x="160" y="165" textAnchor="middle">
                LOGO
              </text>
            </g>
          )
        ) : null}

        {design.methodId === "design" ? (
          <g className="club-links-preview-placeholder">
            <circle cx="160" cy="160" r="65" strokeDasharray="7 6" />
            <text x="160" y="154" textAnchor="middle">
              <tspan x="160">DESIGN</tspan>
              <tspan x="160" dy="20">
                REQUEST
              </tspan>
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

export function BallMarkerPreviewModal({
  isOpen,
  sides,
  onClose,
  onEdit,
}: BallMarkerPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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
              <BallMarkerCoin key={design.side} design={design} />
            ))}
          </div>

          <div className="club-links-preview-details">
            <h3>Customization Summary</h3>
            <dl>
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
