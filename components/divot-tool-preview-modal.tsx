"use client";

import { useEffect, useId, useRef } from "react";

type DivotToolPreviewModalProps = {
  isOpen: boolean;
  engravingText: string;
  fontStyleId: string;
  fontStyleLabel: string;
  onClose: () => void;
  onEdit: () => void;
};

export const engravingFontFamilies: Record<string, string> = {
  classic: '"Times New Roman", Georgia, serif',
  modern: "Arial, Helvetica, sans-serif",
  script: '"Brush Script MT", "Segoe Script", cursive',
  minimal: '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
};

function getEngravingFontSize(text: string, fontStyleId: string): number {
  const baseSize =
    text.length <= 8 ? 62 : text.length <= 12 ? 52 : text.length <= 16 ? 43 : 36;

  return fontStyleId === "script" ? baseSize + 5 : baseSize;
}

export function DivotToolPreviewModal({
  isOpen,
  engravingText,
  fontStyleId,
  fontStyleLabel,
  onClose,
  onEdit,
}: DivotToolPreviewModalProps) {
  const titleId = useId();
  const subtitleId = useId();
  const clipPathId = useId().replace(/:/g, "");
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

  const fontFamily =
    engravingFontFamilies[fontStyleId] ?? engravingFontFamilies.classic;
  const fontSize = getEngravingFontSize(engravingText, fontStyleId);

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
            This is a close estimate of the engraving placement. Final sizing may be adjusted
            slightly for the cleanest production result.
          </p>
        </header>

        <div className="club-links-preview-layout divot-tool-preview-layout">
          <div className="club-links-preview-stage divot-tool-preview-stage">
            <svg
              className="divot-tool-preview-svg"
              viewBox="0 0 1448 300"
              role="img"
              aria-label={`Divot tool engraved with ${engravingText}`}
            >
              <defs>
                <clipPath id={clipPathId}>
                  <rect x="615" y="118" width="520" height="104" rx="8" />
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
                x="875"
                y="187"
                textAnchor="middle"
                clipPath={`url(#${clipPathId})`}
                className={`divot-tool-preview-text is-${fontStyleId}`}
                style={{ fontFamily, fontSize }}
              >
                {engravingText}
              </text>
            </svg>
          </div>

          <div className="club-links-preview-details">
            <h3>Customization Summary</h3>
            <dl>
              <div className="is-full">
                <dt>Engraving Text</dt>
                <dd>{engravingText}</dd>
              </div>
              <div className="is-full">
                <dt>Font Style</dt>
                <dd>{fontStyleLabel}</dd>
              </div>
            </dl>
            <p className="club-links-preview-callout">
              Engraving is centered within the flat panel and kept clear of the grip, opener,
              tip, and outer edges.
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
