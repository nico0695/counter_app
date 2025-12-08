'use client';
import styles from '@/components/CountdownTimer.module.scss';
import { useMemo, useState } from 'react';
import { formatInTimeZone } from 'date-fns-tz';
import { useTimezoneStore } from '@/store/timezone';
import { counterMap } from '@/components/counters';
import { defaultCounterId } from '@/lib/counterOptions';

export default function CountdownTimer({
  title,
  description,
  bgUrl,
  mediaType,
  posterUrl,
  targetDateISO,
  eventTimezone,
  counterId,
}: {
  title: string;
  description?: string | null;
  bgUrl?: string | null;
  mediaType?: string;
  posterUrl?: string | null;
  targetDateISO: string; // stored in UTC
  eventTimezone: string; // original event timezone for display
  counterId?: string;
}) {
  const tz = useTimezoneStore((s) => s.timezone);
  const setTimezone = useTimezoneStore((s) => s.setTimezone);
  const effectiveId = (counterId && counterMap[counterId]) ? counterId : defaultCounterId;
  const ActiveCounter = counterMap[effectiveId];
  const formattedTarget = useMemo(() => {
    try {
      return formatInTimeZone(
        new Date(targetDateISO),
        tz,
        'EEE d MMM yyyy HH:mm zzz'
      );
    } catch {
      return new Date(targetDateISO).toUTCString();
    }
  }, [targetDateISO, tz]);

  const isVideo =
    (mediaType ?? 'IMAGE') === 'VIDEO' || (mediaType ?? 'image') === 'video';
  const rawBg = (bgUrl ?? '').trim();
  const effectiveBg = rawBg.length > 0 ? rawBg : '/bg/default_bg.jpeg';
  const effectivePoster =
    posterUrl && posterUrl.length > 0 ? posterUrl : '/bg/default_p.jpeg';
  const [videoError, setVideoError] = useState(false);
  const canUseVideo = isVideo && rawBg.length > 0 && !videoError;

  return (
    <div className={styles.container}>
      {canUseVideo ? (
        <video
          className={styles.bgVideo}
          src={effectiveBg}
          poster={effectivePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onError={() => setVideoError(true)}
        />
      ) : (
        <div
          className={styles.bg}
          style={{ backgroundImage: `url(${effectiveBg})` }}
        />
      )}
      <div className={styles.content}>
        <div>
          <div className={styles.title}>{title}</div>
          {description ? (
            <div className={styles.desc}>{description}</div>
          ) : null}
          <div className={styles.timer}>
            <ActiveCounter targetDateISO={targetDateISO} />
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <span>
          Mostrando hora en zona: <strong>{tz}</strong>
        </span>
        <input
          type="text"
          placeholder="Ej: America/Argentina/Buenos_Aires"
          defaultValue={tz}
          onBlur={(e) => setTimezone(e.currentTarget.value)}
          aria-label="Cambiar zona horaria"
        />
        <span>Evento: {formattedTarget}</span>
        <span style={{ opacity: 0.7 }}>(Original: {eventTimezone})</span>
      </div>
    </div>
  );
}
