"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateCounterForm from "@/components/admin/CreateCounterForm";
import styles from "./CreateDialog.module.scss";
import Dialog from "@/components/ui/Dialog";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      <div className={styles.triggerBar}>
        <button className={styles.trigger} onClick={() => setOpen(true)}>crear</button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} title="Crear contador" titleId="create-title">
        <CreateCounterForm onSuccess={() => { setOpen(false); router.refresh(); }} />
      </Dialog>
    </div>
  );
}
