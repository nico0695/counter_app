'use client';

import styles from './FlipClockCounter.module.scss';
import { useCountdown } from '@/lib/useCountdown';
import { pad2 } from '@/lib/counterHelpers';

function Digit({ value }: { value: number }) {
  const text = pad2(value);
  return (
    <div className={styles.digit} aria-label={`value ${text}`}>
      <div className={styles.top}>{text}</div>
      <div className={styles.bottom}>{text}</div>
    </div>
  );
}

export default function FlipClockCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts, isOver } = useCountdown(targetDateISO);
  if (isOver) return <div className={styles.finished}>¡Evento iniciado!</div>;
  return (
    <div className={styles.root} aria-label="Flip clock countdown">
      <div className={styles.group}>
        <Digit value={parts.days} />
        <span className={styles.label}>Días</span>
      </div>
      <div className={styles.group}>
        <Digit value={parts.hours} />
        <span className={styles.label}>Horas</span>
      </div>
      <div className={styles.group}>
        <Digit value={parts.minutes} />
        <span className={styles.label}>Minutos</span>
      </div>
      <div className={styles.group}>
        <Digit value={parts.seconds} />
        <span className={styles.label}>Segundos</span>
      </div>
    </div>
  );
}
