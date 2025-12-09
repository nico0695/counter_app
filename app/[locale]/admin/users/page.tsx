import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import styles from './page.module.scss';
import {
  adminCreateUser,
  adminDeleteUser,
  adminDisableUserCounters,
  adminToggleUserBlocked,
  adminUpdateUserRole,
  adminUpdateUserMaxCounters,
} from '../actions';

export default async function AdminUsersPage() {
  const session = await getSession();
  const role = (session?.user as any)?.role as string | undefined;
  if (role !== 'ADMIN') return null;

  const users = await prisma.user.findMany({
    orderBy: { email: 'asc' },
    include: { _count: { select: { counters: true } } },
  });

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Usuarios</h1>
        <CreateUserForm />
      </header>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Blocked</th>
            <th>Counters</th>
            <th>Max Links</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                <form
                  className={styles.formInline}
                  action={adminUpdateUserRole}
                >
                  <input type="hidden" name="userId" value={u.id} />
                  <select
                    name="role"
                    defaultValue={u.role}
                    className={styles.select}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                  <button className={styles.button}>Save</button>
                </form>
              </td>
              <td>
                <form
                  className={styles.formInline}
                  action={adminToggleUserBlocked}
                >
                  <input type="hidden" name="userId" value={u.id} />
                  <input
                    type="hidden"
                    name="blocked"
                    value={u.blocked ? 'false' : 'true'}
                  />
                  <button className={styles.button}>
                    {u.blocked ? 'Unblock' : 'Block'}
                  </button>
                </form>
              </td>
              <td>{(u as any)._count.counters}</td>
              <td>
                {u.role === 'USER' ? (
                  <form
                    className={styles.formInline}
                    action={adminUpdateUserMaxCounters}
                  >
                    <input type="hidden" name="userId" value={u.id} />
                    <input
                      type="number"
                      name="maxCounters"
                      defaultValue={u.maxCounters}
                      min="1"
                      className={styles.input}
                      style={{ width: '60px' }}
                    />
                    <button className={styles.button}>Save</button>
                  </form>
                ) : (
                  <span>∞</span>
                )}
              </td>
              <td>
                <div className={styles.rowActions}>
                  <form action={adminDisableUserCounters}>
                    <input type="hidden" name="userId" value={u.id} />
                    <button className={styles.button}>Disable links</button>
                  </form>
                  <form action={adminDeleteUser}>
                    <input type="hidden" name="userId" value={u.id} />
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

function CreateUserForm() {
  return (
    <form className={styles.createBox} action={adminCreateUser}>
      <input
        name="email"
        type="email"
        required
        placeholder="email"
        className={styles.input}
      />
      <input
        name="password"
        type="password"
        required
        placeholder="password"
        className={styles.input}
      />
      <select name="role" defaultValue="USER" className={styles.select}>
        <option value="USER">USER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <button className={`${styles.button} ${styles.buttonPrimary}`}>
        Create
      </button>
    </form>
  );
}
