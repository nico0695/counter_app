"use client";

import { useEffect, useMemo, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function breakdown(ms: number): CountdownParts {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function useCountdown(targetDateISO: string) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = useMemo(() => new Date(targetDateISO).getTime(), [targetDateISO]);
  const remainingMs = Math.max(0, target - now);
  const parts = useMemo(() => breakdown(remainingMs), [remainingMs]);
  const isOver = remainingMs <= 0;

  return { remainingMs, parts, isOver };
}
