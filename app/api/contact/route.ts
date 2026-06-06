import { NextRequest, NextResponse } from "next/server";
import { sendContactInquiry } from "../../../lib/email";

const INQUIRY_TYPES = new Set([
  "Product question",
  "Custom order",
  "Bulk order",
  "Design help",
  "Existing project",
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactRequest = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  inquiryType?: unknown;
  message?: unknown;
  productContext?: unknown;
  website?: unknown;
};

function normalizeString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized.length <= maxLength ? normalized : null;
}

function normalizeOptionalString(
  value: unknown,
  maxLength: number,
): string | undefined | null {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return normalizeString(value, maxLength);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > 15_000) {
    return NextResponse.json({ message: "Request body is too large." }, { status: 413 });
  }

  let body: ContactRequest;

  try {
    body = (await request.json()) as ContactRequest;
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  if (typeof body.website === "string" && body.website.trim()) {
    return NextResponse.json({ sent: true });
  }

  const name = normalizeString(body.name, 100);
  const email = normalizeString(body.email, 254);
  const phone = normalizeOptionalString(body.phone, 40);
  const inquiryType = normalizeString(body.inquiryType, 50);
  const message = normalizeString(body.message, 5_000);
  const productContext = normalizeOptionalString(body.productContext, 200);

  if (
    !name ||
    !email ||
    !EMAIL_PATTERN.test(email) ||
    phone === null ||
    !inquiryType ||
    !INQUIRY_TYPES.has(inquiryType) ||
    !message ||
    productContext === null
  ) {
    return NextResponse.json(
      { message: "Please check the required fields and try again." },
      { status: 400 },
    );
  }

  const result = await sendContactInquiry({
    name,
    email,
    phone,
    inquiryType,
    message,
    productContext,
  });

  if (result.ok === false) {
    return NextResponse.json(
      {
        message:
          result.reason === "configuration"
            ? "Contact email is temporarily unavailable."
            : "We could not send your message. Please try again.",
      },
      { status: result.reason === "configuration" ? 503 : 502 },
    );
  }

  return NextResponse.json({ sent: true });
}
