import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addCartLine,
  CART_COOKIE_NAME,
  getVariantCartProduct,
  type CartLineAttribute,
} from "../../../../lib/shopify-cart";
import {
  CUSTOMIZATION_REQUIRED_KEY,
  hasCompleteCustomization,
  productRequiresCustomization,
} from "../../../../lib/product-customization";

const ATTRIBUTE_KEYS = new Set([
  "Personalization Method",
  "Name",
  "Phone Number",
  "Initials / Short Text",
  "Name or Message",
  "Font Style",
  "Design Request",
  "Logo Upload",
  "Logo File Name",
  "Front Personalization Method",
  "Front Short Text / Initials",
  "Front Design Request",
  "Back Personalization Method",
  "Back Short Text / Initials",
  "Back Design Request",
  CUSTOMIZATION_REQUIRED_KEY,
]);

type AddCartLineRequest = {
  variantId?: unknown;
  attributes?: unknown;
};

function normalizeAttributes(value: unknown): CartLineAttribute[] | null {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value) || value.length > ATTRIBUTE_KEYS.size) {
    return null;
  }

  const attributes: CartLineAttribute[] = [];

  for (const item of value) {
    if (
      !item ||
      typeof item !== "object" ||
      typeof (item as CartLineAttribute).key !== "string" ||
      typeof (item as CartLineAttribute).value !== "string"
    ) {
      return null;
    }

    const key = (item as CartLineAttribute).key.trim();
    const attributeValue = (item as CartLineAttribute).value.trim();

    if (!ATTRIBUTE_KEYS.has(key) || !attributeValue || attributeValue.length > 500) {
      return null;
    }

    attributes.push({ key, value: attributeValue });
  }

  return attributes;
}

function getBuyerIp(request: NextRequest): string | undefined {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

export async function POST(request: NextRequest) {
  let body: AddCartLineRequest;

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 10_000) {
    return NextResponse.json({ message: "Request body is too large." }, { status: 413 });
  }

  try {
    body = (await request.json()) as AddCartLineRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const variantId = typeof body.variantId === "string" ? body.variantId.trim() : "";
  const attributes = normalizeAttributes(body.attributes);

  if (!/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId) || attributes === null) {
    return NextResponse.json({ message: "Invalid cart line." }, { status: 400 });
  }

  const buyerIp = getBuyerIp(request);
  const variant = await getVariantCartProduct(variantId, buyerIp);

  if (variant === null) {
    return NextResponse.json(
      { message: "Shopify is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  if (!variant.availableForSale) {
    return NextResponse.json(
      { message: "This option is currently out of stock." },
      { status: 409 },
    );
  }

  if (
    productRequiresCustomization(variant.product.handle, variant.product.title) &&
    !hasCompleteCustomization(
      variant.product.handle,
      variant.product.title,
      attributes,
    )
  ) {
    return NextResponse.json(
      { message: "Complete the required customization before adding this item." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();
  const existingCartId = cookieStore.get(CART_COOKIE_NAME)?.value;
  let result = await addCartLine(existingCartId, variantId, attributes, buyerIp);

  if (result.ok === false && result.cartNotFound && existingCartId) {
    result = await addCartLine(undefined, variantId, attributes, buyerIp);
  }

  if (result.ok === false) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }

  const response = NextResponse.json({
    added: true,
    totalQuantity: result.totalQuantity,
  });

  response.cookies.set(CART_COOKIE_NAME, result.cartId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
