"use client";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import CounterForm from "@/components/admin/CounterForm";
import styles from "./new.module.scss";

export default function NewCounterPage() {
  const router = useRouter();
  const t = useTranslations("counter");

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← {t("back")}
        </button>
        <h1 className={styles.title}>{t("createTitle")}</h1>
      </header>

      <div className={styles.content}>
        <CounterForm
          mode="create"
          onSuccess={() => {
            router.push("/admin/dashboard");
          }}
        />
      </div>
    </main>
  );
}
