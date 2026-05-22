import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signature Swings",
  description: "Signature Swings website starter.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
