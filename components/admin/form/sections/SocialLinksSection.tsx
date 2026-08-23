"use client";
import { useTranslations } from "next-intl";
import styles from "../../CounterForm.module.scss";
import type { SectionProps } from "../types";

export default function SocialLinksSection({ counter }: SectionProps) {
  const t = useTranslations("form");

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("socialMedia")}</h2>
      <div className={styles.sectionContent}>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="twitter">Twitter (X)</label>
            <input
              id="twitter"
              name="twitter"
              type="url"
              placeholder="https://twitter.com/usuario"
              defaultValue={counter?.twitter || ""}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="instagram">Instagram</label>
            <input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://instagram.com/usuario"
              defaultValue={counter?.instagram || ""}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="tiktok">TikTok</label>
            <input
              id="tiktok"
              name="tiktok"
              type="url"
              placeholder="https://tiktok.com/@usuario"
              defaultValue={counter?.tiktok || ""}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="facebook">Facebook</label>
            <input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="https://facebook.com/usuario"
              defaultValue={counter?.facebook || ""}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="externalLink1">{t("externalLink")} 1</label>
            <input
              id="externalLink1"
              name="externalLink1"
              type="url"
              placeholder="https://ejemplo.com"
              defaultValue={counter?.externalLink1 || ""}
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="externalLink2">{t("externalLink")} 2</label>
            <input
              id="externalLink2"
              name="externalLink2"
              type="url"
              placeholder="https://ejemplo.com"
              defaultValue={counter?.externalLink2 || ""}
              className={styles.input}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
