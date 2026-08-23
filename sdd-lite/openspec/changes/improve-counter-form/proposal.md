# Proposal

## Routing Digest

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- digest_summary: Rework the oversized admin counter creation form into a clearer, more intuitive UX; bounded to client components and styles, no backend contract change expected.
- feasibility_signal: high — pure client-side UI rework on an existing, working feature.
- scope_sketch_digest: CounterForm create-mode UX + styles + i18n keys; optional dead-code removal; edit-mode inclusion undecided.

## Summary

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- proposal_status: ready
- exploration_performed: true

## Readiness Check

| Gate | Verdict | Severity | Evidence |
|---|---|---|---|
| contradiction | clear | | request aligns with observed form size/UX |
| insufficient_context | clear | | exploration covered live pages, shared form, actions |
| ambiguous_framing | resolved | medium | user decided: wizard for create, collapsible sections for edit, shared structure, all fields accessible |

## Problem And Desired Outcome

The counter creation form (`components/admin/CounterForm.tsx`, 529 lines) renders ~19 fields in a single flat view: identity, schedule/timezone, background image/video, countdown styling (fonts/colors via `lib/counterOptions.ts`), and social links all compete at once. The user reports it is too large, unintuitive, and poor UI/UX.

Desired outcome: a streamlined creation flow with progressive disclosure — grouped steps or sections, clearer visual hierarchy, sensible defaults hiding advanced options — preserving all existing capabilities without changing what a counter can do.

## Initial Scope Sketch

### Likely In Scope

- Restructure `components/admin/CounterForm.tsx` create-mode UX (grouping/steps/collapse per open question)
- Co-located SCSS Modules restyling; `messages/` i18n keys as needed
- Possibly delete dead `components/admin/CreateCounterForm.tsx` (337 lines, unreferenced; its SCSS module is reused by EditCounterForm)

### Likely Out Of Scope

- Server Actions / Prisma schema / API behavior (`app/[locale]/admin/actions.ts`)
- Public `[slug]` countdown page, auth, timezone store logic
- Edit-flow behavioral redesign (pending open question; component is shared)

## Feasibility Signal

| Signal | Observation | Confidence |
|---|---|---|
| Client-only rework | form is a `"use client"` component using useFormState/useFormStatus; actions unchanged | high |
| Shared component risk | CounterForm serves both create and edit routes; changes must respect mode differences | medium |
| i18n impact | new labels/steps require next-intl message additions in both locales | high |

## Open Questions For Spec

| Item | Why It Matters | Status |
|---|---|---|
| Apply the rework to edit mode too? | shared component surface and regression risk | resolved: yes, same section structure in both modes |
| UX pattern per mode | drives design and effort | resolved: wizard multi-step for create; collapsible all-visible sections for edit |
| Field accessibility and ordering | core information-architecture decision | resolved: all fields stay accessible; related fields grouped; most important first (title + target date, background, styling, social links) |
| Dead `CreateCounterForm.tsx` cleanup timing | hygiene value vs scope creep | resolved: delete within this change |

## Approval Notes

- User reviewed and approved scope decisions (2026-08-22): same structure for create/edit, wizard (create) vs collapsible sections (edit), all fields accessible with importance-based ordering, dead code removed in this change. Route to sddl-spec approved.

## Budget Notes

- Exploration reused verified findings from a prior bounded scan (live pages, shared form, actions, options lib); no additional repo reads spent here.
