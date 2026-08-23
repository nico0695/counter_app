"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import styles from "../CounterForm.module.scss";

export const WIZARD_STEPS = ["essentials", "background", "styling", "social"] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number];

const STEP_FIELD_IDS: Record<WizardStepId, string[]> = {
  essentials: ["title", "description", "date"],
  background: ["bgUrl", "posterUrl"],
  styling: [
    "counter",
    "titleFont",
    "titleColor",
    "titleSize",
    "descriptionFont",
    "descriptionColor",
    "descriptionSize",
  ],
  social: ["twitter", "instagram", "tiktok", "facebook", "externalLink1", "externalLink2"],
};

type WizardShellProps = {
  /** Render function: returns the section content for a given step. */
  children: (stepId: WizardStepId) => ReactNode;
  /** Submit button rendered in the footer of the last step. */
  submitSlot: ReactNode;
};

/**
 * Create-mode navigation around the single shared <form> owned by CounterForm.
 * This component never renders a <form> itself. All steps stay mounted (hidden
 * via CSS) so FormData keeps every field value on submit; only visibility
 * changes between steps.
 */
export default function WizardShell({ children, submitSlot }: WizardShellProps) {
  const t = useTranslations("form");
  const [stepIndex, setStepIndex] = useState(0);
  const stepId = WIZARD_STEPS[stepIndex];
  const isLastStep = stepIndex === WIZARD_STEPS.length - 1;
  const isFirstStep = stepIndex === 0;

  const goToStep = (next: number) => {
    setStepIndex(next);
    document.getElementById("wizard-top")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleNext = () => {
    // Native constraint validation scoped to the current step's fields.
    for (const fieldId of STEP_FIELD_IDS[stepId]) {
      const el = document.getElementById(fieldId);
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        if (!el.checkValidity()) {
          el.reportValidity();
          return;
        }
      }
    }
    if (!isLastStep) goToStep(stepIndex + 1);
  };

  return (
    <div>
      <div id="wizard-top" />
      <ol className={styles.wizardProgress} aria-label={t("wizardProgressLabel")}>
        {WIZARD_STEPS.map((id, i) => (
          <li
            key={id}
            className={
              i === stepIndex
                ? `${styles.wizardStep} ${styles.wizardStepActive}`
                : i < stepIndex
                  ? `${styles.wizardStep} ${styles.wizardStepDone}`
                  : styles.wizardStep
            }
            aria-current={i === stepIndex ? "step" : undefined}
          >
            {i + 1}. {t(`step_${id}`)}
          </li>
        ))}
      </ol>

      {WIZARD_STEPS.map((id) => (
        <div key={id} className={id === stepId ? styles.wizardPane : styles.wizardPaneHidden}>
          {children(id)}
        </div>
      ))}

      <div className={styles.actions}>
        {!isFirstStep && (
          <button
            type="button"
            className={styles.wizardBackBtn}
            onClick={() => goToStep(stepIndex - 1)}
          >
            ← {t("wizardBack")}
          </button>
        )}
        {isLastStep ? (
          submitSlot
        ) : (
          <button type="button" className={styles.submit} onClick={handleNext}>
            {t("wizardNext")} →
          </button>
        )}
      </div>
    </div>
  );
}
