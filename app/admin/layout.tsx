import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./layout.module.scss";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  const role = (session.user as any)?.role as string | undefined;
  const isAdmin = role === 'ADMIN';
  return (
    <div className={styles.container}>
      {isAdmin ? (
        <header className={styles.header}>
          <nav className={styles.nav} aria-label="Admin navigation">
            <Link className={styles.link} href="/admin/users">Users</Link>
            <Link className={styles.link} href="/admin/links">Links</Link>
          </nav>
        </header>
      ) : null}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
