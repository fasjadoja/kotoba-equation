import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE.url.replace(/\/$/, "");
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      // Search engines and answer engines stay welcome; the bulk-archive crawlers
      // that feed ready-made site clones do not.
      { userAgent: ["CCBot", "Bytespider", "PetalBot", "Amazonbot"], disallow: "/" },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
