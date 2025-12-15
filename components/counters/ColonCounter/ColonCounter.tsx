"use client";

import styles from "./ColonCounter.module.scss";
import { useCountdown } from "@/lib/useCountdown";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function ColonCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts } = useCountdown(targetDateISO);
  return (
    <div className={styles.root} aria-label="Classic countdown">
      <div className={styles.group}>
        <span className={styles.value}>{pad2(parts.days)}</span>
        <span className={styles.label}>Días</span>
      </div>
      <div className={styles.group}>
        <span className={styles.value}>{pad2(parts.hours)}</span>
        <span className={styles.label}>Horas</span>
      </div>
      <div className={styles.group}>
        <span className={styles.value}>{pad2(parts.minutes)}</span>
        <span className={styles.label}>Minutos</span>
      </div>
      <div className={styles.group}>
        <span className={styles.value}>{pad2(parts.seconds)}</span>
        <span className={styles.label}>Segundos</span>
      </div>
    </div>
  );
}
