"use client";

import type { ProductImage } from "../lib/catalog";
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

function getUniqueImages(images: Array<ProductImage | undefined>): ProductImage[] {
  return Array.from(
    new Map(
      images
        .filter((image): image is ProductImage => Boolean(image?.url))
        .map((image) => [image.url, image]),
    ).values(),
  );
}

function GalleryImage({
  image,
  productTitle,
  placeholderLabel,
  className,
}: {
  image?: ProductImage;
  productTitle: string;
  placeholderLabel: string;
  className?: string;
}) {
  return image ? (
    <img
      className={className}
      src={image.url}
      alt={image.altText || productTitle}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
    />
  ) : (
    <span className="media-label">{placeholderLabel}</span>
  );
}

export function ProductImageGallery({
  productTitle,
  placeholderLabel,
  images = [],
  galleryClassName = "product-detail-gallery",
  mainImageWrapperClassName = "product-detail-media",
  mainImageClassName = styles.detailImage,
  thumbnailsClassName = "product-detail-thumbnails",
  thumbnailClassName = "product-detail-thumbnail",
  maxThumbnails = 3,
}: {
  productTitle: string;
  placeholderLabel: string;
  images?: ProductImage[];
  galleryClassName?: string;
  mainImageWrapperClassName?: string;
  mainImageClassName?: string;
  thumbnailsClassName?: string;
  thumbnailClassName?: string;
  maxThumbnails?: number;
}) {
  const { fallbackImage, selectedVariant } = useProductVariant();
  const mainImage = selectedVariant?.image ?? images[0] ?? fallbackImage;
  const galleryImages = getUniqueImages([
    ...images,
    selectedVariant?.image,
    fallbackImage,
  ]);
  const thumbnailImages = galleryImages
    .filter((image) => image.url !== mainImage?.url)
    .slice(0, maxThumbnails);

  return (
    <div className={galleryClassName} aria-label={`${productTitle} images`}>
      <div className={mainImageWrapperClassName}>
        <GalleryImage
          image={mainImage}
          productTitle={productTitle}
          placeholderLabel={placeholderLabel}
          className={mainImageClassName}
        />
      </div>
      {thumbnailImages.length ? (
        <div className={thumbnailsClassName} aria-hidden="true">
          {thumbnailImages.map((image) => (
            <div key={image.url} className={thumbnailClassName}>
              <GalleryImage
                image={image}
                productTitle={productTitle}
                placeholderLabel={placeholderLabel}
                className={mainImageClassName}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
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
