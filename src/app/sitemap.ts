// app/sitemap.ts — Dynamic sitemap for all 165 constituencies

import type { MetadataRoute } from "next";
import { generateMockData } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nepal-election-live.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const data = generateMockData();

  // Only include URLs that actually exist as pages (no /province/ or /results index — they 404)
  const constituencies = data.provinces.flatMap((p) =>
    p.districts.flatMap((d) =>
      d.constituencies.map((c) => ({
        url: `${SITE_URL}/results/${c.id}`,
        lastModified: new Date(),
        changeFrequency: "always" as const,
        priority: 0.85,
      }))
    )
  );

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "always" as const,
      priority: 1.0,
    },
    ...constituencies,
  ];
}
