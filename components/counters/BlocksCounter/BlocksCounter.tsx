"use client";

import styles from "./BlocksCounter.module.scss";
import { useCountdown } from "@/lib/useCountdown";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function BlocksCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts } = useCountdown(targetDateISO);
  return (
    <div className={styles.root} aria-label="Blocks countdown">
      <div className={styles.item}>
        <div className={styles.value}>{pad2(parts.days)}</div>
        <div className={styles.label}>Días</div>
      </div>
      <div className={styles.item}>
        <div className={styles.value}>{pad2(parts.hours)}</div>
        <div className={styles.label}>Horas</div>
      </div>
      <div className={styles.item}>
        <div className={styles.value}>{pad2(parts.minutes)}</div>
        <div className={styles.label}>Minutos</div>
      </div>
      <div className={styles.item}>
        <div className={styles.value}>{pad2(parts.seconds)}</div>
        <div className={styles.label}>Segundos</div>
      </div>
    </div>
  );
}
