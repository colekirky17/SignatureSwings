import "server-only";

import { Resend } from "resend";

export type ContactInquiry = {
  name: string;
  email: string;
  phone?: string;
  inquiryType: string;
  message: string;
  productContext?: string;
};

export type SendContactInquiryResult =
  | { ok: true }
  | { ok: false; reason: "configuration" | "provider" };

export type PaidOrderLineItem = {
  title: string;
  variantTitle?: string | null;
  sku?: string | null;
  quantity: number;
  properties: Array<{ name: string; value: string }>;
};

export type PaidOrderNotification = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  totalPrice: string;
  currency: string;
  lineItems: PaidOrderLineItem[];
};

export type SendPaidOrderResult =
  | { ok: true }
  | { ok: false; reason: "configuration" | "provider" };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getFulfillmentEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.FULFILLMENT_FROM_EMAIL?.trim() ||
    process.env.CONTACT_FROM_EMAIL?.trim();
  const to =
    process.env.FULFILLMENT_TO_EMAIL?.trim() ||
    process.env.CONTACT_TO_EMAIL?.trim();

  return apiKey && from && to ? { apiKey, from, to } : null;
}

function getEmailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();

  return apiKey && from && to ? { apiKey, from, to } : null;
}

function buildContactEmail(inquiry: ContactInquiry) {
  const fields = [
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone || "Not provided"],
    ["Inquiry type", inquiry.inquiryType],
    ...(inquiry.productContext
      ? [["Product context", inquiry.productContext] as const]
      : []),
  ];
  const text = [
    "New Signature Swings website inquiry",
    "",
    ...fields.map(([label, value]) => `${label}: ${value}`),
    "",
    "Message:",
    inquiry.message,
  ].join("\n");
  const htmlFields = fields
    .map(
      ([label, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0">${escapeHtml(
          label,
        )}</th><td style="padding:6px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html = `
    <h1 style="font-size:20px">New Signature Swings website inquiry</h1>
    <table style="border-collapse:collapse">${htmlFields}</table>
    <h2 style="font-size:16px;margin-top:24px">Message</h2>
    <p style="white-space:pre-wrap">${escapeHtml(inquiry.message)}</p>
  `;

  return { text, html };
}

export async function sendContactInquiry(
  inquiry: ContactInquiry,
): Promise<SendContactInquiryResult> {
  const configuration = getEmailConfiguration();

  if (!configuration) {
    console.error("Contact email service is not configured.");
    return { ok: false, reason: "configuration" };
  }

  const resend = new Resend(configuration.apiKey);
  const content = buildContactEmail(inquiry);

  try {
    const { error } = await resend.emails.send({
      from: configuration.from,
      to: [configuration.to],
      replyTo: inquiry.email,
      subject: `Signature Swings: ${inquiry.inquiryType}`,
      text: content.text,
      html: content.html,
    });

    if (error) {
      console.error("Resend rejected a contact inquiry.", {
        name: error.name,
        message: error.message,
      });
      return { ok: false, reason: "provider" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Resend contact inquiry failed.", {
      message: error instanceof Error ? error.message : "Unknown email error",
    });
    return { ok: false, reason: "provider" };
  }
}

function getVisibleProperties(lineItem: PaidOrderLineItem) {
  return lineItem.properties.filter(
    (property) =>
      property.name &&
      !property.name.startsWith("_") &&
      property.value.trim().length > 0,
  );
}

function buildPaidOrderEmail(order: PaidOrderNotification) {
  const textItems = order.lineItems.flatMap((item, index) => {
    const properties = getVisibleProperties(item);

    return [
      `${index + 1}. ${item.title}${item.variantTitle ? ` - ${item.variantTitle}` : ""}`,
      `Quantity: ${item.quantity}`,
      ...(item.sku ? [`SKU: ${item.sku}`] : []),
      ...(properties.length
        ? properties.map((property) => `${property.name}: ${property.value}`)
        : ["Customization: None provided"]),
      "",
    ];
  });
  const text = [
    `Paid Shopify order ${order.name}`,
    "",
    `Order ID: ${order.id}`,
    `Customer email: ${order.email || "Not provided"}`,
    `Customer phone: ${order.phone || "Not provided"}`,
    `Total: ${order.totalPrice} ${order.currency}`,
    "",
    "Items and customization:",
    ...textItems,
  ].join("\n");
  const htmlItems = order.lineItems
    .map((item) => {
      const properties = getVisibleProperties(item);
      const propertyRows = properties.length
        ? properties
            .map(
              (property) =>
                `<tr><th align="left" style="padding:4px 12px 4px 0">${escapeHtml(
                  property.name,
                )}</th><td style="padding:4px 0">${escapeHtml(property.value)}</td></tr>`,
            )
            .join("")
        : '<tr><th align="left" style="padding:4px 12px 4px 0">Customization</th><td style="padding:4px 0;color:#a33">None provided</td></tr>';

      return `
        <section style="margin-top:20px;padding-top:16px;border-top:1px solid #ddd">
          <h2 style="font-size:16px;margin:0 0 8px">${escapeHtml(item.title)}</h2>
          <p style="margin:0 0 8px">Quantity: ${item.quantity}${
            item.variantTitle ? ` | Variant: ${escapeHtml(item.variantTitle)}` : ""
          }${item.sku ? ` | SKU: ${escapeHtml(item.sku)}` : ""}</p>
          <table style="border-collapse:collapse">${propertyRows}</table>
        </section>
      `;
    })
    .join("");
  const html = `
    <h1 style="font-size:20px">Paid Shopify order ${escapeHtml(order.name)}</h1>
    <table style="border-collapse:collapse">
      <tr><th align="left" style="padding:6px 12px 6px 0">Order ID</th><td>${escapeHtml(order.id)}</td></tr>
      <tr><th align="left" style="padding:6px 12px 6px 0">Customer email</th><td>${escapeHtml(order.email || "Not provided")}</td></tr>
      <tr><th align="left" style="padding:6px 12px 6px 0">Customer phone</th><td>${escapeHtml(order.phone || "Not provided")}</td></tr>
      <tr><th align="left" style="padding:6px 12px 6px 0">Total</th><td>${escapeHtml(`${order.totalPrice} ${order.currency}`)}</td></tr>
    </table>
    ${htmlItems}
  `;

  return { text, html };
}

export async function sendPaidOrderToFulfillment(
  order: PaidOrderNotification,
  idempotencyKey: string,
): Promise<SendPaidOrderResult> {
  const configuration = getFulfillmentEmailConfiguration();

  if (!configuration) {
    console.error("Fulfillment email service is not configured.");
    return { ok: false, reason: "configuration" };
  }

  const resend = new Resend(configuration.apiKey);
  const content = buildPaidOrderEmail(order);

  try {
    const { error } = await resend.emails.send(
      {
        from: configuration.from,
        to: [configuration.to],
        subject: `Paid order ${order.name}: customization details`,
        text: content.text,
        html: content.html,
      },
      {
        idempotencyKey,
      },
    );

    if (error) {
      console.error("Resend rejected a fulfillment email.", {
        name: error.name,
        message: error.message,
      });
      return { ok: false, reason: "provider" };
    }

    return { ok: true };
  } catch (error) {
    console.error("Resend fulfillment email failed.", {
      message: error instanceof Error ? error.message : "Unknown email error",
    });
    return { ok: false, reason: "provider" };
  }
}
