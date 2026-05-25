import type { MetadataRoute } from "next";
import { siteUrl } from "../lib/site-config";

const routes = ["", "/shop", "/about", "/contact", "/faq"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
