import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "../lib/blog";
import { siteUrl } from "../lib/site-config";

const routes = [
  "",
  "/shop",
  "/about",
  "/contact",
  "/faq",
  "/blog",
  ...getAllBlogPosts().map((post) => `/blog/${post.slug}`),
];

// Add product detail routes once their content and Shopify-backed data are launch-ready.
export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
