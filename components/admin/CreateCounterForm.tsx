"use client";
import { useEffect, useRef } from "react";
import { createCounter } from "@/app/admin/actions";
import { useTimezoneStore } from "@/store/timezone";

export default function CreateCounterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const tz = useTimezoneStore((s) => s.timezone);

  useEffect(() => {
    const el = formRef.current?.elements.namedItem('timezone') as HTMLInputElement | null;
    if (el) el.value = tz;
  }, [tz]);

  return (
    <form ref={formRef} action={createCounter} style={{ display: 'grid', gap: 12 }}>
      <h2>Crear contador</h2>
      <label>
        Título
        <input name="title" required placeholder="Ej: Lanzamiento" />
      </label>
      <label>
        Descripción
        <input name="description" placeholder="Breve descripción" />
      </label>
      <label>
        Imagen de fondo (URL)
        <input name="bgUrl" type="url" required placeholder="https://..." />
      </label>
      <label>
        Fecha y hora del evento (local)
        <input name="date" type="datetime-local" required />
      </label>
      <input name="timezone" type="hidden" defaultValue={tz} />
      <button type="submit">Crear</button>
    </form>
  );
}

