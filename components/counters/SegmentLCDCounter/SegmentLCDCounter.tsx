"use client";

import styles from "./SegmentLCDCounter.module.scss";
import { useCountdown } from "@/lib/useCountdown";
import { pad2 } from "@/lib/counterHelpers";

function LCD({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.lcd}>
      <span className={styles.digits}>{pad2(value)}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default function SegmentLCDCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts, isOver } = useCountdown(targetDateISO);
  if (isOver) return <div className={styles.finished}>¡Evento iniciado!</div>;
  return (
    <div className={styles.root} aria-label="Segment LCD countdown">
      <LCD value={parts.days} label="Días" />
      <LCD value={parts.hours} label="Horas" />
      <LCD value={parts.minutes} label="Minutos" />
      <LCD value={parts.seconds} label="Segundos" />
    </div>
  );
}
