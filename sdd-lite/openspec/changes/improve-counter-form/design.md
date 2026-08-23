# Design

## Routing Digest

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- digest_summary: Decompose the monolithic CounterForm into shared section blocks plus two thin mode shells (wizard for create, collapsibles for edit); delete both dead legacy form components and their orphaned SCSS module.
- affected_areas_digest: components/admin (form rewrite + new form/ dir), messages/*.json (new keys), three dead files removed; actions.ts untouched.
- interfaces_digest: FormData field names and action result shape { ok, error } frozen; CounterFormProps public API preserved.

## Summary

- change_name: improve-counter-form
- objective: refactor-rework
- route: continue-lite
- design_status: ready

## Design Overview

Split today's 529-line `CounterForm.tsx` into:

1. **Section blocks** (`components/admin/form/sections/`) — four presentational, controlled components with no submit logic:
   - `EssentialsSection`: title, description, target date/time, timezone (importance rank 1)
   - `BackgroundSection`: media type (image/video), URL, poster (rank 2)
   - `StylingSection`: countdown style (`lib/counterOptions`) + title/description font, color, size (rank 3)
   - `SocialLinksSection`: 4 social networks + 2 external links (rank 4)

   Each receives current values + an `onChange` updater wired to shared preview state; field `name` attributes are byte-identical to today's so FormData is unchanged.

2. **Mode shells** sharing stateful plumbing (`useFormState`, preview state, success/error handling):
   - `WizardShell` (create): ordered steps 1→4, Next/Back, progress indicator; advancing runs client-side validity check on the step's fields (HTML5 constraint validation via form ref); submit button only on the last step.
   - `CollapsibleShell` (edit): four `<details>`-style sections all rendered and accessible, first expanded; single persistent save button.

3. **`CounterForm.tsx` stays as the public entry** with its current props (`mode`, `counter`, `onSuccess`, `showPreview`) and internally routes to the matching shell — `new/page.tsx` and `EditCounterClient.tsx` need no behavioral change. Side-by-side live preview (`CounterPreview`) is preserved in both modes and persists across steps/sections.

Dead code: delete `CreateCounterForm.tsx`, `EditCounterForm.tsx` (both unreferenced — verified) and the now-orphaned `CreateCounterForm.module.scss`.

## Affected Areas

| Path Or Module | Planned Change | Risk |
|---|---|---|
| `components/admin/CounterForm.tsx` | Rewrite as thin mode dispatcher over shared plumbing | medium |
| `components/admin/form/sections/*` | New: four section components extracted from existing JSX | low |
| `components/admin/form/WizardShell.tsx`, `CollapsibleShell.tsx` | New: mode-specific navigation around the same form element | medium |
| `components/admin/CounterForm.module.scss` | Restructure for steps/collapsibles; keep preview layout styles | low |
| `messages/en.json`, `messages/es.json` | Add wizard navigation + section keys (both locales, key-parity) | low |
| `CreateCounterForm.tsx`, `EditCounterForm.tsx`, `CreateCounterForm.module.scss` | Delete (dead/orphaned, zero importers) | low |
| `app/[locale]/admin/actions.ts` | No change (contract frozen, AC5) | — |

## Interfaces, Data, And State

- FormData field names unchanged → `createCounterAction` / `updateCounterAction` untouched; result shape `{ ok, error }` preserved.
- Shared state lives in the common parent: `previewData` (existing `PreviewData` shape), `useFormState` pair, timezone store read — sections stay stateless/presentational.
- Step gating uses native form validation per step (no new validation library, no zod/react-hook-form dependency).
- Success flows unchanged: create redirects via `onSuccess`, edit shows toast then redirects.

## Alternatives And Trade-Offs

| Option | Decision | Why |
|---|---|---|
| Conditional rendering inside one big component | Rejected | keeps the 500+ line file growing; poor maintainability |
| Wizard for both modes | Rejected | user decision: edit requires direct access without stepping |
| Form library (react-hook-form + zod) | Rejected | new dependencies and data-flow rewrite for no functional gain; conflicts with contract-freeze spirit |

## Open Technical Questions

| Item | Why It Matters | Needed Before | Status |
|---|---|---|---|
| Exact wizard step count/names and optional final review step | shapes shell markup and i18n keys | execution | resolved-by-design: 4 steps as listed; no separate review step; submit lives in step 4 |
| Final home/name for inherited SCSS | avoids misleading naming | execution | resolved-by-design: module deleted outright (no surviving consumer after cleanup) |
| Advance-blocking vs warning on invalid step | validation UX | execution | resolved-by-design: block advance, inline message |

## Approval Notes

- Pending user phase validation; includes one evidence-driven scope refinement beyond spec AC7 (EditCounterForm.tsx + orphaned SCSS added to dead-code removal — same category, zero importers).

## Budget Notes
