'use server';

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}

export async function createCounter(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;

  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const bgUrl = String(formData.get('bgUrl') || '').trim();
  const date = String(formData.get('date') || '').trim(); // local datetime from input
  const timezone = String(formData.get('timezone') || '').trim();

  if (!title || !bgUrl || !date || !timezone) {
    throw new Error('Datos inválidos');
  }

  const baseSlug = slugify(title) || 'evento';
  let slug = baseSlug;
  let i = 1;
  while (await prisma.counter.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const utcDate = fromZonedTime(date, timezone);

  await prisma.counter.create({
    data: {
      slug,
      title,
      description: description || null,
      bgUrl,
      targetDate: utcDate,
      timezone,
      userId,
    },
  });

  revalidatePath('/admin/dashboard');
}

export async function getCounter(slug: string) {
  return prisma.counter.findUnique({ where: { slug } });
}

export async function createCounterAction(_prev: any, formData: FormData) {
  try {
    await createCounter(formData);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? 'No se pudo crear el contador' };
  }
}

export async function updateCounter(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;

  const id = String(formData.get('id') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const bgUrl = String(formData.get('bgUrl') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const timezone = String(formData.get('timezone') || '').trim();

  if (!id || !title || !bgUrl || !date || !timezone) throw new Error('Datos inválidos');

  const counter = await prisma.counter.findUnique({ where: { id } });
  if (!counter || counter.userId !== userId) throw new Error('No autorizado');

  const utcDate = fromZonedTime(date, timezone);

  await prisma.counter.update({
    where: { id },
    data: {
      title,
      description: description || null,
      bgUrl,
      targetDate: utcDate,
      timezone,
    },
  });
}

export async function updateCounterAction(_prev: any, formData: FormData) {
  try {
    await updateCounter(formData);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? 'No se pudo actualizar el contador' };
  }
}

export async function deleteCounter(formData: FormData) {
  const session = await getSession();
  if (!session?.user) throw new Error("Unauthorized");
  const userId = (session.user as any).id as string;

  const id = String(formData.get('id') || '').trim();
  if (!id) throw new Error('Datos inválidos');

  const counter = await prisma.counter.findUnique({ where: { id } });
  if (!counter || counter.userId !== userId) throw new Error('No autorizado');

  await prisma.counter.delete({ where: { id } });
}

export async function deleteCounterAction(_prev: any, formData: FormData) {
  try {
    await deleteCounter(formData);
    return { ok: true as const };
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? 'No se pudo eliminar el contador' };
  }
}
