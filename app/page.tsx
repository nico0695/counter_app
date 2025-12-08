import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ display: 'grid', placeItems: 'center', minHeight: '100dvh' }}>
      <div style={{ textAlign: 'center' }}>
        <h1>Countdown Generator</h1>
        <p>Crea y comparte contadores de eventos.</p>
        <div style={{ marginTop: 16 }}>
          <Link href="/login">Ingresar</Link>
        </div>
      </div>
    </main>
  );
}

