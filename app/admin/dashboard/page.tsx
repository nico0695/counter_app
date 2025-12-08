import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import CreateCounterForm from "@/components/admin/CreateCounterForm";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getSession();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) return null;
  const counters = await prisma.counter.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Mis contadores</h1>
      <section style={{ marginBlock: 24 }}>
        <CreateCounterForm />
      </section>
      <section>
        {counters.length === 0 ? (
          <p>No hay contadores aún.</p>
        ) : (
          <ul style={{ display: 'grid', gap: 12 }}>
            {counters.map((c) => (
              <li key={c.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
                <strong>{c.title}</strong>
                <div style={{ fontSize: 12, color: '#555' }}>{c.description}</div>
                <div style={{ marginTop: 8 }}>
                  <Link href={`/${c.slug}`}>Ver /{c.slug}</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
