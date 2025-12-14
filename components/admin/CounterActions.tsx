"use client";
import { useState } from "react";
import styles from "./CounterActions.module.scss";
import { deleteCounterAction } from "@/app/[locale]/admin/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "@/lib/navigation";
import Dialog from "@/components/ui/Dialog";

type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string | null;
  posterUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | "image" | "video";
  targetDate: string;
  timezone: string;
  slug: string;
  counter?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  facebook?: string | null;
  externalLink1?: string | null;
  externalLink2?: string | null;
  titleFont?: string | null;
  titleColor?: string | null;
  titleSize?: string | null;
  descriptionFont?: string | null;
  descriptionColor?: string | null;
  descriptionSize?: string | null;
};

export default function CounterActions({ counter }: { counter: Counter }) {
  const [delOpen, setDelOpen] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  async function onDelete() {
    const fd = new FormData();
    fd.set("id", counter.id);
    const res = (await deleteCounterAction({} as any, fd as any)) as any;
    if (res?.ok) {
      setDelOpen(false);
      show("Eliminado");
      router.refresh();
    } else {
      show(res?.error ?? "No se pudo eliminar");
    }
  }

  return (
    <div className={styles.row}>
      <button
        className={styles.btn}
        onClick={() => router.push(`/admin/counter/edit/${counter.id}`)}
      >
        Editar
      </button>
      <button className={`${styles.btn} ${styles.danger}`} onClick={() => setDelOpen(true)}>
        Eliminar
      </button>

      <Dialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Eliminar contador"
        titleId={`del-title-${counter.id}`}
      >
        <p>¿Seguro que deseas eliminar "{counter.title}"?</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button className={styles.btn} onClick={() => setDelOpen(false)}>
            Cancelar
          </button>
          <button className={`${styles.btn} ${styles.danger}`} onClick={onDelete}>
            Eliminar
          </button>
        </div>
      </Dialog>
    </div>
  );
}
