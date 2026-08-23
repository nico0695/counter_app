# Plan

## Execution Digest

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- digest_summary: Five ordered stages — extract sections, build wizard (create), build collapsibles (edit), remove dead code, full QA sweep.
- stage_plan_digest: S1 sections -> S2 wizard -> S3 collapsibles -> S4 dead-code -> S5 QA; strict sequence, per-stage validation.
- validation_digest: corepack pnpm type-check/lint per stage; E2E walkthroughs on S2/S3; reference-free grep plus build on S4; AC1-AC8 sweep on S5.

## Summary

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- planner_terminal: false
- execution_ready: true
- plan_status: ready

## Stage Plan

| Stage Id | Goal | Depends On | Expected Scope | Validation | Touches Code | Approval Required | Status |
|---|---|---|---|---|---|---|---|
| S1-extract-sections | Extract four section components into `components/admin/form/sections/`; CounterForm renders them flat (zero behavior change) | — | `components/admin/form/sections/*`, `CounterForm.tsx` rewrite pass 1 | `corepack pnpm type-check`; FormData name-parity diff vs pre-change inventory; manual smoke create+edit | yes | yes | pending |
| S2-wizard-create | WizardShell for create: steps 1-4 ordered by importance, advance gating via native validation, progress indicator, i18n keys en/es | S1 | `components/admin/form/WizardShell.tsx`, `messages/*.json`, `CounterForm.module.scss` | `corepack pnpm lint` + `type-check`; dev-run E2E create walkthrough (AC1 partial, AC4) | yes | yes | pending |
| S3-collapsible-edit | CollapsibleShell for edit: four visible collapsible sections, persistent save; preview persistence verified in both modes | S2 | `components/admin/form/CollapsibleShell.tsx`, styles, i18n keys | `corepack pnpm lint` + `type-check`; dev-run E2E edit walkthrough (AC2, AC3 spot-check) | yes | yes | pending |
| S4-remove-dead-code | Delete `CreateCounterForm.tsx`, `EditCounterForm.tsx`, orphaned `CreateCounterForm.module.scss` | S3 | three file deletions | zero-reference grep; clean production build | yes | yes | pending |
| S5-qa-sweep | Final closeout: AC1-AC8 checklist, i18n key parity en/es, quality commands | S4 | no source changes (reports only) | `corepack pnpm lint` + `type-check` + `build`; criteria-by-criteria AC verification | no | yes (routing to review) | pending |

## Validation Strategy

- Per code stage: `corepack pnpm type-check` minimum; `lint` where styles/i18n touched.
- Behavior stages (S2/S3): dev-server walkthrough of the real flow, not just compilation.
- S4 proves removal safety by absence of references plus a successful build.
- S5 maps every acceptance criterion (AC1-AC8) to observed evidence and records it in qa-report.md.

## Dependencies And Sequencing

- Strictly linear: each stage builds on the previous output; no stage runs in parallel.
- S1 must land alone first so any regression is attributable to extraction, not navigation changes.
- Deletions (S4) deliberately last so legacy files remain available for field-parity diffing during S1-S3.

## Planner Stop Note

- Objective is `refactor-rework`, not `planner`: planning does not terminate the change. Execution starts only after explicit approval of this plan, and every code-touching stage pauses for its own approval (interactive session).

## Approval Notes

- Plan approved scope includes extended dead-code removal confirmed during design validation (2026-08-22).
