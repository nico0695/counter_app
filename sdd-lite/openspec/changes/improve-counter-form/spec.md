# Spec

## Routing Digest

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- digest_summary: Formalizes the approved proposal — shared section structure for create/edit, wizard for create, collapsible sections for edit, importance-based ordering, dead-code removal.
- scope_digest: admin form components + styles + i18n messages; no backend contract change.
- acceptance_digest: 8 criteria covering E2E create/edit flows, full field parity, ordering, contract freeze, i18n completeness, dead-code removal, quality commands.

## Summary

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- spec_status: ready

## Scope Boundary

### In Scope

- Restructure `components/admin/CounterForm.tsx` into shared section building blocks used by both create and edit modes (same grouping and order).
- Create mode (`app/[locale]/admin/counter/new`): multi-step wizard with steps ordered by importance — essentials (title, target date/time, timezone), background, styling, social links.
- Edit mode (`app/[locale]/admin/counter/edit/[id]`): collapsible sections, all visible, same grouping/order as the wizard.
- Reorder/group all fields by importance: title + target date first; background; styling (with sensible defaults); social links last. Every existing field remains accessible.
- Co-located SCSS Modules restyling for the restructured form(s); relocation/rename of `CreateCounterForm.module.scss` (kept alive by EditCounterForm) with import updates.
- next-intl message keys for steps/sections in `messages/en.json` and `messages/es.json`.
- Delete dead `components/admin/CreateCounterForm.tsx`.

### Out Of Scope

- Server Actions contracts in `app/[locale]/admin/actions.ts` (`createCounterAction`, `updateCounterAction` signatures and behavior).
- Prisma schema, database, public `[slug]` countdown page, authentication, `store/timezone` logic.
- Admin dashboard/list pages; any new counter capability or field.

### Non-Goals

- Changing what a counter can do; this is presentation and interaction structure only.
- Redesigning visual identity beyond the form's styles.

## Expected Behavior

| Scenario | Expected Outcome | Evidence Or Notes |
|---|---|---|
| Create via wizard | User progresses through ordered steps; required fields validated before advancing; final submit calls `createCounterAction` and redirects exactly as today | `new/page.tsx`, `actions.ts` |
| Edit via collapsibles | User opens any section directly, edits, saves via `updateCounterAction`; persistence behavior unchanged | `EditCounterClient.tsx` |
| Field parity | All fields present before the change remain reachable in both modes; none dropped | field inventory diff |
| Defaults | Styling section arrives pre-filled with current defaults so it can be skipped | `lib/counterOptions.ts` |
| Validation errors | Server-action errors surface on the relevant step/section without losing entered data | `useFormState` result shape preserved |
| i18n | Step/section labels render translated in en and es | `messages/*.json` |
| Dead code removal | App builds with zero references to `CreateCounterForm.tsx` | grep + build |

## Acceptance Criteria

| Criteria Id | Acceptance Criteria | Validation Hint | Priority |
|---|---|---|---|
| AC1 | Creating a counter through the wizard with only required fields succeeds and redirects as before | dev-run E2E walkthrough | high |
| AC2 | Editing an existing counter through collapsible sections persists changes as before | dev-run E2E walkthrough | high |
| AC3 | Field parity: zero pre-existing form fields missing in either mode | field inventory comparison | high |
| AC4 | Ordering follows importance: title/target date first, social links last, related fields grouped | manual/code review | medium |
| AC5 | Server contract frozen: no diff in `app/[locale]/admin/actions.ts` | git diff check | high |
| AC6 | All new UI strings exist in both locales | key-by-key grep vs `messages/*.json` | medium |
| AC7 | No references to `CreateCounterForm.tsx` remain; its SCSS module survives with updated imports | grep + build | medium |
| AC8 | `pnpm lint` and `pnpm type-check` pass | quality commands | high |

## Risks And Trade-Offs

| Item | Impact | Notes |
|---|---|---|
| Shared-component regression in edit mode | medium | mitigated by AC2 and truly shared section blocks |
| Wizard hides advanced fields from habitual users | low | all fields stay accessible; defaults allow skipping steps |
| `useFormState` result-shape drift breaks error surfacing | medium | keep action return contract untouched (AC5) |
| SCSS module rename ripples into EditCounterForm | low | explicit acceptance criterion AC7 |

## Open Questions And Decisions

| Item | Why It Matters | Needed Before | Status |
|---|---|---|---|
| Apply rework to edit mode too? | surface and risk | — | resolved: yes, same structure (user decision 2026-08-22) |
| UX pattern per mode | drives design | — | resolved: wizard (create) / collapsibles (edit) |
| Field accessibility and ordering | information architecture | — | resolved: all accessible, grouped by importance |
| Dead component cleanup timing | hygiene vs scope | — | resolved: delete within this change |
| Exact wizard step count, names, and whether a final review step exists | shapes component decomposition | design | open |
| Final home/name for `CreateCounterForm.module.scss` | avoids misleading naming | design | open |

## Approval Notes

- Spec formalized from the approved proposal; pending user phase validation before routing to sddl-design.

## Budget Notes

- Full artifact used: one readiness gate was resolved rather than clear; scope spans two routes plus shared components and i18n.
