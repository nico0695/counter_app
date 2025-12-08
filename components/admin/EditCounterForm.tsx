"use client";
import { useEffect, useMemo, useRef } from "react";
import { updateCounterAction } from "@/app/admin/actions";
import styles from "./CreateCounterForm.module.scss";
import { useFormState, useFormStatus } from "react-dom";
import { formatInTimeZone } from "date-fns-tz";
import React from "react";

type Counter = {
  id: string;
  title: string;
  description: string | null;
  bgUrl: string;
  targetDate: string; // ISO
  timezone: string;
};

export default function EditCounterForm({ counter, onSuccess }: { counter: Counter; onSuccess?: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(updateCounterAction as any, { ok: false, error: null } as any);
  const handledRef = useRef(false);

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
        const bgUrl = (form.elements.namedItem('bgUrl') as HTMLInputElement)?.value?.trim();
        const date = (form.elements.namedItem('date') as HTMLInputElement)?.value?.trim();
        if (!title || title.length < 3 || !bgUrl || !date) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" defaultValue={counter.id} />

      <div className={styles.field}>
        <label htmlFor={`title-${counter.id}`}>Título</label>
        <input id={`title-${counter.id}`} name="title" required minLength={3} maxLength={80} defaultValue={counter.title} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`desc-${counter.id}`}>Descripción</label>
        <input id={`desc-${counter.id}`} name="description" maxLength={160} defaultValue={counter.description ?? ''} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`bg-${counter.id}`}>Imagen de fondo (URL)</label>
        <input id={`bg-${counter.id}`} name="bgUrl" type="url" required defaultValue={counter.bgUrl} className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor={`date-${counter.id}`}>Fecha y hora del evento (local)</label>
        <input id={`date-${counter.id}`} name="date" type="datetime-local" required defaultValue={localDateValue} className={styles.input} />
      </div>

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
