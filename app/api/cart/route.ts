import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  CART_COOKIE_NAME,
  getCart,
  removeCartLine,
  updateCartLine,
} from "../../../lib/shopify-cart";

function getBuyerIp(request: NextRequest): string | undefined {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

async function getCartId(): Promise<string | undefined> {
  return (await cookies()).get(CART_COOKIE_NAME)?.value;
}

function validLineId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 500 &&
    /^gid:\/\/shopify\/[^/]+\/.+$/.test(value)
  );
}

export async function GET(request: NextRequest) {
  const cartId = await getCartId();

  if (!cartId) {
    return NextResponse.json({ cart: null });
  }

  const cart = await getCart(cartId, getBuyerIp(request));

  if (cart === undefined) {
    return NextResponse.json(
      { message: "Shopify is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  if (cart === null) {
    const response = NextResponse.json({ cart: null });
    response.cookies.delete(CART_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({ cart });
}

export async function PATCH(request: NextRequest) {
  const cartId = await getCartId();

  if (!cartId) {
    return NextResponse.json({ message: "Cart not found." }, { status: 404 });
  }

  let body: { lineId?: unknown; quantity?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const quantity =
    typeof body.quantity === "number" && Number.isInteger(body.quantity)
      ? body.quantity
      : 0;

  if (!validLineId(body.lineId) || quantity < 1 || quantity > 99) {
    return NextResponse.json({ message: "Invalid cart update." }, { status: 400 });
  }

  const result = await updateCartLine(
    cartId,
    body.lineId,
    quantity,
    getBuyerIp(request),
  );

  if (result.ok === false) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }

  return NextResponse.json({ cart: result.cart });
}

export async function DELETE(request: NextRequest) {
  const cartId = await getCartId();

  if (!cartId) {
    return NextResponse.json({ message: "Cart not found." }, { status: 404 });
  }

  let body: { lineId?: unknown };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (!validLineId(body.lineId)) {
    return NextResponse.json({ message: "Invalid cart line." }, { status: 400 });
  }

  const result = await removeCartLine(cartId, body.lineId, getBuyerIp(request));

  if (result.ok === false) {
    return NextResponse.json({ message: result.message }, { status: 502 });
  }

  return NextResponse.json({ cart: result.cart });
}
