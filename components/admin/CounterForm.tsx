"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createCounterAction, updateCounterAction } from "@/app/[locale]/admin/actions";
import { useTimezoneStore } from "@/store/timezone";
import { useTranslations } from "next-intl";
import { useFormState } from "react-dom";
import { defaultCounterId } from "@/lib/counterOptions";
import { defaultFontId, defaultSizeId, defaultColor } from "@/lib/textStyles";
import { formatInTimeZone } from "date-fns-tz";
import CounterPreview, { type PreviewData } from "./CounterPreview";
import EssentialsSection from "./form/sections/EssentialsSection";
import StylingSection from "./form/sections/StylingSection";
import BackgroundSection from "./form/sections/BackgroundSection";
import SocialLinksSection from "./form/sections/SocialLinksSection";
import WizardShell, { type WizardStepId } from "./form/WizardShell";
import CollapsibleShell from "./form/CollapsibleShell";
import SubmitButton from "./form/SubmitButton";
import type { Counter } from "./form/types";
import styles from "./CounterForm.module.scss";

export type { Counter };

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

  // Section order reflects importance: essentials first, background and
  // styling next, social links last (design.md).
  const renderStep = (stepId: WizardStepId) => {
    switch (stepId) {
      case "essentials":
        return (
          <EssentialsSection
            counter={counter}
            onFieldChange={updatePreview}
            dateValue={localDateValue}
          />
        );
      case "background":
        return <BackgroundSection counter={counter} onFieldChange={updatePreview} />;
      case "styling":
        return <StylingSection counter={counter} onFieldChange={updatePreview} />;
      case "social":
        return <SocialLinksSection counter={counter} onFieldChange={updatePreview} />;
    }
  };

  return (
    <div className={showPreview ? styles.formWithPreview : styles.formOnly}>
      <div className={styles.formWrapper}>
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
          {mode === "edit" && counter && (
            <input type="hidden" name="id" defaultValue={counter.id} />
          )}

          {mode === "create" ? (
            <WizardShell submitSlot={<SubmitButton mode="create" />}>{renderStep}</WizardShell>
          ) : (
            <CollapsibleShell>{renderStep}</CollapsibleShell>
          )}

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

          {mode === "edit" && (
            <div className={styles.actions}>
              <SubmitButton mode="edit" />
            </div>
          )}
        </form>
      </div>

      {showPreview && (
        <div className={styles.previewColumn}>
          <CounterPreview data={previewData} />
        </div>
      )}
    </div>
  );
}
