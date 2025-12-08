import { Link } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";
import styles from "./page.module.scss";

interface HomePageProps {
  params: { locale: string };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>{t("title")}</h1>
        <p className={styles.subtitle}>{t("subtitle")}</p>
        <div className={styles.actions}>
          <Link className={styles.primaryLink} href="/login">{t("loginButton")}</Link>
        </div>
      </div>
    </main>
  );
}
