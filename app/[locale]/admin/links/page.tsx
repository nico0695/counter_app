import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import styles from "./page.module.scss";
import { adminDeleteCounter, adminToggleCounterEnabled } from "../actions";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { SessionUser } from "@/interfaces/auth.interfaces";

export default async function AdminLinksPage({ params }: { params: { locale: string } }) {
  const session = await getSession();
  const user = session?.user as SessionUser | undefined;
  if (user?.role !== "ADMIN") return null;

  const t = await getTranslations({ locale: params.locale, namespace: "links" });
  const tCommon = await getTranslations({ locale: params.locale, namespace: "common" });
  const tNav = await getTranslations({ locale: params.locale, namespace: "nav" });

  const counters = await prisma.counter.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{tNav("links")}</h1>
      </header>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>{t("title")}</th>
            <th>{t("slug")}</th>
            <th>{t("status")}</th>
            <th>{t("user")}</th>
            <th>{t("actions")}</th>
          </tr>
        </thead>
        <tbody>
          {counters.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td className={styles.slug}>
                <Link href={`/${params.locale}/${c.slug}`}>
                  /{params.locale}/{c.slug}
                </Link>
              </td>
              <td>
                <span className={`${styles.badge} ${c.enabled ? styles.badgeOn : styles.badgeOff}`}>
                  {c.enabled ? t("enabled") : t("disabled")}
                </span>
              </td>
              <td>{c.user.email}</td>
              <td>
                <div className={styles.rowActions}>
                  <form action={adminToggleCounterEnabled}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="enabled" value={c.enabled ? "false" : "true"} />
                    <button className={styles.button}>
                      {c.enabled ? t("disable") : t("enable")}
                    </button>
                  </form>
                  <form action={adminDeleteCounter}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={`${styles.button} ${styles.buttonDanger}`}>
                      {tCommon("delete")}
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
