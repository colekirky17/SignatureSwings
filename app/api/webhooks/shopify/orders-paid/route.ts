import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  sendPaidOrderToFulfillment,
  type PaidOrderNotification,
} from "../../../../../lib/email";

export const runtime = "nodejs";

type ShopifyOrderPaidPayload = {
  id?: number | string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  contact_email?: string | null;
  total_price?: string;
  currency?: string;
  line_items?: Array<{
    title?: string;
    variant_title?: string | null;
    sku?: string | null;
    quantity?: number;
    properties?: Array<{
      name?: string;
      value?: string | number | null;
    }>;
  }>;
};

function isValidShopifyHmac(rawBody: string, receivedHmac: string, secret: string) {
  const calculated = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest();
  const received = Buffer.from(receivedHmac, "base64");

  return (
    calculated.length === received.length &&
    timingSafeEqual(calculated, received)
  );
}

function getExpectedShopDomain(): string | null {
  const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();

  return domain
    ? domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase()
    : null;
}

function normalizeOrder(payload: ShopifyOrderPaidPayload): PaidOrderNotification | null {
  if (
    (typeof payload.id !== "number" && typeof payload.id !== "string") ||
    typeof payload.name !== "string" ||
    typeof payload.total_price !== "string" ||
    typeof payload.currency !== "string" ||
    !Array.isArray(payload.line_items)
  ) {
    return null;
  }

  return {
    id: String(payload.id),
    name: payload.name,
    email: payload.contact_email || payload.email,
    phone: payload.phone,
    totalPrice: payload.total_price,
    currency: payload.currency,
    lineItems: payload.line_items.map((item) => ({
      title: item.title || "Untitled product",
      variantTitle: item.variant_title,
      sku: item.sku,
      quantity:
        typeof item.quantity === "number" && Number.isFinite(item.quantity)
          ? item.quantity
          : 0,
      properties: (item.properties ?? [])
        .filter(
          (property) =>
            typeof property.name === "string" &&
            property.value !== null &&
            property.value !== undefined,
        )
        .map((property) => ({
          name: property.name as string,
          value: String(property.value),
        })),
    })),
  };
}

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET?.trim();
  const receivedHmac = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const webhookId = request.headers.get("x-shopify-webhook-id");
  const shopDomain = request.headers.get("x-shopify-shop-domain")?.toLowerCase();
  const expectedShopDomain = getExpectedShopDomain();
  const rawBody = await request.text();

  if (
    !secret ||
    !receivedHmac ||
    !webhookId ||
    topic !== "orders/paid" ||
    (expectedShopDomain && shopDomain !== expectedShopDomain) ||
    !isValidShopifyHmac(rawBody, receivedHmac, secret)
  ) {
    return NextResponse.json({ message: "Invalid webhook." }, { status: 401 });
  }

  let payload: ShopifyOrderPaidPayload;

  try {
    payload = JSON.parse(rawBody) as ShopifyOrderPaidPayload;
  } catch {
    return NextResponse.json({ message: "Invalid payload." }, { status: 400 });
  }

  const order = normalizeOrder(payload);

  if (!order) {
    return NextResponse.json({ message: "Invalid order payload." }, { status: 400 });
  }

  const result = await sendPaidOrderToFulfillment(
    order,
    `shopify-orders-paid/${webhookId}`,
  );

  if (!result.ok) {
    return NextResponse.json(
      { message: "Fulfillment notification failed." },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
