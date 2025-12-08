import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CreateDialog from "@/components/admin/CreateDialog";
import PathLink from "@/components/admin/PathLink";
import styles from "./dashboard.module.scss";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const counters = await prisma.counter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Mis contadores</h1>
        <CreateDialog />
      </header>
      <section>
        {counters.length === 0 ? (
          <p className={styles.empty}>No hay contadores aún.</p>
        ) : (
          <ul className={styles.list}>
            {counters.map((c) => (
              <li key={c.id} className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>{c.title}</div>
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
