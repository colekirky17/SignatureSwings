"use client";

import { useEffect, useId, useRef } from "react";
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
  onClose: () => void;
  onEdit: () => void;
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
  onClose,
  onEdit,
}: ClubLinksPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const topPathId = useId().replace(/:/g, "");
  const bottomPathId = useId().replace(/:/g, "");
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

  const centerFontFamily = fontFamilies[fontStyleId] ?? fontFamilies.classic;
  const centerText = initials.trim() || "INITIALS";

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
            Preview is approximate. Final engraving may vary slightly and will be reviewed
            before production.
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
                <path id={topPathId} d="M 57 135 Q 160 42 263 135" />
                <path id={bottomPathId} d="M 57 190 Q 160 278 263 190" />
              </defs>

              <circle
                cx="160"
                cy="160"
                r="132"
                fill={`url(#${topPathId}-rim)`}
                filter={`url(#${topPathId}-shadow)`}
              />
              <circle cx="160" cy="160" r="125" fill={`url(#${topPathId}-metal)`} />
              <circle
                cx="160"
                cy="160"
                r="111"
                fill="none"
                stroke="#6d7470"
                strokeWidth="2"
                opacity="0.72"
              />
              <circle
                cx="160"
                cy="160"
                r="106"
                fill="none"
                stroke="#f5f7f6"
                strokeWidth="1"
                opacity="0.55"
              />

              <text className="club-links-preview-arc-text">
                <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle">
                  {name.trim()}
                </textPath>
              </text>
              <text className="club-links-preview-arc-text">
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
                  style={{ fontFamily: centerFontFamily }}
                >
                  {centerText}
                </text>
              ) : null}

              {methodId === "logo" ? (
                <g className="club-links-preview-placeholder">
                  <rect x="112" y="112" width="96" height="82" rx="8" />
                  <path d="m126 171 22-23 16 15 13-12 19 20" />
                  <circle cx="181" cy="133" r="7" />
                  <text x="160" y="213" textAnchor="middle">
                    LOGO
                  </text>
                </g>
              ) : null}

              {methodId === "design" ? (
                <g className="club-links-preview-placeholder is-design">
                  <circle cx="160" cy="151" r="42" />
                  <path d="m160 126 7 14 16 2-12 11 3 16-14-8-14 8 3-16-12-11 16-2 7-14Z" />
                  <text x="160" y="211" textAnchor="middle">
                    CUSTOM DESIGN
                  </text>
                </g>
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
                <div className="is-full">
                  <dt>Uploaded Image</dt>
                  <dd>{logoFileName}</dd>
                </div>
              ) : null}
            </dl>

            {methodId === "logo" ? (
              <p className="club-links-preview-callout">
                {logoFileName ? `${logoFileName} is attached. ` : ""}
                Logo upload preview coming soon. Final artwork will be reviewed before engraving.
              </p>
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
