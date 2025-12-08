"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Dialog.module.scss";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  titleId?: string;
  children: React.ReactNode;
};

export default function Dialog({ open, onOpenChange, title, titleId, children }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onOpenChange(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) onOpenChange(false);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`${styles.overlay} ${styles.overlayOpen}`}
      onClick={onOverlayClick}
      ref={overlayRef}
    >
      <div className={`${styles.dialog} ${styles.dialogOpen}`}>
        <div className={styles.header}>
          <div id={titleId} className={styles.title}>{title}</div>
          <button className={styles.close} onClick={() => onOpenChange(false)} aria-label="Cerrar">✕</button>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
