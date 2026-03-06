// app/sitemap.ts — Dynamic sitemap for all 165 constituencies

import type { MetadataRoute } from "next";
import { generateMockData } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-election-live.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = generateMockData();

  const constituencies = data.provinces.flatMap((p) =>
    p.districts.flatMap((d) =>
      d.constituencies.map((c) => ({
        url: `${SITE_URL}/results/${c.id}`,
        lastModified: new Date(),
        changeFrequency: "always" as const,
        priority: 0.9,
      }))
    )
  );

  const provinces = data.provinces.map((p) => ({
    url: `${SITE_URL}/province/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "always" as const,
    priority: 0.8,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1,
    },
    {
      url: `${SITE_URL}/results`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.95,
    },
    ...provinces,
    ...constituencies,
  ];
}
