import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>Countdown Generator</h1>
        <p className={styles.subtitle}>Crea y comparte contadores de eventos.</p>
        <div className={styles.actions}>
          <Link className={styles.primaryLink} href="/login">Ingresar</Link>
        </div>
      </div>
    </main>
  );
}
