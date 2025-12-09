'use client';

import styles from './GlassCounter.module.scss';
import { useCountdown } from '@/lib/useCountdown';
import { pad2 } from '@/lib/counterHelpers';

function Panel({ label, value }: { label: string; value: number }) {
  return (
    <div className={styles.panel}>
      <div className={styles.value}>{pad2(value)}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}

export default function GlassCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts, isOver } = useCountdown(targetDateISO);
  if (isOver) return <div className={styles.finished}>¡Evento iniciado!</div>;
  return (
    <div className={styles.root} aria-label="Glass countdown">
      <Panel label="Días" value={parts.days} />
      <Panel label="Horas" value={parts.hours} />
      <Panel label="Minutos" value={parts.minutes} />
      <Panel label="Segundos" value={parts.seconds} />
    </div>
  );
}
