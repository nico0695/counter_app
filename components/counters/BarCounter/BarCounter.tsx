"use client";

import styles from "./BarCounter.module.scss";
import { useCountdown } from "@/lib/useCountdown";
import { unitMax, pad2 } from "@/lib/counterHelpers";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((value / max) * 100)));
  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{pad2(value)}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function BarCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts, isOver } = useCountdown(targetDateISO);
  if (isOver) return <div className={styles.finished}>¡Evento iniciado!</div>;
  return (
    <div className={styles.root} aria-label="Bar countdown">
      <Bar label="Días" value={parts.days} max={unitMax("days", parts)} />
      <Bar label="Horas" value={parts.hours} max={unitMax("hours", parts)} />
      <Bar label="Minutos" value={parts.minutes} max={unitMax("minutes", parts)} />
      <Bar label="Segundos" value={parts.seconds} max={unitMax("seconds", parts)} />
    </div>
  );
}
