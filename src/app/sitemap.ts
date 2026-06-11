import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

const lastModified = new Date("2026-06-11T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
