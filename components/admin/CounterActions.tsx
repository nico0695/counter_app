"use client";
import { useState } from "react";
import styles from "./CounterActions.module.scss";
import EditCounterForm from "@/components/admin/EditCounterForm";
import { deleteCounterAction } from "@/app/admin/actions";
import { useToast } from "@/components/ui/ToastProvider";
import { useRouter } from "next/navigation";
import Dialog from "@/components/ui/Dialog";

type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string;
  targetDate: string; // ISO
  timezone: string;
  slug: string;
};

export default function CounterActions({ counter }: { counter: Counter }) {
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  async function onDelete() {
    const fd = new FormData();
    fd.set('id', counter.id);
    const res = await deleteCounterAction({} as any, fd as any) as any;
    if (res?.ok) {
      setDelOpen(false);
      show('Eliminado');
      router.refresh();
    } else {
      show(res?.error ?? 'No se pudo eliminar');
    }
  }

  return (
    <div className={styles.row}>
      <button className={styles.btn} onClick={() => setEditOpen(true)}>Editar</button>
      <button className={`${styles.btn} ${styles.danger}`} onClick={() => setDelOpen(true)}>Eliminar</button>

      <Dialog open={editOpen} onOpenChange={setEditOpen} title="Editar contador" titleId={`edit-title-${counter.id}`}>
        <EditCounterForm counter={counter} onSuccess={() => { setEditOpen(false); router.refresh(); show('Guardado'); }} />
      </Dialog>

      <Dialog open={delOpen} onOpenChange={setDelOpen} title="Eliminar contador" titleId={`del-title-${counter.id}`}>
        <p>¿Seguro que deseas eliminar “{counter.title}”?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          <button className={styles.btn} onClick={() => setDelOpen(false)}>Cancelar</button>
          <button className={`${styles.btn} ${styles.danger}`} onClick={onDelete}>Eliminar</button>
        </div>
      </Dialog>
    </div>
  );
}
