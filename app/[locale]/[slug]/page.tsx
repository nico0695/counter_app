import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";
import type { ICounter } from "@/interfaces/counter.interfaces";

interface Props { params: { locale: string; slug: string } }

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
  return (
    <CountdownTimer counter={counter as ICounter} />
  );
}
