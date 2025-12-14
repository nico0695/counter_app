import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.PUBLIC_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";

  // Get all enabled counters
  const counters = await prisma.counter.findMany({
    where: { enabled: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // Generate counter URLs for both locales
  const counterUrls = counters.flatMap((counter) => [
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

  return [...staticPages, ...counterUrls];
}
