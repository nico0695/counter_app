"use client";
import { useTranslations } from "next-intl";
import styles from "../../CounterForm.module.scss";
import type { SectionProps } from "../types";

export default function EssentialsSection({
  counter,
  onFieldChange,
  dateValue,
}: SectionProps & { dateValue: string }) {
  const t = useTranslations("form");

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("basicInfo")}</h2>
      <div className={styles.sectionContent}>
        <div className={styles.fieldFullWidth}>
          <label htmlFor="title">{t("title")}</label>
          <input
            id="title"
            name="title"
            required
            minLength={3}
            maxLength={80}
            placeholder={t("titlePlaceholder")}
            defaultValue={counter?.title || ""}
            className={styles.input}
            onChange={(e) => onFieldChange({ title: e.target.value })}
          />
        </div>

        <div className={styles.fieldFullWidth}>
          <label htmlFor="description">{t("description")}</label>
          <input
            id="description"
            name="description"
            maxLength={160}
            placeholder={t("descriptionPlaceholder")}
            defaultValue={counter?.description || ""}
            className={styles.input}
            onChange={(e) => onFieldChange({ description: e.target.value })}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="date">{t("dateLabel")}</label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={dateValue}
            className={styles.input}
            onChange={(e) => onFieldChange({ targetDate: e.target.value })}
          />
        </div>
      </div>
    </section>
  );
}
