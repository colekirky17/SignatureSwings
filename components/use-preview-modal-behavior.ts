"use client";

import { type RefObject, useEffect } from "react";

export function usePreviewModalBehavior(
  isOpen: boolean,
  onClose: () => void,
  closeButtonRef: RefObject<HTMLButtonElement | null>,
) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus({ preventScroll: true });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      window.requestAnimationFrame(() => {
        window.scrollTo({ left: scrollX, top: scrollY, behavior: "auto" });
      });
    };
  }, [closeButtonRef, isOpen, onClose]);
}
