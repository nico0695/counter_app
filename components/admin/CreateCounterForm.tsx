"use client";
import { useEffect, useRef, useState } from "react";
import { createCounterAction } from "@/app/[locale]/admin/actions";
import { useTimezoneStore } from "@/store/timezone";
import { useTranslations } from "next-intl";
import styles from "./CreateCounterForm.module.scss";
import { useFormState, useFormStatus } from "react-dom";
import { counterOptions, defaultCounterId } from "@/lib/counterOptions";

type Props = { onSuccess?: () => void };

export default function CreateCounterForm({ onSuccess }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const tz = useTimezoneStore((s) => s.timezone);
  const [state, formAction] = useFormState(createCounterAction as any, { ok: false, error: null } as any);
  const handledRef = useRef(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const t = useTranslations("form");

  useEffect(() => {
    const el = formRef.current?.elements.namedItem("timezone") as HTMLInputElement | null;
    if (el) el.value = tz;
  }, [tz]);

  useEffect(() => {
    if ((state as any)?.ok && !handledRef.current) {
      handledRef.current = true;
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className={styles.form}
      onSubmitCapture={(e) => {
        setClientError(null);
        const form = e.currentTarget as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement)?.value?.trim();
        const date = (form.elements.namedItem('date') as HTMLInputElement)?.value?.trim();
        if (!title || title.length < 3) {
          e.preventDefault();
          setClientError(t('titleMinLength'));
          return;
        }
        if (!date) {
          e.preventDefault();
          setClientError(t('dateRequired'));
          return;
        }
      }}
    >
      <div className={styles.fieldFullWidth}>
        <label htmlFor="title">{t('title')}</label>
        <input id="title" name="title" required placeholder={t('titlePlaceholder')} className={styles.input} />
      </div>

      <div className={styles.fieldFullWidth}>
        <label htmlFor="description">{t('description')}</label>
        <input id="description" name="description" placeholder={t('descriptionPlaceholder')} className={styles.input} />
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor="date">{t('dateLabel')}</label>
          <input id="date" name="date" type="datetime-local" required className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor="counter">{t('counterStyle')}</label>
          <select id="counter" name="counter" defaultValue={defaultCounterId} className={styles.input}>
            {counterOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        <fieldset className={styles.field}>
          <legend>{t('background')}</legend>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="mediaType" value="image" defaultChecked /> {t('backgroundImage')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="mediaType" value="video" /> {t('backgroundVideo')}
            </label>
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor="bgUrl">{t('backgroundUrl')}</label>
          <input id="bgUrl" name="bgUrl" type="url" placeholder={t('backgroundUrlPlaceholder')} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor="posterUrl">{t('posterUrl')}</label>
          <input id="posterUrl" name="posterUrl" type="url" placeholder={t('posterUrlPlaceholder')} className={styles.input} />
        </div>
      </div>

      <fieldset className={styles.fieldFullWidth}>
        <legend>Redes Sociales (opcional)</legend>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor="twitter">Twitter (X)</label>
            <input id="twitter" name="twitter" type="url" placeholder="https://twitter.com/usuario" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="instagram">Instagram</label>
            <input id="instagram" name="instagram" type="url" placeholder="https://instagram.com/usuario" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="tiktok">TikTok</label>
            <input id="tiktok" name="tiktok" type="url" placeholder="https://tiktok.com/@usuario" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="facebook">Facebook</label>
            <input id="facebook" name="facebook" type="url" placeholder="https://facebook.com/usuario" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="externalLink1">Enlace Externo 1</label>
            <input id="externalLink1" name="externalLink1" type="url" placeholder="https://ejemplo.com" className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor="externalLink2">Enlace Externo 2</label>
            <input id="externalLink2" name="externalLink2" type="url" placeholder="https://ejemplo.com" className={styles.input} />
          </div>
        </div>
      </fieldset>

      <input name="timezone" type="hidden" defaultValue={tz} />

      {clientError ? (
        <div role="alert" className={styles.error}>{clientError}</div>
      ) : null}
      {!(state as any)?.ok && (state as any)?.error ? (
        <div role="alert" className={styles.error}>{(state as any).error}</div>
      ) : null}

      <div className={styles.actions}>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("common");
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (<><span className={styles.spinner} />{t('creating')}</>) : t('create')}
    </button>
  );
}
