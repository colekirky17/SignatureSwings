"use client";

import Link from "next/link";

export function CartSuccessActions() {
  return (
    <div className="cart-success-actions">
      <Link href="/cart" className="cart-success-view">
        View Cart
      </Link>
    </div>
  );
}
