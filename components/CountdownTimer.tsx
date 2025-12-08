"use client";
import styles from "@/components/CountdownTimer.module.scss";
import { useEffect, useMemo, useState } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezoneStore } from "@/store/timezone";

function formatRemaining(ms: number) {
  if (ms <= 0) return "00:00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const dd = String(days).padStart(2, '0');
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${dd}:${hh}:${mm}:${ss}`;
}

export default function CountdownTimer({
  title,
  description,
  bgUrl,
  mediaType,
  posterUrl,
  targetDateISO,
  eventTimezone,
}: {
  title: string;
  description?: string | null;
  bgUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | 'image' | 'video';
  posterUrl?: string | null;
  targetDateISO: string; // stored in UTC
  eventTimezone: string; // original event timezone for display
}) {
  const [now, setNow] = useState<number>(Date.now());
  const tz = useTimezoneStore((s) => s.timezone);
  const setTimezone = useTimezoneStore((s) => s.setTimezone);
  const target = useMemo(() => new Date(targetDateISO).getTime(), [targetDateISO]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = Math.max(0, target - now);
  const formattedTarget = useMemo(() => {
    try {
      return formatInTimeZone(new Date(targetDateISO), tz, "EEE d MMM yyyy HH:mm zzz");
    } catch {
      return new Date(targetDateISO).toUTCString();
    }
  }, [targetDateISO, tz]);

  const isVideo = (mediaType ?? 'IMAGE') === 'VIDEO' || (mediaType ?? 'image') === 'video';
  const effectiveBg = bgUrl && bgUrl.length > 0 ? bgUrl : '/bg/default_bg.jpeg';
  const effectivePoster = posterUrl && posterUrl.length > 0 ? posterUrl : '/bg/default_p.jpeg';

  return (
    <div className={styles.container}>
      {isVideo && bgUrl ? (
        <video
          className={styles.bgVideo}
          src={effectiveBg}
          poster={effectivePoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        />
      ) : (
        <div className={styles.bg} style={{ backgroundImage: `url(${effectiveBg})` }} />
      )}
      <div className={styles.content}>
        <div>
          <div className={styles.title}>{title}</div>
          {description ? <div className={styles.desc}>{description}</div> : null}
          <div className={styles.timer}>{formatRemaining(remaining)}</div>
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
