"use client";
import { useTranslations } from "next-intl";
import styles from "../../CounterForm.module.scss";
import type { SectionProps } from "../types";

export default function BackgroundSection({ counter, onFieldChange }: SectionProps) {
  const t = useTranslations("form");

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("background")}</h2>
      <div className={styles.sectionContent}>
        <fieldset className={styles.fieldset}>
          <legend>{t("mediaType")}</legend>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="mediaType"
                value="image"
                defaultChecked={
                  !counter ||
                  (counter.mediaType ?? "IMAGE") === "IMAGE" ||
                  (counter.mediaType ?? "image") === "image"
                }
                onChange={() => onFieldChange({ mediaType: "IMAGE" })}
              />
              <span>{t("backgroundImage")}</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="mediaType"
                value="video"
                defaultChecked={
                  counter &&
                  ((counter.mediaType ?? "IMAGE") === "VIDEO" ||
                    (counter.mediaType ?? "image") === "video")
                }
                onChange={() => onFieldChange({ mediaType: "VIDEO" })}
              />
              <span>{t("backgroundVideo")}</span>
            </label>
          </div>
        </fieldset>

        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="bgUrl">{t("backgroundUrl")}</label>
            <input
              id="bgUrl"
              name="bgUrl"
              type="url"
              placeholder={t("backgroundUrlPlaceholder")}
              defaultValue={counter?.bgUrl || ""}
              className={styles.input}
              onChange={(e) => onFieldChange({ bgUrl: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="posterUrl">{t("posterUrl")}</label>
            <input
              id="posterUrl"
              name="posterUrl"
              type="url"
              placeholder={t("posterUrlPlaceholder")}
              defaultValue={counter?.posterUrl || ""}
              className={styles.input}
              onChange={(e) => onFieldChange({ posterUrl: e.target.value })}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
