"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import styles from "./ToastProvider.module.scss";

type Toast = { id: number; message: string };

type ToastContextValue = {
  show: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const value = useMemo<ToastContextValue>(() => ({
    show: (message, duration = 1500) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    },
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles.show}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

