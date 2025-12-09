'use client';

import styles from './ColonCounter.module.scss';
import { useCountdown } from '@/lib/useCountdown';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

export default function ColonCounter({ targetDateISO }: { targetDateISO: string }) {
  const { parts } = useCountdown(targetDateISO);
  const text = `${pad2(parts.days)}:${pad2(parts.hours)}:${pad2(parts.minutes)}:${pad2(parts.seconds)}`;
  return (
    <div className={styles.root} aria-label="Classic countdown">
      <span className={styles.digits}>{text}</span>
    </div>
  );
}
