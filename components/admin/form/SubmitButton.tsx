"use client";
import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import styles from "../CounterForm.module.scss";

export default function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  const t = useTranslations("common");
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (
        <>
          <span className={styles.spinner} />
          {mode === "create" ? t("creating") : t("saving")}
        </>
      ) : mode === "create" ? (
        t("create")
      ) : (
        t("save")
      )}
    </button>
  );
}
