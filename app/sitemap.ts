import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Static pages
  const staticPages = [
    {
      url: `${baseUrl}/es`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
  ];

  let counterUrls: MetadataRoute.Sitemap = [];
  try {
    const counters = await prisma.counter.findMany({
      where: { enabled: true },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    counterUrls = counters.flatMap((counter) => [
      {
        url: `${baseUrl}/es/${counter.slug}`,
        lastModified: counter.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/en/${counter.slug}`,
        lastModified: counter.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      },
    ]);
  } catch (error) {
    console.error("Error fetching counters for sitemap:", error);
    // During build time, database might not be available
    // Return only static pages - dynamic routes will be added at runtime
  }

  return [...staticPages, ...counterUrls];
}
