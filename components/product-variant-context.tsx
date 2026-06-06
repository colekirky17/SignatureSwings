"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import type {
  ProductImage,
  ProductSelectedOption,
  ProductVariant,
} from "../lib/catalog";

type ProductOption = {
  name: string;
  values: string[];
};

type ProductVariantContextValue = {
  fallbackImage?: ProductImage;
  options: ProductOption[];
  selectedOptions: Record<string, string>;
  selectedVariant?: ProductVariant;
  setSelectedOption: (name: string, value: string) => void;
};

const ProductVariantContext = createContext<ProductVariantContextValue | null>(null);

function isMeaningfulOption(option: ProductSelectedOption): boolean {
  return !(
    option.name.trim().toLowerCase() === "title" &&
    option.value.trim().toLowerCase() === "default title"
  );
}

function getProductOptions(variants: ProductVariant[]): ProductOption[] {
  if (variants.length <= 1) {
    return [];
  }

  const optionValues = new Map<string, Set<string>>();

  for (const variant of variants) {
    for (const option of variant.selectedOptions.filter(isMeaningfulOption)) {
      const values = optionValues.get(option.name) ?? new Set<string>();
      values.add(option.value);
      optionValues.set(option.name, values);
    }
  }

  return Array.from(optionValues, ([name, values]) => ({
    name,
    values: Array.from(values),
  })).filter((option) => option.values.length > 1);
}

function getInitialVariant(variants: ProductVariant[]): ProductVariant | undefined {
  return variants.find((variant) => variant.availableForSale) ?? variants[0];
}

export function ProductVariantProvider({
  variants,
  fallbackImage,
  children,
}: {
  variants: ProductVariant[];
  fallbackImage?: ProductImage;
  children: ReactNode;
}) {
  const initialVariant = useMemo(() => getInitialVariant(variants), [variants]);
  const options = useMemo(() => getProductOptions(variants), [variants]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      (initialVariant?.selectedOptions ?? [])
        .filter(isMeaningfulOption)
        .map((option) => [option.name, option.value]),
    ),
  );

  const selectedVariant = useMemo(() => {
    if (!variants.length) {
      return undefined;
    }

    if (!options.length) {
      return variants[0];
    }

    return variants.find((variant) =>
      options.every((option) =>
        variant.selectedOptions.some(
          (selectedOption) =>
            selectedOption.name === option.name &&
            selectedOption.value === selectedOptions[option.name],
        ),
      ),
    );
  }, [options, selectedOptions, variants]);

  function setSelectedOption(name: string, value: string) {
    setSelectedOptions((current) => ({ ...current, [name]: value }));
  }

  return (
    <ProductVariantContext.Provider
      value={{
        fallbackImage,
        options,
        selectedOptions,
        selectedVariant,
        setSelectedOption,
      }}
    >
      {children}
    </ProductVariantContext.Provider>
  );
}

export function useProductVariant() {
  const context = useContext(ProductVariantContext);

  if (!context) {
    throw new Error("Product variant components must be inside ProductVariantProvider.");
  }

  return context;
}
