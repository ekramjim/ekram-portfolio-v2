import type { MetadataRoute } from "next";

// /archive/v1 is kept out of search by an X-Robots-Tag header on the archive itself. It is not disallowed here,
// because a crawler that is blocked from fetching a page never sees that header.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: "https://www.ekram.tech/sitemap.xml",
  };
}
