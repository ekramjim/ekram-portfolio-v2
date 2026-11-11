import type { MetadataRoute } from "next";
import { PRODUCTS } from "@/data/products";
import { PROJECTS } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.ekram.tech/", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.ekram.tech/projects", changeFrequency: "monthly", priority: 0.7 },
    { url: "https://www.ekram.tech/design", changeFrequency: "monthly", priority: 0.7 },
    ...PRODUCTS.map((product) => ({
      url: `https://www.ekram.tech/apps/${product.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PROJECTS.map((project) => ({
      url: `https://www.ekram.tech/projects/${project.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
