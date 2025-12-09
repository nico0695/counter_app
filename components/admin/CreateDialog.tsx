"use client";
import { useState } from "react";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import CreateCounterForm from "@/components/admin/CreateCounterForm";
import styles from "./CreateDialog.module.scss";
import Dialog from "@/components/ui/Dialog";

interface CreateDialogProps {
  isLimitReached: boolean;
  currentCount: number;
  maxCounters: number;
  isAdmin: boolean;
}

export default function CreateDialog({
  isLimitReached,
  currentCount,
  maxCounters,
  isAdmin,
}: CreateDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const t = useTranslations("counter");
  const tDashboard = useTranslations("dashboard");

  return (
    <div>
      <div className={styles.triggerBar}>
        {!isAdmin && (
          <div className={styles.limitInfo}>
            {tDashboard("countersUsed", { current: currentCount, max: maxCounters })}
          </div>
        )}
        <button
          className={styles.trigger}
          onClick={() => setOpen(true)}
          disabled={isLimitReached}
        >
          {t("createButton")}
        </button>
      </div>

      {isLimitReached && (
        <div className={styles.limitAlert}>
          {tDashboard("limitReached")}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen} title={t("createTitle")} titleId="create-title">
        <CreateCounterForm onSuccess={() => { setOpen(false); router.refresh(); }} />
      </Dialog>
    </div>
  );
}
