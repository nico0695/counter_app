"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ITimezoneState {
  timezone: string;
  setTimezone: (tz: string) => void;
}

function getDefaultTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

export const useTimezoneStore = create<ITimezoneState>()(
  persist(
    (set) => ({
      timezone: getDefaultTz(),
      setTimezone: (tz) => set({ timezone: tz || "UTC" }),
    }),
    {
      name: "countdown-timezone-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

