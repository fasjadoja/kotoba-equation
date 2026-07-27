import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const lastModified = new Date();
  return [
    { url: base, lastModified, priority: 1 },
    { url: `${base}/legal/terms`, lastModified, priority: 0.3 },
    { url: `${base}/legal/privacy`, lastModified, priority: 0.3 },
  ];
}
