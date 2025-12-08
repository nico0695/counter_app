import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CountdownTimer from "@/components/CountdownTimer";

interface Props { params: { slug: string } }

export default async function CounterLanding({ params }: Props) {
  const counter = await prisma.counter.findFirst({
    where: { slug: params.slug, enabled: true },
  });
  if (!counter) return notFound();
  return (
    <CountdownTimer
      title={counter.title}
      description={counter.description}
      bgUrl={counter.bgUrl}
      targetDateISO={counter.targetDate.toISOString()}
      eventTimezone={counter.timezone}
    />
  );
}
