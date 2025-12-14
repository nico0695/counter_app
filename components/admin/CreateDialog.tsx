"use client";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import styles from "./CreateDialog.module.scss";

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
          onClick={() => router.push("/admin/counter/new")}
          disabled={isLimitReached}
        >
          {t("createButton")}
        </button>
      </div>

      {isLimitReached && <div className={styles.limitAlert}>{tDashboard("limitReached")}</div>}
    </div>
  );
}
