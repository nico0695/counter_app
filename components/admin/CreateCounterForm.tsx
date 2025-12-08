"use client";
import { useEffect, useRef } from "react";
import { createCounterAction } from "@/app/admin/actions";
import { useTimezoneStore } from "@/store/timezone";
import styles from "./CreateCounterForm.module.scss";
import { useFormState, useFormStatus } from "react-dom";

type Props = { onSuccess?: () => void };

export default function CreateCounterForm({ onSuccess }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const tz = useTimezoneStore((s) => s.timezone);
  const [state, formAction] = useFormState(createCounterAction as any, { ok: false, error: null } as any);

  useEffect(() => {
    const el = formRef.current?.elements.namedItem("timezone") as HTMLInputElement | null;
    if (el) el.value = tz;
  }, [tz]);

  useEffect(() => {
    if ((state as any)?.ok) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="title">Título</label>
        <input id="title" name="title" required placeholder="Ej: Lanzamiento" className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor="description">Descripción</label>
        <input id="description" name="description" placeholder="Breve descripción" className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor="bgUrl">Imagen de fondo (URL)</label>
        <input id="bgUrl" name="bgUrl" type="url" required placeholder="https://..." className={styles.input} />
      </div>

      <div className={styles.field}>
        <label htmlFor="date">Fecha y hora del evento (local)</label>
        <input id="date" name="date" type="datetime-local" required className={styles.input} />
      </div>

      <input name="timezone" type="hidden" defaultValue={tz} />

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
      {pending ? "Creando…" : "Crear"}
    </button>
  );
}
