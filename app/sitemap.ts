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

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
  }));
}
