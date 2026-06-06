"use client";

import Link from "next/link";

export function CartSuccessActions({ checkoutUrl }: { checkoutUrl?: string }) {
  return (
    <div className="cart-success-actions">
      <Link href="/cart" className="cart-success-view">
        View Cart
      </Link>
      {checkoutUrl ? (
        <a href={checkoutUrl} className="cart-success-checkout">
          Checkout
        </a>
      ) : null}
    </div>
  );
}
