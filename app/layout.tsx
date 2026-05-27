import type { Metadata } from "next";
import { AnalyticsScripts } from "../components/analytics-scripts";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { siteUrl } from "../lib/site-config";
import "./globals.css";
import "./product-preview-updates.css";

const defaultTitle = "Signature Swings | Custom Golf Accessories";
const defaultDescription =
  "Explore custom golf accessories, including custom golf ball markers, custom divot repair tools, personalized golf gifts, and bulk order ideas.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | Signature Swings",
  },
  description: defaultDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Signature Swings",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
  },
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
        <AnalyticsScripts />
      </body>
    </html>
  );
}
