# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Countdown Generator — a Next.js app for creating and sharing customizable countdown pages. Each user creates "counters" (countdowns) with a title, description, background media, target date/timezone, and a visual style; each counter is published at a public `/{locale}/{slug}` URL.

Tech stack: Next.js 14 (App Router) + TypeScript, Prisma (SQLite), NextAuth (Credentials provider), Zustand, date-fns/date-fns-tz, next-intl, SCSS Modules.

## Commands

- `npm run dev` — start dev server
- `npm run build` / `npm run start` — production build/run
- `npm run lint` / `npm run lint:fix` — ESLint (`--max-warnings 0`, so warnings fail CI)
- `npm run format` / `npm run format:check` — Prettier
- `npm run type-check` — `tsc --noEmit`
- `npm run prisma:generate` — regenerate Prisma client after schema changes
- `npm run prisma:migrate` — `prisma migrate dev` (prompts for a migration name)
- No test runner is configured in this repo.

After changing `prisma/schema.prisma`: run `prisma migrate dev --name <message>` then `prisma:generate`. If TS types don't reflect schema changes, stop the dev server, regenerate, restart the editor's TS server, then restart `npm run dev`.

## Environment

Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`. Optional: `PUBLIC_URL` (used for OG image/social-share absolute URLs behind a reverse proxy). Copy `.env.example` to `.env`.

## Architecture

### i18n routing (all app routes are locale-prefixed)

Every route lives under `app/[locale]/...` (`app/layout.tsx` is just the root HTML shell; the real layout is `app/[locale]/layout.tsx`). `middleware.ts` uses `next-intl`'s middleware with `localePrefix: "always"` and locales defined in `i18n.ts` (`en`, `es`; default `es`). Messages are in `messages/{locale}.json`.

Always use the wrappers from `lib/navigation.ts` (`Link`, `redirect`, `usePathname`, `useRouter` from `next-intl/navigation`) instead of `next/navigation` directly — they auto-prefix the current locale. Server components read translations via `getTranslations({ locale, namespace })` from `next-intl/server`.

### Auth & authorization

`lib/auth.ts` configures NextAuth with a single Credentials provider and **JWT** sessions. Notably, `authorize()` auto-creates a user on first login if the email doesn't already exist (no separate signup flow) — existing users are checked against `blocked` and their hashed password. Session/JWT callbacks attach `id` and `role` onto the token/session (typed via `interfaces/auth.interfaces.ts`: `ExtendedUser`, `ExtendedJWT`, `ExtendedSession`, `SessionUser`).

Two roles: `USER` and `ADMIN`. `USER` accounts are capped by `User.maxCounters` (enforced in `createCounter`); `ADMIN` has no cap and can manage all users/counters via `app/[locale]/admin/users` and `app/[locale]/admin/links`. Admin-only server actions in `actions.ts` all funnel through the local `requireAdmin()` helper. `app/[locale]/admin/layout.tsx` gates the whole admin section behind `getSession()` (redirects to `/login`) and only renders the admin nav (Users/Links) when `role === "ADMIN"`.

### Data & server actions

All mutations are Next.js Server Actions in `app/[locale]/admin/actions.ts` (`"use server"`) — there is no separate API layer for CRUD. Two patterns coexist per action: a plain `formData`-taking function (e.g. `createCounter`) used with `<form action={...}>`, plus a `*Action(prevState, formData)` wrapper (e.g. `createCounterAction`) returning `ActionState` (`{ok, error?}`) for `useFormState`-driven client forms.

Key behaviors to preserve when touching counter actions:
- Slugs are generated via `slugify(title)` with numeric-suffix collision handling (`evento`, `evento-1`, ...).
- Target dates are entered as a local datetime + IANA timezone string and converted to UTC with `fromZonedTime` (date-fns-tz) before storing — never store/compare naive local times.
- Ownership check on update/delete: fetch the counter and verify `counter.userId === session.user.id` before mutating.
- `updateCounter` only overwrites the `counter` (style) field if the submitted id is a valid `counterOptions` id — an invalid/missing value leaves the existing style untouched.
- Mutations call `revalidatePath(...)` for the relevant admin list page.

`lib/prisma.ts` exports the singleton Prisma client. Schema is in `prisma/schema.prisma` (SQLite): `User` (email/password/role/blocked/maxCounters) has-many `Counter` (slug, title, styling fields, target date/timezone, media, social links).

### Countdown style variants (plugin-style registry)

Adding/changing a countdown visual style touches three places that must stay in sync:
1. `lib/counterOptions.ts` — the single source of truth: `counterOptions: {id, name}[]` and `defaultCounterId`.
2. `components/counters/index.ts` — maps each `id` to a lazy-loaded (`next/dynamic`, `ssr: false`) component implementing `CounterComponent = ComponentType<{targetDateISO: string}>`. Each variant lives in its own folder under `components/counters/<Name>/` with a co-located `.module.scss`.
3. `components/CountdownTimer.tsx` — public-page renderer that looks up the component via `counterMap`/`counterVariants` by the counter's stored `counter` id, falling back to `defaultCounterId`.

Admin create/edit forms (`components/admin/CounterForm.tsx` and friends) render a `<select>` sourced from `counterOptions`, so a new id added there automatically appears in the UI.

Countdown tick logic itself lives in `lib/useCountdown.ts` (`useCountdown(targetDateISO)`), a client hook that ticks every second via `setInterval` and returns `{remainingMs, parts, isOver}`.

### Text styling (title/description)

Font, color, and size for a counter's title/description are stored as separate DB columns (`titleFont`, `titleColor`, `titleSize`, `descriptionFont`, ...) rather than one JSON blob. Defaults (`defaultFontId`, `defaultSizeId`, `defaultColor`) and the allowed option lists live in `lib/textStyles.ts`; `components/StyledText.tsx` renders text using these fields.

### SEO / social sharing

`app/[locale]/[slug]/opengraph-image.tsx` dynamically generates a per-counter OG image with a fallback chain: image counters use `bgUrl`, video counters use `posterUrl`, and video-without-poster falls back to `public/bg/default_bg.jpeg`. `PUBLIC_URL` (when set) is used to build absolute URLs for these images so sharing works correctly behind a reverse proxy.

### State & routing conventions

- `store/timezone.ts` — Zustand store for the viewer-selected timezone override on public countdown pages (viewers can view a countdown in a timezone other than the one it was created with).
- Path/query helpers: `lib/counterHelpers.ts`, `components/admin/PathLink.tsx`.
- SCSS Modules are co-located with their component (`Component.tsx` + `Component.module.scss`); no global CSS beyond `styles/globals.scss`.

## Conventions

- Import via the `@/*` path alias (maps to repo root), not relative paths across directories.
- ESLint is run with `--max-warnings 0` — treat warnings as build-breaking.
- Prettier: double quotes, semicolons, 100-char print width, trailing commas (ES5), 2-space indent.

<!-- sdd-lite:start generated_at="2026-08-04T14:54:43Z" version="0.1" package_root="harness/sdd-lite" -->
You are a development assistant with access to `sdd-lite`, a structured change workflow for bounded repo changes.

## When to use sdd-lite

Use the `sdd-lite` orchestrator (canonical contract at `harness/sdd-lite/orchestrator/SDDL-ORCHESTRATOR.md`) when one of these is true:

- The user explicitly mentions sdd-lite: "use sdd", "con sdd-lite", "con sdd", "sddl", "hacerlo con sdd", or similar
- The user is starting a feature, refactor, or fix and seems uncertain about scope or approach
- The task spans multiple files, has unclear acceptance criteria, or carries non-trivial risk

Do NOT activate sdd-lite automatically for:

- Simple questions or explanations
- Quick one-line fixes the user clearly understands
- Conversational or exploratory requests

## When to suggest sdd-lite (without forcing it)

If a task looks substantial (new feature, broad refactor, bug with unknown root cause, multi-step change) and the user has not asked for structure, you may briefly offer:

> "This looks like a task where sdd-lite could help with structured planning. Want to use it, or should I proceed directly?"

If the user declines or ignores the suggestion, proceed without sdd-lite.

## When sdd-lite is active

Read and follow the canonical orchestration contract at `harness/sdd-lite/orchestrator/SDDL-ORCHESTRATOR.md`.
That contract is the single source of truth for delegation rules, handoff envelopes, result processing, routing, approvals, and all operational behavior.

Use canonical skills under `harness/sdd-lite/skills/`, runtime standards at `./sdd-lite/skill-catalog.md`, and schemas under `harness/sdd-lite/schemas/`.

Rules:
- Run bootstrap preflight first. If bootstrap files are missing or unusable, stop and run `sddl-init`.
- Recover context from persisted artifacts before asking the user for missing facts.
- Persisted artifacts must remain in English. Chat interaction may be `es` or `en`.

## Platform: Claude Code

### Agent tool delegation

Delegation uses the native **Agent tool**. Each stage worker receives a fresh context via a dedicated Agent call. Pass the compact handoff envelope as the agent prompt. Do not use the Skill tool or Task tool for stage delegation.

`interactive` / `auto` controls pauses between stages only. It does not grant permission to bypass `stage_approval`, skip mandatory checkpoints, or omit approval gates for code-touching stages. These are always required regardless of execution mode.

### Parallelization

Parallelize only independent read-only tasks (e.g., `sddl-deep-explorer` alongside a non-writing stage) or workers with fully disjoint write scopes. Never parallelize workers that write to overlapping artifact paths.

### Review protocols

`sddl-code-review` lenses and `sddl-judgment-day` judges run as parallel read-only Agent workers per the Review Worker Envelope in `SDDL-ORCHESTRATOR.md`. Launch judgment-day judges in one parallel batch, wait for both results before merging, and never let one judge see the other's output. Review workers return `findings` only; the orchestrator writes `review-ledger.md`.

### Worker boundaries

Child workers launched via Agent tool must not launch additional sub-agents. If a worker discovers work beyond its assigned scope, it must return `partial` or `blocked` with a `next_action` — not a new Agent call.

### Fallback if Agent tool is unavailable

If Agent tool delegation is denied or unavailable (e.g., blocked by user permissions):

- State visibly that stages will run without fresh-context isolation.
- Persist `state.yaml` immediately after each stage completes before continuing.
- Apply all canonical result-processing, routing, and approval rules.
- When a mandatory delegation trigger fires, explain the degradation before continuing inline.
<!-- sdd-lite:end -->

<!-- bp-harness:start generated_at="2026-08-04T15:26:26Z" version="0.1.0" engine_root=".bp-harness" -->
# blueprint-harness

Read-only discovery harness: formalize requirements (RFCs), triage bugs (diagnose, never fix), consult code and history, audit changes. Engine: `.bp-harness/`. Workspace: `bp-workspace/`.

## When to use blueprint-harness

- "Formalize this idea / write an RFC", "why does X fail" (diagnosis), "how does X work / what changed", "evaluate this refactor".
- **Cross-harness routing:** "I have a bug" → blueprint `bug-triage` when the user wants understanding or a documented diagnosis; sdd-lite `bug-fix` when they want it fixed. When in doubt, triage first — its output hands off cleanly.
- Never for implementing changes. When the user wants the change built, blueprint closes with a handoff seed and routes to sdd-lite.

## When blueprint-harness is active

- Load `.bp-harness/orchestrator/BP-ORCHESTRATOR.md` and follow it. Contracts live in `.bp-harness/skills/_shared/`.
- Session mode (`interactive`/`auto`) is asked once per session by the orchestrator.

## Read-only enforcement (recommended permission set)

Blueprint performs **no** mutation of source code, the working tree, git history, or remotes — no exceptions. Recommended platform enforcement (offered by `bp-init`, applied to `.claude/settings.json` only with your confirmation; otherwise apply manually):

- deny `Edit`/`Write` outside: `bp-workspace/**`, `sdd-lite/openspec/inbox/**`, and the `bp-init` setup paths (`.bp-harness/**`, `.claude/skills/**`, `.agents/skills/**`, `CLAUDE.md`, `AGENTS.md`, `.claude/settings.json`) — the setup paths exist so re-init/update keeps working
- allow read-only git only: `git log`, `git show`, `git diff`, `git status`, `git blame`
- deny `git commit`, `git add`, `git push`, `git checkout`, `git reset`, `git tag`, and any state-changing bash

## Platform: Claude Code

- Launch each delegated phase (`bp-context-mapper`, `bp-analyzer`, `bp-diff-parser`, `bp-strategist`, `bp-doc-exporter`, `bp-handoff`) with the **Agent tool**, one call per phase, waited — never fire-and-forget.
- Analysis workers are read-only: prefer a read-only agent type when available.
- Do not use the Skill tool for phase delegation — the Agent tool is the only delegation mechanism; interviews are orchestrator-executed, never delegated.

### Fallback if the Agent tool is unavailable

- Run phases inline, sequentially, declaring the isolation loss visibly.
- Persist `state.yaml` and the phase artifact after every phase.
- Compress context between phases: keep state, decisions, and the next envelope; drop artifact bodies.
<!-- bp-harness:end -->
