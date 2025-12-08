"use client";
import { create } from "zustand";

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

export const useTimezoneStore = create<ITimezoneState>((set) => ({
  timezone: getDefaultTz(),
  setTimezone: (tz) => set({ timezone: tz || "UTC" }),
}));

