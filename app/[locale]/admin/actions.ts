'use server';

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { fromZonedTime } from "date-fns-tz";
import { hash } from "bcryptjs";
import { counterOptions, defaultCounterId } from "@/lib/counterOptions";
import { defaultFontId, defaultSizeId, defaultColor } from "@/lib/textStyles";

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
  const posterUrl = String(formData.get('posterUrl') || '').trim();
  const mediaTypeRaw = String(formData.get('mediaType') || 'image').trim().toLowerCase();
  const date = String(formData.get('date') || '').trim(); // local datetime from input
  const timezone = String(formData.get('timezone') || '').trim();
  const counterId = String(formData.get('counter') || '').trim();
  const twitter = String(formData.get('twitter') || '').trim();
  const instagram = String(formData.get('instagram') || '').trim();
  const tiktok = String(formData.get('tiktok') || '').trim();
  const facebook = String(formData.get('facebook') || '').trim();
  const externalLink1 = String(formData.get('externalLink1') || '').trim();
  const externalLink2 = String(formData.get('externalLink2') || '').trim();
  const titleFont = String(formData.get('titleFont') || defaultFontId).trim();
  const titleColor = String(formData.get('titleColor') || defaultColor).trim();
  const titleSize = String(formData.get('titleSize') || defaultSizeId).trim();
  const descriptionFont = String(formData.get('descriptionFont') || defaultFontId).trim();
  const descriptionColor = String(formData.get('descriptionColor') || defaultColor).trim();
  const descriptionSize = String(formData.get('descriptionSize') || defaultSizeId).trim();

  if (!title || !date || !timezone) {
    throw new Error('Datos inválidos');
  }
  const mediaType = mediaTypeRaw === 'video' ? 'VIDEO' : 'IMAGE';

  const baseSlug = slugify(title) || 'evento';
  let slug = baseSlug;
  let i = 1;
  while (await prisma.counter.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }

  const utcDate = fromZonedTime(date, timezone);
  const validIds = new Set(counterOptions.map(o => o.id));
  const selectedCounter = validIds.has(counterId) ? counterId : defaultCounterId;

  await prisma.counter.create({
    data: {
      slug,
      title,
      description: description || null,
      bgUrl: bgUrl || null,
      posterUrl: posterUrl || null,
      mediaType: mediaType as any,
      counter: selectedCounter,
      targetDate: utcDate,
      timezone,
      userId,
      twitter: twitter || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      facebook: facebook || null,
      externalLink1: externalLink1 || null,
      externalLink2: externalLink2 || null,
      titleFont,
      titleColor,
      titleSize,
      descriptionFont,
      descriptionColor,
      descriptionSize,
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
  const posterUrl = String(formData.get('posterUrl') || '').trim();
  const mediaTypeRaw = String(formData.get('mediaType') || 'image').trim().toLowerCase();
  const date = String(formData.get('date') || '').trim();
  const timezone = String(formData.get('timezone') || '').trim();
  const counterId = String(formData.get('counter') || '').trim();
  const twitter = String(formData.get('twitter') || '').trim();
  const instagram = String(formData.get('instagram') || '').trim();
  const tiktok = String(formData.get('tiktok') || '').trim();
  const facebook = String(formData.get('facebook') || '').trim();
  const externalLink1 = String(formData.get('externalLink1') || '').trim();
  const externalLink2 = String(formData.get('externalLink2') || '').trim();
  const titleFont = String(formData.get('titleFont') || defaultFontId).trim();
  const titleColor = String(formData.get('titleColor') || defaultColor).trim();
  const titleSize = String(formData.get('titleSize') || defaultSizeId).trim();
  const descriptionFont = String(formData.get('descriptionFont') || defaultFontId).trim();
  const descriptionColor = String(formData.get('descriptionColor') || defaultColor).trim();
  const descriptionSize = String(formData.get('descriptionSize') || defaultSizeId).trim();

  if (!id || !title || !date || !timezone) throw new Error('Datos inválidos');

  const counter = await prisma.counter.findUnique({ where: { id } });
  if (!counter || counter.userId !== userId) throw new Error('No autorizado');

  const utcDate = fromZonedTime(date, timezone);
  const mediaType = mediaTypeRaw === 'video' ? 'VIDEO' : 'IMAGE';
  const validIds = new Set(counterOptions.map(o => o.id));
  const selectedCounter = validIds.has(counterId) ? counterId : undefined;

  await prisma.counter.update({
    where: { id },
    data: {
      title,
      description: description || null,
      bgUrl: bgUrl || null,
      posterUrl: posterUrl || null,
      mediaType: mediaType as any,
      targetDate: utcDate,
      timezone,
      twitter: twitter || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      facebook: facebook || null,
      externalLink1: externalLink1 || null,
      externalLink2: externalLink2 || null,
      titleFont,
      titleColor,
      titleSize,
      descriptionFont,
      descriptionColor,
      descriptionSize,
      ...(selectedCounter ? { counter: selectedCounter } : {}),
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

// Admin helpers and actions
async function requireAdmin() {
  const session = await getSession();
  const role = (session?.user as any)?.role as string | undefined;
  if (!session?.user || role !== 'ADMIN') throw new Error('Admin only');
  return session;
}

export async function adminToggleUserBlocked(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get('userId') || '').trim();
  const blocked = String(formData.get('blocked') || '') === 'true';
  if (!userId) throw new Error('Invalid userId');
  await prisma.user.update({ where: { id: userId }, data: { blocked } });
  revalidatePath('/admin/users');
}

export async function adminUpdateUserRole(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get('userId') || '').trim();
  const role = String(formData.get('role') || '').toUpperCase();
  if (!userId || (role !== 'ADMIN' && role !== 'USER')) throw new Error('Invalid data');
  await prisma.user.update({ where: { id: userId }, data: { role: role as any } });
  revalidatePath('/admin/users');
}

export async function adminDeleteUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get('userId') || '').trim();
  if (!userId) throw new Error('Invalid userId');
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function adminCreateUser(formData: FormData) {
  await requireAdmin();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '').trim();
  const role = (String(formData.get('role') || 'USER').toUpperCase());
  if (!email || !password || (role !== 'ADMIN' && role !== 'USER')) throw new Error('Invalid data');
  const hashed = await hash(password, 10);
  await prisma.user.create({ data: { email, password: hashed, role: role as any } });
  revalidatePath('/admin/users');
}

export async function adminDisableUserCounters(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get('userId') || '').trim();
  if (!userId) throw new Error('Invalid userId');
  await prisma.counter.updateMany({ where: { userId }, data: { enabled: false } });
  revalidatePath('/admin/links');
}

export async function adminToggleCounterEnabled(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  const enabled = String(formData.get('enabled') || '') === 'true';
  if (!id) throw new Error('Invalid id');
  await prisma.counter.update({ where: { id }, data: { enabled } });
  revalidatePath('/admin/links');
}

export async function adminDeleteCounter(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') || '').trim();
  if (!id) throw new Error('Invalid id');
  await prisma.counter.delete({ where: { id } });
  revalidatePath('/admin/links');
}

export async function adminCreateCounterForUser(formData: FormData) {
  await requireAdmin();
  const userId = String(formData.get('userId') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const bgUrl = String(formData.get('bgUrl') || '').trim();
  const posterUrl = String(formData.get('posterUrl') || '').trim();
  const mediaType = String(formData.get('mediaType') || 'IMAGE').toUpperCase();
  const date = String(formData.get('date') || '').trim();
  const timezone = String(formData.get('timezone') || '').trim();
  const twitter = String(formData.get('twitter') || '').trim();
  const instagram = String(formData.get('instagram') || '').trim();
  const tiktok = String(formData.get('tiktok') || '').trim();
  const facebook = String(formData.get('facebook') || '').trim();
  const externalLink1 = String(formData.get('externalLink1') || '').trim();
  const externalLink2 = String(formData.get('externalLink2') || '').trim();
  const titleFont = String(formData.get('titleFont') || defaultFontId).trim();
  const titleColor = String(formData.get('titleColor') || defaultColor).trim();
  const titleSize = String(formData.get('titleSize') || defaultSizeId).trim();
  const descriptionFont = String(formData.get('descriptionFont') || defaultFontId).trim();
  const descriptionColor = String(formData.get('descriptionColor') || defaultColor).trim();
  const descriptionSize = String(formData.get('descriptionSize') || defaultSizeId).trim();
  if (!userId || !title || !date || !timezone) throw new Error('Invalid data');

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
      bgUrl: bgUrl || null,
      posterUrl: posterUrl || null,
      mediaType: (mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE') as any,
      targetDate: utcDate,
      timezone,
      userId,
      twitter: twitter || null,
      instagram: instagram || null,
      tiktok: tiktok || null,
      facebook: facebook || null,
      externalLink1: externalLink1 || null,
      externalLink2: externalLink2 || null,
      titleFont,
      titleColor,
      titleSize,
      descriptionFont,
      descriptionColor,
      descriptionSize,
    },
  });
  revalidatePath('/admin/links');
}
