import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";

interface Props { params: { slug: string } }

export default async function CounterLanding({ params }: Props) {
  const counter = await prisma.counter.findUnique({
    where: { slug: params.slug },
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
    },
  });
  if (!counter || !counter.enabled) return notFound();
  return (
    <CountdownTimer
      title={counter.title}
      description={counter.description}
      bgUrl={counter.bgUrl}
      mediaType={counter.mediaType ?? 'IMAGE'}
      posterUrl={counter.posterUrl ?? null}
      targetDateISO={counter.targetDate.toISOString()}
      eventTimezone={counter.timezone}
      counterId={(counter as any).counter ?? undefined}
    />
  );
}
