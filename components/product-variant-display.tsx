"use client";

import styles from "./catalog-product-media.module.css";
import { useProductVariant } from "./product-variant-context";

function formatMoney(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(Number(amount));
}

export function ProductVariantImage({
  productTitle,
  placeholderLabel,
  className = styles.detailImage,
}: {
  productTitle: string;
  placeholderLabel: string;
  className?: string;
}) {
  const { fallbackImage, selectedVariant } = useProductVariant();
  const image = selectedVariant?.image ?? fallbackImage;

  return image ? (
    <img
      className={className}
      src={image.url}
      alt={image.altText || `${productTitle} ${selectedVariant?.title ?? ""}`.trim()}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
    />
  ) : (
    <span className="media-label">{placeholderLabel}</span>
  );
}

export function ProductVariantPriceStatus({
  fallbackPriceLabel,
}: {
  fallbackPriceLabel: string;
}) {
  const { selectedVariant } = useProductVariant();

  if (!selectedVariant) {
    return (
      <>
        <p className="club-link-price">{fallbackPriceLabel}</p>
        <p className="inventory-status is-out-of-stock">Out of stock</p>
      </>
    );
  }

  const price = formatMoney(
    selectedVariant.price.amount,
    selectedVariant.price.currencyCode,
  );
  const compareAtPrice = selectedVariant.compareAtPrice
    ? formatMoney(
        selectedVariant.compareAtPrice.amount,
        selectedVariant.compareAtPrice.currencyCode,
      )
    : null;

  return (
    <>
      <p className="club-link-price">
        {compareAtPrice ? <s>{compareAtPrice}</s> : null}
        {compareAtPrice ? " " : null}
        {price}
      </p>
      <p
        className={`inventory-status ${
          selectedVariant.availableForSale ? "is-in-stock" : "is-out-of-stock"
        }`}
      >
        {selectedVariant.availableForSale ? "In stock" : "Out of stock"}
      </p>
    </>
  );
}
