import type { Metadata } from "next";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
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
      <body>
        <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
          <SiteHeader />
          <div className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-8">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
