"use client";
import { useTranslations } from "next-intl";
import {
  fontOptions,
  sizeOptions,
  defaultFontId,
  defaultSizeId,
  defaultColor,
} from "@/lib/textStyles";
import { counterOptions, defaultCounterId } from "@/lib/counterOptions";
import styles from "../../CounterForm.module.scss";
import type { SectionProps } from "../types";

export default function StylingSection({ counter, onFieldChange }: SectionProps) {
  const t = useTranslations("form");

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{t("textStyling")}</h2>
      <div className={styles.sectionContent}>
        <fieldset className={styles.fieldset}>
          <legend>{t("counterStyle")}</legend>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="counter">{t("counterStyle")}</label>
              <select
                id="counter"
                name="counter"
                defaultValue={counter?.counter || defaultCounterId}
                className={styles.input}
                onChange={(e) => onFieldChange({ counter: e.target.value })}
              >
                {counterOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>{t("titleStyles")}</legend>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="titleFont">{t("font")}</label>
              <select
                id="titleFont"
                name="titleFont"
                defaultValue={counter?.titleFont || defaultFontId}
                className={styles.input}
                onChange={(e) => onFieldChange({ titleFont: e.target.value })}
              >
                {fontOptions.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="titleColor">{t("color")}</label>
              <input
                id="titleColor"
                name="titleColor"
                type="color"
                defaultValue={counter?.titleColor || defaultColor}
                className={styles.colorInput}
                onChange={(e) => onFieldChange({ titleColor: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="titleSize">{t("size")}</label>
              <select
                id="titleSize"
                name="titleSize"
                defaultValue={counter?.titleSize || defaultSizeId}
                className={styles.input}
                onChange={(e) => onFieldChange({ titleSize: e.target.value })}
              >
                {sizeOptions.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className={styles.fieldset}>
          <legend>{t("descriptionStyles")}</legend>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label htmlFor="descriptionFont">{t("font")}</label>
              <select
                id="descriptionFont"
                name="descriptionFont"
                defaultValue={counter?.descriptionFont || defaultFontId}
                className={styles.input}
                onChange={(e) => onFieldChange({ descriptionFont: e.target.value })}
              >
                {fontOptions.map((font) => (
                  <option key={font.id} value={font.id}>
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="descriptionColor">{t("color")}</label>
              <input
                id="descriptionColor"
                name="descriptionColor"
                type="color"
                defaultValue={counter?.descriptionColor || defaultColor}
                className={styles.colorInput}
                onChange={(e) => onFieldChange({ descriptionColor: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="descriptionSize">{t("size")}</label>
              <select
                id="descriptionSize"
                name="descriptionSize"
                defaultValue={counter?.descriptionSize || "sm"}
                className={styles.input}
                onChange={(e) => onFieldChange({ descriptionSize: e.target.value })}
              >
                {sizeOptions.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
