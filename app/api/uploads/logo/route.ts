import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  isShopifyFileUploadConfigured,
  uploadCustomerLogoToShopify,
} from "../../../../lib/shopify-files";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function sanitizeFilename(filename: string): string {
  const cleanFilename = filename
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return cleanFilename || "customer-logo";
}

async function hasValidImageSignature(file: File): Promise<boolean> {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (file.type === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  if (file.type === "image/png") {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47 &&
      bytes[4] === 0x0d &&
      bytes[5] === 0x0a &&
      bytes[6] === 0x1a &&
      bytes[7] === 0x0a
    );
  }

  if (file.type === "image/webp") {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }

  return false;
}

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");

  if (!origin) {
    return true;
  }

  try {
    return new URL(origin).host === request.nextUrl.host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid upload origin." }, { status: 403 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);

  if (contentLength > MAX_FILE_SIZE + 100_000) {
    return NextResponse.json(
      { message: "Image must be 8 MB or smaller." },
      { status: 413 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Invalid upload." }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { message: "Choose an image file to upload." },
      { status: 400 },
    );
  }

  if (
    !ALLOWED_IMAGE_TYPES.has(file.type) ||
    file.size > MAX_FILE_SIZE ||
    !(await hasValidImageSignature(file))
  ) {
    return NextResponse.json(
      { message: "Use a valid PNG, JPG, or WebP image up to 8 MB." },
      { status: 400 },
    );
  }

  if (!isShopifyFileUploadConfigured()) {
    return NextResponse.json(
      { message: "Image uploads are not configured yet. Please contact support." },
      { status: 503 },
    );
  }

  const originalFilename = file.name.slice(0, 180);
  const storedFilename = `${Date.now()}-${randomUUID()}-${sanitizeFilename(
    originalFilename,
  )}`;
  const uploadedFile = await uploadCustomerLogoToShopify(
    file,
    storedFilename,
    originalFilename,
  );

  if (!uploadedFile) {
    return NextResponse.json(
      { message: "Image upload is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }

  return NextResponse.json({
    uploaded: true,
    fileName: originalFilename,
    fileId: uploadedFile.fileId,
    url: uploadedFile.url,
  });
}
