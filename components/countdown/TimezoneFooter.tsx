"use client";
import { useMemo } from "react";
import { formatInTimeZone } from "date-fns-tz";
import { useTimezoneStore } from "@/store/timezone";
import { COMMON_TIMEZONES } from "@/consts/countdownTimer.constants";
import styles from "./TimezoneFooter.module.scss";

interface TimezoneFooterProps {
  targetDate: Date;
}

export default function TimezoneFooter({ targetDate }: TimezoneFooterProps) {
  const tz = useTimezoneStore((s) => s.timezone);
  const setTimezone = useTimezoneStore((s) => s.setTimezone);

  const formattedTarget = useMemo(() => {
    try {
      return formatInTimeZone(new Date(targetDate.toISOString()), tz, "EEE d MMM yyyy HH:mm zzz");
    } catch {
      return new Date(targetDate.toISOString()).toUTCString();
    }
  }, [targetDate, tz]);

  const handleTimezoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTimezone(e.target.value);
  };

  return (
    <div className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <span className={styles.label}>Fecha del evento</span>
          <span className={styles.value}>{formattedTarget}</span>
        </div>

        <div className={styles.section}>
          <label htmlFor="timezone-select" className={styles.label}>
            Zona horaria
          </label>
          <select
            id="timezone-select"
            value={tz}
            onChange={handleTimezoneChange}
            className={styles.select}
            aria-label="Seleccionar zona horaria"
          >
            {COMMON_TIMEZONES.map((timezone) => (
              <option key={timezone.value} value={timezone.value}>
                {timezone.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
