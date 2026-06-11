"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CartIndicator({ onNavigate }: { onNavigate?: () => void }) {
  const [totalQuantity, setTotalQuantity] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadCart() {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        const result = (await response.json()) as {
          cart?: { totalQuantity?: number } | null;
        };

        if (active && response.ok) {
          setTotalQuantity(result.cart?.totalQuantity ?? 0);
        }
      } catch {
        // The cart link remains usable if the count cannot be refreshed.
      }
    }

    function handleCartUpdated(event: Event) {
      const quantity = (event as CustomEvent<{ totalQuantity?: number }>).detail
        ?.totalQuantity;

      if (typeof quantity === "number") {
        setTotalQuantity(quantity);
      } else {
        void loadCart();
      }
    }

    void loadCart();
    window.addEventListener("cart:updated", handleCartUpdated);

    return () => {
      active = false;
      window.removeEventListener("cart:updated", handleCartUpdated);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className="header-cart-link"
      aria-label={`Shopping cart with ${totalQuantity} items`}
      onClick={onNavigate}
    >
      <svg
        className="header-cart-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L20.5 7H6" />
        <circle cx="9.5" cy="19" r="1.2" />
        <circle cx="17.5" cy="19" r="1.2" />
      </svg>
      <span className="header-cart-count" aria-label={`${totalQuantity} items in cart`}>
        {totalQuantity}
      </span>
    </Link>
  );
}
