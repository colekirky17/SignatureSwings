"use client";

import { useEffect } from "react";
import { trackMetaStandardEvent } from "../lib/analytics";
import type { ProductSummary } from "../lib/catalog";

type ProductViewTrackerProps = {
  product: ProductSummary;
};

export function ProductViewTracker({ product }: ProductViewTrackerProps) {
  useEffect(() => {
    const variantPrice = product.variants?.[0]?.price;

    trackMetaStandardEvent("ViewContent", {
      content_ids: [product.shopifyProductId ?? product.handle],
      content_name: product.title,
      content_category: product.categoryTitle ?? product.categorySlug,
      content_type: "product",
      currency: variantPrice?.currencyCode,
      value: variantPrice ? Number(variantPrice.amount) : undefined,
    });
  }, [product]);

  return null;
}
