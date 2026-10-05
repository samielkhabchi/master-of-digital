import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/en/buy/", "/ru/buy/", "/en/search", "/ru/search"] },
    sitemap: `${config.siteUrl}/sitemap.xml`,
  };
}
