# QA Report — improve-counter-form (final closeout)

## Routing

- change_name: improve-counter-form
- review_mode: final
- scope: AC1-AC8 full change closeout
- reviewed_at: 2026-08-23T08:15:00Z
- reviewer: Hermes orchestrator (inline)

## Verdict: pass_with_warnings

All 8 acceptance criteria pass at the static/structural level.
AC1 and AC2 (E2E walkthroughs) are partially validated: build and type-check confirm correctness of the component tree, but interactive browser walkthrough was deferred because it requires a running dev server with authenticated admin session. The production container (`counter_app`, up 4+ months) runs the pre-change code; a rebuild + restart is needed to serve the new form.

## AC Evidence

### AC1 — Create via wizard succeeds
| Check | Result |
|---|---|
| tsc --noEmit | ✓ clean |
| eslint | ✓ clean |
| next build | ✓ exit 0 (16/16 pages) |
| WizardShell renders 4 steps | ✓ essentials → background → styling → social |
| FormData parity (21 fields) | ✓ preserved across wizard steps (panes hidden, not unmounted) |
| E2E browser walkthrough | ⚠ deferred (requires dev server + auth) |

### AC2 — Edit via collapsibles persists
| Check | Result |
|---|---|
| CollapsibleShell renders 4 sections | ✓ same step_* i18n keys as wizard |
| First section expanded by default | ✓ via `<details open>` |
| FormData parity (21 fields) | ✓ all sections mounted, values carried |
| E2E browser walkthrough | ⚠ deferred (requires dev server + auth) |

### AC3 — Field parity
| Check | Result |
|---|---|
| Pre-change inventory vs post-change | ✓ 21/21 name attributes identical |
| No fields dropped | ✓ verified in S1 diff |

### AC4 — Ordering by importance
| Check | Result |
|---|---|
| Essentials: title, description, date | ✓ first step / first section |
| Background: mediaType, bgUrl, posterUrl | ✓ second |
| Styling: counter styles, title/desc font/size/color | ✓ third |
| Social: twitter, instagram, tiktok, facebook, ext links | ✓ last |
| Wizard order matches edit section order | ✓ identical sequence |

### AC5 — Server contract frozen
| Check | Result |
|---|---|
| `git diff main -- app/*/admin/actions.ts` | ✓ empty (no changes) |

### AC6 — i18n parity en/es
| Check | Result |
|---|---|
| EN keys: 84 | ✓ |
| ES keys: 84 | ✓ |
| Missing in either locale | ✓ none |

### AC7 — Dead code removal
| Check | Result |
|---|---|
| grep CreateCounterForm (tsx/ts/scss) | ✓ 0 references |
| grep EditCounterForm (tsx/ts/scss) | ✓ 0 references |
| Files deleted | ✓ CreateCounterForm.tsx, EditCounterForm.tsx, CreateCounterForm.module.scss |
| Build after deletion | ✓ exit 0 |

### AC8 — Quality commands
| Check | Result |
|---|---|
| tsc --noEmit | ✓ exit 0 |
| eslint components/admin/ | ✓ exit 0 |
| next build | ✓ exit 0 (16/16 static pages) |

## Warnings

1. **E2E walkthrough deferred:** AC1 and AC2 require interactive browser testing with an authenticated admin session. Static analysis (tsc, lint, build, field parity) confirms structural correctness. Full E2E validation should happen after rebuild + deploy.
2. **Deploy not restarted:** The running `counter_app` container serves pre-change code. A `docker compose build && docker compose up -d` is needed to serve the improved form.
3. **Duplicate S3 row in execution-log.md:** Pre-existing artifact from session continuity; cosmetic only, no functional impact.

## Files Changed (complete delta)

| File | Action |
|---|---|
| components/admin/form/sections/EssentialsSection.tsx | new (S1) |
| components/admin/form/sections/StylingSection.tsx | new (S1) |
| components/admin/form/sections/BackgroundSection.tsx | new (S1) |
| components/admin/form/sections/SocialLinksSection.tsx | new (S1) |
| components/admin/form/types.ts | new (S1) |
| components/admin/form/WizardShell.tsx | new (S2) |
| components/admin/form/SubmitButton.tsx | new (S2) |
| components/admin/form/CollapsibleShell.tsx | new (S3) |
| components/admin/CounterForm.tsx | modified (S1-S4) |
| components/admin/CounterForm.module.scss | modified (S2-S3) |
| messages/en.json | modified (+7 keys, S2) |
| messages/es.json | modified (+7 keys, S2) |
| components/admin/CreateCounterForm.tsx | deleted (S4) |
| components/admin/EditCounterForm.tsx | deleted (S4) |
| components/admin/CreateCounterForm.module.scss | deleted (S4) |

## Next Action

Await user approval to:
1. Rebuild and restart the `counter_app` container to serve the new form
2. Run E2E walkthrough (create + edit) in the browser
3. Commit and optionally push to `feature/improve-counter-form`
