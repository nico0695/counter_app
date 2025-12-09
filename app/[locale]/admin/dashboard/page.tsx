import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getTranslations } from "next-intl/server";
import CreateDialog from "@/components/admin/CreateDialog";
import PathLink from "@/components/admin/PathLink";
import CounterActions from "@/components/admin/CounterActions";
import styles from "./dashboard.module.scss";

interface DashboardPageProps {
  params: { locale: string };
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = params;

  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;

  const t = await getTranslations({ locale, namespace: "dashboard" });

  const counters = await prisma.counter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>
        <CreateDialog />
      </header>
      <section>
        {counters.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <ul className={styles.list}>
            {counters.map((c) => (
              <li key={c.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>{c.title}</div>
                  <CounterActions counter={{
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    bgUrl: c.bgUrl,
                    posterUrl: (c as any).posterUrl ?? null,
                    mediaType: (c as any).mediaType ?? 'IMAGE',
                    targetDate: c.targetDate.toISOString(),
                    timezone: c.timezone,
                    slug: c.slug,
                    counter: (c as any).counter ?? null,
                    twitter: (c as any).twitter ?? null,
                    instagram: (c as any).instagram ?? null,
                    tiktok: (c as any).tiktok ?? null,
                    facebook: (c as any).facebook ?? null,
                    externalLink1: (c as any).externalLink1 ?? null,
                    externalLink2: (c as any).externalLink2 ?? null,
                    titleFont: (c as any).titleFont ?? null,
                    titleColor: (c as any).titleColor ?? null,
                    titleSize: (c as any).titleSize ?? null,
                    descriptionFont: (c as any).descriptionFont ?? null,
                    descriptionColor: (c as any).descriptionColor ?? null,
                    descriptionSize: (c as any).descriptionSize ?? null,
                  }} />
                </div>
                {c.description ? (
                  <div className={styles.cardDesc}>{c.description}</div>
                ) : null}
                <PathLink slug={c.slug} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
