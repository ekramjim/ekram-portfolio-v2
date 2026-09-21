import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.ekram.tech/", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.ekram.tech/projects", changeFrequency: "monthly", priority: 0.7 },
  ];
}
