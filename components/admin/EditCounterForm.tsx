"use client";
import { useEffect, useMemo, useRef } from "react";
import { updateCounterAction } from "@/app/[locale]/admin/actions";
import styles from "./CreateCounterForm.module.scss";
import { useFormState, useFormStatus } from "react-dom";
import { formatInTimeZone } from "date-fns-tz";
import React from "react";
import { counterOptions, defaultCounterId } from "@/lib/counterOptions";
import { fontOptions, sizeOptions, defaultFontId, defaultSizeId, defaultColor } from "@/lib/textStyles";
import { useTranslations } from "next-intl";

type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string | null;
  posterUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | 'image' | 'video';
  targetDate: string; // ISO
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

export default function EditCounterForm({ counter, onSuccess }: { counter: Counter; onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(updateCounterAction as any, { ok: false, error: null } as any);
  const handledRef = useRef(false);
  const t = useTranslations("form");

  const localDateValue = useMemo(() => {
    try {
      // Convert UTC -> stored timezone for input datetime-local
      return formatInTimeZone(new Date(counter.targetDate), counter.timezone, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return '';
    }
  }, [counter.targetDate, counter.timezone]);

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
        const form = e.currentTarget as HTMLFormElement;
        const title = (form.elements.namedItem('title') as HTMLInputElement)?.value?.trim();
        const date = (form.elements.namedItem('date') as HTMLInputElement)?.value?.trim();
        if (!title || title.length < 3 || !date) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" defaultValue={counter.id} />

      <div className={styles.fieldFullWidth}>
        <label htmlFor={`title-${counter.id}`}>{t('title')}</label>
        <input id={`title-${counter.id}`} name="title" required minLength={3} maxLength={80} defaultValue={counter.title} className={styles.input} />
      </div>

      <div className={styles.fieldFullWidth}>
        <label htmlFor={`desc-${counter.id}`}>{t('description')}</label>
        <input id={`desc-${counter.id}`} name="description" maxLength={160} defaultValue={counter.description ?? ''} className={styles.input} />
      </div>

      <fieldset className={styles.fieldFullWidth}>
        <legend>{t('titleStyles')}</legend>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor={`titleFont-${counter.id}`}>{t('font')}</label>
            <select id={`titleFont-${counter.id}`} name="titleFont" defaultValue={counter.titleFont ?? defaultFontId} className={styles.input}>
              {fontOptions.map((font) => (
                <option key={font.id} value={font.id}>{font.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`titleColor-${counter.id}`}>{t('color')}</label>
            <input id={`titleColor-${counter.id}`} name="titleColor" type="color" defaultValue={counter.titleColor ?? defaultColor} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`titleSize-${counter.id}`}>{t('size')}</label>
            <select id={`titleSize-${counter.id}`} name="titleSize" defaultValue={counter.titleSize ?? defaultSizeId} className={styles.input}>
              {sizeOptions.map((size) => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset className={styles.fieldFullWidth}>
        <legend>{t('descriptionStyles')}</legend>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor={`descriptionFont-${counter.id}`}>{t('font')}</label>
            <select id={`descriptionFont-${counter.id}`} name="descriptionFont" defaultValue={counter.descriptionFont ?? defaultFontId} className={styles.input}>
              {fontOptions.map((font) => (
                <option key={font.id} value={font.id}>{font.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor={`descriptionColor-${counter.id}`}>{t('color')}</label>
            <input id={`descriptionColor-${counter.id}`} name="descriptionColor" type="color" defaultValue={counter.descriptionColor ?? defaultColor} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`descriptionSize-${counter.id}`}>{t('size')}</label>
            <select id={`descriptionSize-${counter.id}`} name="descriptionSize" defaultValue={counter.descriptionSize ?? 'sm'} className={styles.input}>
              {sizeOptions.map((size) => (
                <option key={size.id} value={size.id}>{size.name}</option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label htmlFor={`date-${counter.id}`}>{t('dateLabel')}</label>
          <input id={`date-${counter.id}`} name="date" type="datetime-local" required defaultValue={localDateValue} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor={`counter-${counter.id}`}>{t('counterStyle')}</label>
          <select id={`counter-${counter.id}`} name="counter" defaultValue={counter.counter ?? defaultCounterId} className={styles.input}>
            {counterOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
        </div>

        <fieldset className={styles.field}>
          <legend>{t('background')}</legend>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="mediaType" value="image" defaultChecked={(counter.mediaType ?? 'IMAGE') === 'IMAGE' || (counter.mediaType ?? 'image') === 'image'} /> {t('backgroundImage')}
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="radio" name="mediaType" value="video" defaultChecked={(counter.mediaType ?? 'IMAGE') === 'VIDEO' || (counter.mediaType ?? 'image') === 'video'} /> {t('backgroundVideo')}
            </label>
          </div>
        </fieldset>

        <div className={styles.field}>
          <label htmlFor={`bg-${counter.id}`}>{t('backgroundUrl')}</label>
          <input id={`bg-${counter.id}`} name="bgUrl" type="url" defaultValue={counter.bgUrl ?? ''} className={styles.input} />
        </div>

        <div className={styles.field}>
          <label htmlFor={`poster-${counter.id}`}>{t('posterUrl')}</label>
          <input id={`poster-${counter.id}`} name="posterUrl" type="url" defaultValue={counter.posterUrl ?? ''} className={styles.input} />
        </div>
      </div>

      <fieldset className={styles.fieldFullWidth}>
        <legend>Redes Sociales (opcional)</legend>
        <div className={styles.formGrid}>
          <div className={styles.field}>
            <label htmlFor={`twitter-${counter.id}`}>Twitter (X)</label>
            <input id={`twitter-${counter.id}`} name="twitter" type="url" placeholder="https://twitter.com/usuario" defaultValue={counter.twitter ?? ''} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`instagram-${counter.id}`}>Instagram</label>
            <input id={`instagram-${counter.id}`} name="instagram" type="url" placeholder="https://instagram.com/usuario" defaultValue={counter.instagram ?? ''} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`tiktok-${counter.id}`}>TikTok</label>
            <input id={`tiktok-${counter.id}`} name="tiktok" type="url" placeholder="https://tiktok.com/@usuario" defaultValue={counter.tiktok ?? ''} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`facebook-${counter.id}`}>Facebook</label>
            <input id={`facebook-${counter.id}`} name="facebook" type="url" placeholder="https://facebook.com/usuario" defaultValue={counter.facebook ?? ''} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`externalLink1-${counter.id}`}>Enlace Externo 1</label>
            <input id={`externalLink1-${counter.id}`} name="externalLink1" type="url" placeholder="https://ejemplo.com" defaultValue={counter.externalLink1 ?? ''} className={styles.input} />
          </div>
          <div className={styles.field}>
            <label htmlFor={`externalLink2-${counter.id}`}>Enlace Externo 2</label>
            <input id={`externalLink2-${counter.id}`} name="externalLink2" type="url" placeholder="https://ejemplo.com" defaultValue={counter.externalLink2 ?? ''} className={styles.input} />
          </div>
        </div>
      </fieldset>

      <input name="timezone" type="hidden" defaultValue={counter.timezone} />

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
  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (<><span className={styles.spinner} />Guardando…</>) : "Guardar"}
    </button>
  );
}
