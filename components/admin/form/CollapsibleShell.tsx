"use client";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { WIZARD_STEPS, type WizardStepId } from "./WizardShell";
import styles from "../CounterForm.module.scss";

type CollapsibleShellProps = {
  /** Render function: returns the section content for a given section id. */
  children: (sectionId: WizardStepId) => ReactNode;
};

/**
 * Edit-mode navigation around the single shared <form> owned by CounterForm.
 * Uses native <details>/<summary>: every section stays mounted (FormData keeps
 * all values), all sections are directly reachable without stepping, and the
 * first one starts expanded.
 */
export default function CollapsibleShell({ children }: CollapsibleShellProps) {
  const t = useTranslations("form");

  return (
    <div className={styles.collapseGroup} aria-label={t("wizardProgressLabel")}>
      {WIZARD_STEPS.map((id, i) => (
        <details key={id} className={styles.collapseItem} open={i === 0}>
          <summary className={styles.collapseSummary}>
            {t(`step_${id}`)}
            <span className={styles.collapseChevron} aria-hidden="true">
              ▾
            </span>
          </summary>
          <div className={styles.collapseBody}>{children(id)}</div>
        </details>
      ))}
    </div>
  );
}
