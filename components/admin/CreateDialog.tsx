"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CreateCounterForm from "@/components/admin/CreateCounterForm";
import styles from "./CreateDialog.module.scss";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) setOpen(false);
  }

  return (
    <div>
      <div className={styles.triggerBar}>
        <button className={styles.trigger} onClick={() => setOpen(true)}>crear</button>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-title"
        className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`}
        onClick={onOverlayClick}
        ref={overlayRef}
      >
        <div className={`${styles.dialog} ${open ? styles.dialogOpen : ""}`} ref={dialogRef}>
          <div className={styles.header}>
            <div id="create-title" className={styles.title}>Crear contador</div>
            <button className={styles.close} onClick={() => setOpen(false)} aria-label="Cerrar">✕</button>
          </div>
          <CreateCounterForm onSuccess={() => { setOpen(false); router.refresh(); }} />
        </div>
      </div>
    </div>
  );
}
