import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";
import type { ICounter } from "@/interfaces/counter.interfaces";
import type { Metadata } from "next";

interface Props {
  params: { locale: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await Promise.resolve(params);

  const counter = await prisma.counter.findUnique({
    where: { slug },
    select: {
      title: true,
      description: true,
      enabled: true,
    },
  });

  if (!counter || !counter.enabled) {
    return {
      title: "Countdown Not Found",
      description: "This countdown does not exist or is no longer available.",
    };
  }

  const title = counter.title || "Countdown Timer";
  const description = counter.description || "Check out this countdown!";
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const url = `${baseUrl}/${locale}/${slug}`;
  const ogImageUrl = `${baseUrl}/${locale}/${slug}/opengraph-image`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function CounterLanding({ params }: Props) {
  const { slug } = await Promise.resolve(params);

  const counter = await prisma.counter.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      bgUrl: true,
      posterUrl: true,
      mediaType: true,
      counter: true,
      targetDate: true,
      timezone: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
      enabled: true,
      twitter: true,
      instagram: true,
      tiktok: true,
      facebook: true,
      externalLink1: true,
      externalLink2: true,
      titleFont: true,
      titleColor: true,
      titleSize: true,
      descriptionFont: true,
      descriptionColor: true,
      descriptionSize: true,
    },
  });

  if (!counter || !counter.enabled) return notFound();

  return <CountdownTimer counter={counter as ICounter} />;
}
