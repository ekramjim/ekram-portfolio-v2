import type { MetadataRoute } from "next";
import { PROJECTS } from "@/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://www.ekram.tech/", changeFrequency: "monthly", priority: 1 },
    { url: "https://www.ekram.tech/projects", changeFrequency: "monthly", priority: 0.7 },
    ...PROJECTS.map((project) => ({
      url: `https://www.ekram.tech/projects/${project.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
