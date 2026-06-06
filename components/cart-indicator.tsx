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
    <Link href="/cart" className="header-cart-link" onClick={onNavigate}>
      <span>Cart</span>
      <span className="header-cart-count" aria-label={`${totalQuantity} items in cart`}>
        {totalQuantity}
      </span>
    </Link>
  );
}
