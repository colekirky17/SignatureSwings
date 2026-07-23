"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function MetaPixelPageView() {
  const pathname = usePathname();
  const hasTrackedInitialPageView = useRef(false);

  useEffect(() => {
    if (!pathname) {
      return;
    }

    if (!hasTrackedInitialPageView.current) {
      hasTrackedInitialPageView.current = true;
      return;
    }

    window.fbq?.("track", "PageView");
  }, [pathname]);

  return null;
}
