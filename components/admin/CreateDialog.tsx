"use client";
import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import CreateCounterForm from "@/components/admin/CreateCounterForm";
import styles from "./CreateDialog.module.scss";
import Dialog from "@/components/ui/Dialog";

export default function CreateDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("counter");

  return (
    <div>
      <div className={styles.triggerBar}>
        <button className={styles.trigger} onClick={() => setOpen(true)}>{t("createButton")}</button>
      </div>

      <Dialog open={open} onOpenChange={setOpen} title={t("createTitle")} titleId="create-title">
        <CreateCounterForm onSuccess={() => { setOpen(false); router.refresh(); }} />
      </Dialog>
    </div>
  );
}
