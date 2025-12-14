import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { SessionUser } from "@/interfaces/auth.interfaces";
import { notFound, redirect } from "next/navigation";
import EditCounterClient from "./EditCounterClient";

interface EditCounterPageProps {
  params: { id: string; locale: string };
}

export default async function EditCounterPage({ params }: EditCounterPageProps) {
  const { id } = params;

  const session = await getSession();
  const sessionUser = session?.user as SessionUser | undefined;
  if (!sessionUser) {
    redirect("/login");
  }

  const userId = sessionUser.id;
  const role = sessionUser.role;

  const counter = await prisma.counter.findUnique({
    where: { id },
  });

  if (!counter) {
    notFound();
  }

  // Only allow owner or admin to edit
  if (counter.userId !== userId && role !== "ADMIN") {
    notFound();
  }

  const counterData = {
    ...counter,
    mediaType: (counter as any).mediaType ?? "IMAGE",
    targetDate: counter.targetDate.toISOString(),
  };

  return <EditCounterClient counter={counterData} />;
}
