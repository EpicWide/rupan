import type { MetadataRoute } from "next";

const SITE_URL = "https://newlupin.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dm",
        "/profile",
        "/login",
        "/signup",
        "/auth/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
