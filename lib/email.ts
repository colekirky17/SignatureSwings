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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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
