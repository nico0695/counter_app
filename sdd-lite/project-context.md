# Project Context

## Metadata

- project_name: counter_app
- project_root: /opt/micloud/filebrowser/srv/dev_workspace/github/projects/counter_app/repo
- runtime_root: ./sdd-lite
- generated_at: 2026-08-22T21:23:23Z
- generated_by: sddl-init

## Stack Summary

| Area | Value | Evidence |
|---|---|---|
| languages | TypeScript (strict) | `tsconfig.json` (`strict: true`), all source under `.ts`/`.tsx` |
| frameworks | Next.js 14 (App Router), Prisma 5 (SQLite), NextAuth 4 (Credentials), next-intl, Zustand, SCSS Modules | `package.json` dependencies |
| runtime | Node.js | Next.js app; no separate server entrypoint |
| package_manager | pnpm | `pnpm-lock.yaml` present at root; no `package-lock.json` or `yarn.lock` |

## Important Directories

| Path | Role | Notes |
|---|---|---|
| `app/[locale]/` | Next.js App Router pages, locale-prefixed via `next-intl` middleware | public `[slug]` countdown page, `admin/` dashboard, `login/` |
| `app/[locale]/admin/actions.ts` | All CRUD as Next.js Server Actions (`"use server"`) | no separate REST/API layer for mutations |
| `components/` | React components, SCSS Modules co-located (`Component.tsx` + `Component.module.scss`) | |
| `components/counters/` | Countdown visual style variants (plugin-style registry) | each variant in its own subfolder, `index.ts` maps id -> component |
| `lib/` | Core utilities: `auth.ts` (NextAuth config), `prisma.ts` (client singleton), `useCountdown.ts` (tick hook), `navigation.ts` (locale-aware routing), `counterOptions.ts`, `textStyles.ts` | |
| `interfaces/` | Shared TypeScript types (`auth.interfaces.ts`, `counter.interfaces.ts`) | |
| `store/` | Zustand state (`timezone.ts` — viewer timezone override) | |
| `consts/` | App constants (`countdownTimer.constants.ts`) | |
| `styles/` | Global stylesheets (`globals.scss`) | imported by the App Router root layout |
| `prisma/` | Prisma schema (SQLite datasource) and migrations | `schema.prisma`: `User` has-many `Counter` |
| `messages/` | `next-intl` translation catalogs | `en.json`, `es.json` |
| `docs/` | Maintained product and dev documentation | see Key Docs |
| `public/` | Static assets, favicons, default backgrounds | |

## Key Docs

| Path | Role | Notes |
|---|---|---|
| `README.md` | Setup, environment variables, Docker/Compose, feature notes (counter styles, SEO/OG images, admin flow) | |
| `AGENTS.md` | Repo guidelines for AI coding agents: structure, commands, style, testing, commit/PR conventions | |
| `CLAUDE.md` | Guidance for Claude Code: architecture deep dive (i18n routing, auth, server-action CRUD layer, countdown style registry) | |
| `docs/dev/architecture.md` | Maintained architecture walkthrough: stack, folder layout, request/data flows, plugin registry, OG image pipeline | new since previous bootstrap |
| `docs/dev/contributing.md` | Contributor guidance | new since previous bootstrap |
| `docs/business/product-overview.md` | Product overview and business context | new since previous bootstrap |
| `docs/business/features-and-rules.md` | Feature catalog and business rules | new since previous bootstrap |

## Quality Commands

| Command Type | Candidate Commands | Evidence |
|---|---|---|
| install | `pnpm install` | `pnpm-lock.yaml` present |
| test | not established | no `test` script and no test runner in `package.json`; AGENTS.md "Testing Guidelines": no automated test framework configured. A testing RFC exists under `bp-workspace/` but nothing is implemented yet |
| build | `pnpm build` (`next build`) | `package.json` scripts |
| lint | `pnpm lint` (`eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0`) | `package.json` scripts; warnings fail the command |
| typecheck | `pnpm type-check` (`tsc --noEmit`) | `package.json` scripts |

## Conventions

Project conventions observed during bootstrap. Use `not established` when the evidence budget did not settle a row.

| Area | Convention | Evidence |
|---|---|---|
| naming and file placement | Components use PascalCase filenames/exports with a co-located `Component.module.scss`; hooks use camelCase with a `use` prefix | `components/CountdownTimer.tsx`, `lib/useCountdown.ts` |
| layering / architectural pattern | Mutations are Next.js Server Actions in `app/[locale]/admin/actions.ts`; no separate API route layer for CRUD; countdown visual styles are a 3-file plugin registry (`lib/counterOptions.ts`, `components/counters/index.ts`, `components/CountdownTimer.tsx`) | `app/[locale]/admin/actions.ts`, `components/counters/index.ts` |
| testing style | not established | AGENTS.md "Testing Guidelines": no automated test framework or `npm test` script configured; verification is `lint` + `type-check` + `build` + manual check of affected locale routes. If tests are added, use filenames such as `CounterForm.test.tsx` |
| error handling | Server actions `throw new Error(...)` with user-facing (Spanish) messages; `*Action` wrappers catch and return `ActionState { ok, error }` for `useFormState` | `app/[locale]/admin/actions.ts` |

sdd-lite conventions (fixed, not project-specific):

- Persisted bootstrap and change artifacts stay in English.
- Chat language may differ from artifact language.

## Risks And Unknowns

- No automated test suite exists; QA and CI-equivalent confidence rely on `lint`, `type-check`, `build`, and manual verification of affected locale routes/admin flows.
- A testing rollout (Vitest/RTL) is planned in an RFC under `bp-workspace/` but is not implemented; refresh this file when it lands.
- Datasource is SQLite (file-based); production persistence and migrations need care (see README Docker/Compose notes on volume-mounted `DATABASE_URL`).
