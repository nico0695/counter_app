"use client";
import { useRouter } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import CounterForm from "@/components/admin/CounterForm";
import { useToast } from "@/components/ui/ToastProvider";
import styles from "./edit.module.scss";

type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string | null;
  posterUrl?: string | null;
  mediaType?: "IMAGE" | "VIDEO" | "image" | "video";
  targetDate: string;
  timezone: string;
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

export default function EditCounterClient({ counter }: { counter: Counter }) {
  const router = useRouter();
  const t = useTranslations("counter");
  const { show } = useToast();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          ← {t("back")}
        </button>
        <h1 className={styles.title}>{t("editTitle")}</h1>
      </header>

      <div className={styles.content}>
        <CounterForm
          mode="edit"
          counter={counter}
          showPreview={true}
          onSuccess={() => {
            show(t("saved"));
            router.push("/admin/dashboard");
          }}
        />
      </div>
    </main>
  );
}
