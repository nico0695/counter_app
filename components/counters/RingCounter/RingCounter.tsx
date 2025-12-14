"use client";

import styles from "./RingCounter.module.scss";
import { useCountdown } from "@/lib/useCountdown";
import { unitMax, pad2 } from "@/lib/counterHelpers";

function Ring({ label, value, max }: { label: string; value: number; max: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, value / max));
  const dash = circumference * progress;
  return (
    <div className={styles.ring}>
      <svg width="100" height="100" viewBox="0 0 100 100" className={styles.svg}>
        <circle cx="50" cy="50" r={radius} className={styles.bg} />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className={styles.fg}
          style={{ strokeDasharray: `${dash} ${circumference}` }}
        />
      </svg>
      <div className={styles.center}>
        <div className={styles.value}>{pad2(value)}</div>
        <div className={styles.label}>{label}</div>
      </div>
    </div>
  );
}

export default function RingCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts, isOver } = useCountdown(targetDateISO);
  if (isOver) return <div className={styles.finished}>¡Evento iniciado!</div>;
  return (
    <div className={styles.root} aria-label="Ring countdown">
      <Ring label="Días" value={parts.days} max={unitMax("days", parts)} />
      <Ring label="Horas" value={parts.hours} max={unitMax("hours", parts)} />
      <Ring label="Minutos" value={parts.minutes} max={unitMax("minutes", parts)} />
      <Ring label="Segundos" value={parts.seconds} max={unitMax("seconds", parts)} />
    </div>
  );
}
