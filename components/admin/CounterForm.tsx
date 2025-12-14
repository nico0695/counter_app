"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createCounterAction, updateCounterAction } from "@/app/[locale]/admin/actions";
import { useTimezoneStore } from "@/store/timezone";
import { useTranslations } from "next-intl";
import { useFormState, useFormStatus } from "react-dom";
import { counterOptions, defaultCounterId } from "@/lib/counterOptions";
import {
  fontOptions,
  sizeOptions,
  defaultFontId,
  defaultSizeId,
  defaultColor,
} from "@/lib/textStyles";
import { formatInTimeZone } from "date-fns-tz";
import CounterPreview, { type PreviewData } from "./CounterPreview";
import styles from "./CounterForm.module.scss";

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

type CounterFormProps = {
  mode: "create" | "edit";
  counter?: Counter;
  onSuccess?: () => void;
  showPreview?: boolean;
};

export default function CounterForm({
  mode,
  counter,
  onSuccess,
  showPreview = false,
}: CounterFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const tz = useTimezoneStore((s) => s.timezone);
  const [clientError, setClientError] = useState<string | null>(null);
  const handledRef = useRef(false);
  const t = useTranslations("form");

  const action = mode === "create" ? createCounterAction : updateCounterAction;
  const [state, formAction] = useFormState(action as any, { ok: false, error: null } as any);

  // Preview state
  const [previewData, setPreviewData] = useState<PreviewData>({
    title: counter?.title || "",
    description: counter?.description || "",
    bgUrl: counter?.bgUrl || "",
    posterUrl: counter?.posterUrl || "",
    mediaType: (counter?.mediaType?.toUpperCase() as "IMAGE" | "VIDEO") || "IMAGE",
    counter: counter?.counter || defaultCounterId,
    targetDate: counter?.targetDate || "",
    titleFont: counter?.titleFont || defaultFontId,
    titleColor: counter?.titleColor || defaultColor,
    titleSize: counter?.titleSize || defaultSizeId,
    descriptionFont: counter?.descriptionFont || defaultFontId,
    descriptionColor: counter?.descriptionColor || defaultColor,
    descriptionSize: counter?.descriptionSize || "sm",
    twitter: counter?.twitter || "",
    instagram: counter?.instagram || "",
    tiktok: counter?.tiktok || "",
    facebook: counter?.facebook || "",
    externalLink1: counter?.externalLink1 || "",
    externalLink2: counter?.externalLink2 || "",
  });

  const debounceTimerRef = useRef<NodeJS.Timeout>();

  const updatePreview = useCallback((updates: Partial<PreviewData>) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setPreviewData((prev) => ({ ...prev, ...updates }));
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const localDateValue = useMemo(() => {
    if (mode === "edit" && counter) {
      try {
        return formatInTimeZone(
          new Date(counter.targetDate),
          counter.timezone,
          "yyyy-MM-dd'T'HH:mm"
        );
      } catch {
        return "";
      }
    }
    return "";
  }, [mode, counter]);

  useEffect(() => {
    const el = formRef.current?.elements.namedItem("timezone") as HTMLInputElement | null;
    if (el && mode === "create") el.value = tz;
  }, [tz, mode]);

  useEffect(() => {
    if ((state as any)?.ok && !handledRef.current) {
      handledRef.current = true;
      if (mode === "create") {
        formRef.current?.reset();
      }
      onSuccess?.();
    }
  }, [state, onSuccess, mode]);

  return (
    <div className={showPreview ? styles.formWithPreview : styles.formOnly}>
      <form
        ref={formRef}
        action={formAction}
        className={styles.form}
        onSubmitCapture={(e) => {
          setClientError(null);
          const form = e.currentTarget as HTMLFormElement;
          const title = (form.elements.namedItem("title") as HTMLInputElement)?.value?.trim();
          const date = (form.elements.namedItem("date") as HTMLInputElement)?.value?.trim();
          if (!title || title.length < 3) {
            e.preventDefault();
            setClientError(t("titleMinLength"));
            return;
          }
          if (!date) {
            e.preventDefault();
            setClientError(t("dateRequired"));
            return;
          }
        }}
      >
        {mode === "edit" && counter && <input type="hidden" name="id" defaultValue={counter.id} />}

        {/* Basic Information Section */}
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
                onChange={(e) => updatePreview({ title: e.target.value })}
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
                onChange={(e) => updatePreview({ description: e.target.value })}
              />
            </div>
          </div>
        </section>

        {/* Text Styling Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("textStyling")}</h2>
          <div className={styles.sectionContent}>
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
                    onChange={(e) => updatePreview({ titleFont: e.target.value })}
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
                    onChange={(e) => updatePreview({ titleColor: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="titleSize">{t("size")}</label>
                  <select
                    id="titleSize"
                    name="titleSize"
                    defaultValue={counter?.titleSize || defaultSizeId}
                    className={styles.input}
                    onChange={(e) => updatePreview({ titleSize: e.target.value })}
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
                    onChange={(e) => updatePreview({ descriptionFont: e.target.value })}
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
                    onChange={(e) => updatePreview({ descriptionColor: e.target.value })}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="descriptionSize">{t("size")}</label>
                  <select
                    id="descriptionSize"
                    name="descriptionSize"
                    defaultValue={counter?.descriptionSize || "sm"}
                    className={styles.input}
                    onChange={(e) => updatePreview({ descriptionSize: e.target.value })}
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

        {/* Date & Design Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t("dateAndDesign")}</h2>
          <div className={styles.sectionContent}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label htmlFor="date">{t("dateLabel")}</label>
                <input
                  id="date"
                  name="date"
                  type="datetime-local"
                  required
                  defaultValue={localDateValue}
                  className={styles.input}
                  onChange={(e) => updatePreview({ targetDate: e.target.value })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="counter">{t("counterStyle")}</label>
                <select
                  id="counter"
                  name="counter"
                  defaultValue={counter?.counter || defaultCounterId}
                  className={styles.input}
                  onChange={(e) => updatePreview({ counter: e.target.value })}
                >
                  {counterOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Background Section */}
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
                    onChange={() => updatePreview({ mediaType: "IMAGE" })}
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
                    onChange={() => updatePreview({ mediaType: "VIDEO" })}
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
                  onChange={(e) => updatePreview({ bgUrl: e.target.value })}
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
                  onChange={(e) => updatePreview({ posterUrl: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
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

        <input name="timezone" type="hidden" defaultValue={counter?.timezone || tz} />

        {clientError ? (
          <div role="alert" className={styles.error}>
            {clientError}
          </div>
        ) : null}
        {!(state as any)?.ok && (state as any)?.error ? (
          <div role="alert" className={styles.error}>
            {(state as any).error}
          </div>
        ) : null}

        <div className={styles.actions}>
          <SubmitButton mode={mode} />
        </div>
      </form>

      {showPreview && (
        <div className={styles.previewColumn}>
          <CounterPreview data={previewData} />
        </div>
      )}
    </div>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
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
