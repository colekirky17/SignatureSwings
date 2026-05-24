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
        <div className="site-shell">
          <SiteHeader />
          <div className="site-main">
            <div className="container">{children}</div>
          </div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
