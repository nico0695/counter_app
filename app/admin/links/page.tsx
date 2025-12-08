import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import styles from './page.module.scss';
import { adminDeleteCounter, adminToggleCounterEnabled } from '../actions';
import Link from 'next/link';

export default async function AdminLinksPage() {
  const session = await getSession();
  const role = (session?.user as any)?.role as string | undefined;
  if (role !== 'ADMIN') return null;

  const counters = await prisma.counter.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Links</h1>
      </header>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Slug</th>
            <th>Estado</th>
            <th>Usuario</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {counters.map((c) => (
            <tr key={c.id}>
              <td>{c.title}</td>
              <td className={styles.slug}>
                <Link href={`/${c.slug}`}>/{c.slug}</Link>
              </td>
              <td>
                <span
                  className={`${styles.badge} ${
                    c.enabled ? styles.badgeOn : styles.badgeOff
                  }`}
                >
                  {c.enabled ? 'enabled' : 'disabled'}
                </span>
              </td>
              <td>{c.user.email}</td>
              <td>
                <div className={styles.rowActions}>
                  <form action={adminToggleCounterEnabled}>
                    <input type="hidden" name="id" value={c.id} />
                    <input
                      type="hidden"
                      name="enabled"
                      value={c.enabled ? 'false' : 'true'}
                    />
                    <button className={styles.button}>
                      {c.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </form>
                  <form action={adminDeleteCounter}>
                    <input type="hidden" name="id" value={c.id} />
                    <button
                      className={`${styles.button} ${styles.buttonDanger}`}
                    >
                      Delete
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
