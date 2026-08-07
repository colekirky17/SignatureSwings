"use client";

import { type CSSProperties, type FormEvent, useState } from "react";
import { CartSuccessActions } from "./cart-success-actions";
import { useProductVariant } from "./product-variant-context";
import { trackMetaStandardEvent } from "../lib/analytics";

const COLOR_SWATCHES: Record<string, string> = {
  black: "#161719",
  silver: "#cfd2cf",
  gold: "#c9a24d",
};

function isColorOptionName(name: string): boolean {
  return name.trim().toLowerCase() === "color";
}

function getColorSwatchByName(name: string): string {
  return COLOR_SWATCHES[name.trim().toLowerCase()] ?? "#cfd2cf";
}

export function ProductAddToCartForm() {
  const {
    options,
    selectedOptions,
    selectedVariant,
    setSelectedOption,
  } = useProductVariant();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const canAddToCart =
    Boolean(selectedVariant?.availableForSale) && status !== "submitting";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canAddToCart || !selectedVariant) {
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/cart/lines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: selectedVariant.id,
          attributes: [],
        }),
      });
      const result = (await response.json()) as {
        added?: boolean;
        totalQuantity?: number;
        message?: string;
      };

      if (!response.ok || !result.added) {
        throw new Error(result.message || "Could not add this item to the cart.");
      }

      setStatus("success");
      setMessage(
        `Added to cart. ${result.totalQuantity ?? 1} ${
          result.totalQuantity === 1 ? "item" : "items"
        } in cart.`,
      );
      window.dispatchEvent(
        new CustomEvent("cart:updated", {
          detail: { totalQuantity: result.totalQuantity ?? 1 },
        }),
      );
      trackMetaStandardEvent("AddToCart", {
        content_ids: [selectedVariant.id],
        content_type: "product",
        currency: selectedVariant.price.currencyCode,
        value: Number(selectedVariant.price.amount),
      });
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Could not add this item to the cart.",
      );
    }
  }

  return (
    <form className="product-add-to-cart-form" onSubmit={handleSubmit}>
      {options.length ? (
        <fieldset className="product-variant-options" aria-label="Product options">
          <div className="product-variant-option-grid">
            {options.map((option) => {
              if (isColorOptionName(option.name)) {
                return (
                  <fieldset key={option.name} className="product-color-options">
                    <legend>
                      {option.name} <strong aria-hidden="true">*</strong>
                    </legend>
                    <div className="product-color-option-grid" role="radiogroup">
                      {option.values.map((value) => {
                        const isSelected = selectedOptions[option.name] === value;
                        const style = {
                          "--product-color-swatch": getColorSwatchByName(value),
                        } as CSSProperties;

                        return (
                          <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            className={`product-color-option${
                              isSelected ? " is-selected" : ""
                            }`}
                            onClick={() => setSelectedOption(option.name, value)}
                            style={style}
                          >
                            <span className="product-color-swatch" aria-hidden="true" />
                            <span>{value}</span>
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                );
              }

              return (
                <label key={option.name} className="club-link-input-field">
                  <span>{option.name}</span>
                  <select
                    value={selectedOptions[option.name] ?? ""}
                    onChange={(event) =>
                      setSelectedOption(option.name, event.target.value)
                    }
                  >
                    {option.values.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <button type="submit" className="club-link-primary-action" disabled={!canAddToCart}>
        {status === "submitting" ? "ADDING..." : "ADD TO CART"}
      </button>

      {message ? (
        <>
          <p
            className={`cart-submit-status is-${status}`}
            role={status === "error" ? "alert" : "status"}
          >
            {message}
          </p>
          {status === "success" ? (
            <CartSuccessActions />
          ) : null}
        </>
      ) : null}
    </form>
  );
}
