"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CUSTOMIZATION_REQUIRED_KEY,
  hasCompleteCustomization,
} from "../lib/product-customization";

type Cart = {
  totalQuantity: number;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: {
    nodes: CartLine[];
  };
};

type Money = {
  amount: string;
  currencyCode: string;
};

type CartLine = {
  id: string;
  quantity: number;
  attributes: Array<{ key: string; value: string }>;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: Money;
    image: {
      url: string;
      altText: string | null;
      width: number | null;
      height: number | null;
    } | null;
    product: {
      title: string;
      handle: string;
    };
  };
};

function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(Number(money.amount));
}

export function CartPage() {
  const [cart, setCart] = useState<Cart | null | undefined>(undefined);
  const [pendingLineId, setPendingLineId] = useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch("/api/cart", { cache: "no-store" });
        const result = (await response.json()) as {
          cart?: Cart | null;
          message?: string;
        };

        if (!response.ok) {
          throw new Error(result.message || "Could not load your cart.");
        }

        setCart(result.cart ?? null);
      } catch (loadError) {
        setCart(null);
        setError(
          loadError instanceof Error ? loadError.message : "Could not load your cart.",
        );
      }
    }

    void loadCart();
  }, []);

  async function updateLine(lineId: string, quantity?: number) {
    setPendingLineId(lineId);
    setError("");

    try {
      const response = await fetch("/api/cart", {
        method: quantity === undefined ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lineId, quantity }),
      });
      const result = (await response.json()) as {
        cart?: Cart;
        message?: string;
      };

      if (!response.ok || !result.cart) {
        throw new Error(result.message || "Could not update your cart.");
      }

      setCart(result.cart);
      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: { totalQuantity: result.cart.totalQuantity },
        }),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update your cart.",
      );
    } finally {
      setPendingLineId(null);
    }
  }

  async function proceedToCheckout() {
    setCheckoutPending(true);
    setError("");

    try {
      const response = await fetch("/api/cart/checkout", { method: "POST" });
      const result = (await response.json()) as {
        checkoutUrl?: string;
        message?: string;
      };

      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.message || "Could not start checkout.");
      }

      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start checkout.",
      );
      setCheckoutPending(false);
    }
  }

  if (cart === undefined) {
    return <p className="cart-loading">Loading your cart...</p>;
  }

  if (!cart || cart.lines.nodes.length === 0) {
    return (
      <section className="cart-empty">
        <h1>Your Cart Is Empty</h1>
        <p>{error || "Browse the collection and add a custom piece to get started."}</p>
        <Link href="/shop" className="cart-shop-link">
          Continue Shopping
        </Link>
      </section>
    );
  }

  const incompleteLineIds = new Set(
    cart.lines.nodes
      .filter(
        (line) =>
          !hasCompleteCustomization(
            line.merchandise.product.handle,
            line.merchandise.product.title,
            line.attributes,
          ),
      )
      .map((line) => line.id),
  );
  const canCheckout = incompleteLineIds.size === 0 && !checkoutPending;

  return (
    <section className="cart-page-panel">
      <div className="cart-page-heading">
        <div>
          <p className="shop-kicker">Your Order</p>
          <h1>Shopping Cart</h1>
        </div>
        <p>{cart.totalQuantity} {cart.totalQuantity === 1 ? "item" : "items"}</p>
      </div>

      {error ? <p className="cart-page-error" role="alert">{error}</p> : null}

      <div className="cart-layout">
        <div className="cart-line-list">
          {cart.lines.nodes.map((line) => {
            const isPending = pendingLineId === line.id;
            const needsCustomization = incompleteLineIds.has(line.id);

            return (
              <article
                key={line.id}
                className={`cart-line${needsCustomization ? " is-incomplete" : ""}`}
              >
                <Link
                  href={`/shop/${line.merchandise.product.handle}`}
                  className="cart-line-media"
                >
                  {line.merchandise.image ? (
                    <img
                      src={line.merchandise.image.url}
                      alt={line.merchandise.image.altText || line.merchandise.product.title}
                      width={line.merchandise.image.width ?? undefined}
                      height={line.merchandise.image.height ?? undefined}
                    />
                  ) : (
                    <span>Product image</span>
                  )}
                </Link>

                <div className="cart-line-body">
                  <div className="cart-line-heading">
                    <div>
                      <Link href={`/shop/${line.merchandise.product.handle}`}>
                        <h2>{line.merchandise.product.title}</h2>
                      </Link>
                      {line.merchandise.title !== "Default Title" ? (
                        <p>{line.merchandise.title}</p>
                      ) : null}
                    </div>
                    <strong>{formatMoney(line.cost.totalAmount)}</strong>
                  </div>

                  {line.attributes.some(
                    (attribute) => attribute.key !== CUSTOMIZATION_REQUIRED_KEY,
                  ) ? (
                    <dl className="cart-line-attributes">
                      {line.attributes
                        .filter(
                          (attribute) =>
                            attribute.key !== CUSTOMIZATION_REQUIRED_KEY,
                        )
                        .map((attribute) => (
                          <div key={`${line.id}-${attribute.key}`}>
                            <dt>{attribute.key}</dt>
                            <dd>{attribute.value}</dd>
                          </div>
                        ))}
                    </dl>
                  ) : null}

                  {needsCustomization ? (
                    <div className="cart-customization-warning" role="alert">
                      <strong>Customization required</strong>
                      <p>
                        Remove this older item and customize it again before checkout.
                      </p>
                      <Link href={`/shop/${line.merchandise.product.handle}`}>
                        Customize This Item
                      </Link>
                    </div>
                  ) : null}

                  <div className="cart-line-controls">
                    <label>
                      <span>Quantity</span>
                      <select
                        value={line.quantity}
                        disabled={isPending}
                        onChange={(event) =>
                          void updateLine(line.id, Number(event.target.value))
                        }
                      >
                        {Array.from({ length: 10 }, (_, index) => index + 1).map(
                          (quantity) => (
                            <option key={quantity} value={quantity}>
                              {quantity}
                            </option>
                          ),
                        )}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => void updateLine(line.id)}
                    >
                      {isPending ? "Updating..." : "Remove"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(cart.cost.subtotalAmount)}</strong>
          </div>
          <p>Shipping and taxes are calculated securely in Shopify checkout.</p>
          {incompleteLineIds.size ? (
            <p className="cart-checkout-warning">
              Complete customization for every item to unlock checkout.
            </p>
          ) : null}
          <button
            type="button"
            className="cart-checkout-button"
            disabled={!canCheckout}
            onClick={() => void proceedToCheckout()}
          >
            {checkoutPending ? "Opening Checkout..." : "Proceed To Checkout"}
          </button>
          <Link href="/shop" className="cart-continue-link">
            Continue Shopping
          </Link>
        </aside>
      </div>
    </section>
  );
}
