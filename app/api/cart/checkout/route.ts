import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  CART_COOKIE_NAME,
  getCart,
} from "../../../../lib/shopify-cart";
import { hasCompleteCustomization } from "../../../../lib/product-customization";

function getBuyerIp(request: NextRequest): string | undefined {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

export async function POST(request: NextRequest) {
  const cartId = (await cookies()).get(CART_COOKIE_NAME)?.value;

  if (!cartId) {
    return NextResponse.json({ message: "Cart not found." }, { status: 404 });
  }

  const cart = await getCart(cartId, getBuyerIp(request));

  if (cart === undefined) {
    return NextResponse.json(
      { message: "Shopify is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  if (!cart || cart.lines.nodes.length === 0) {
    return NextResponse.json({ message: "Your cart is empty." }, { status: 400 });
  }

  const incompleteLines = cart.lines.nodes.filter(
    (line) =>
      !hasCompleteCustomization(
        line.merchandise.product.handle,
        line.merchandise.product.title,
        line.attributes,
      ),
  );

  if (incompleteLines.length) {
    return NextResponse.json(
      {
        message:
          "Complete the required customization for every item before checkout.",
        incompleteLineIds: incompleteLines.map((line) => line.id),
      },
      { status: 409 },
    );
  }

  return NextResponse.json({ checkoutUrl: cart.checkoutUrl });
}
