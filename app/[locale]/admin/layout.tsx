import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";
import styles from "./layout.module.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "nav" });

  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }
  const role = (session.user as any)?.role as string | undefined;
  const isAdmin = role === 'ADMIN';

  return (
    <div className={styles.container}>
      {isAdmin ? (
        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Admin navigation">
            <Link className={styles.link} href="/admin/users">{t("users")}</Link>
            <Link className={styles.link} href="/admin/links">{t("links")}</Link>
          </nav>
        </header>
      ) : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
