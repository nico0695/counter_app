# Contributing

**Summary:** How to set up the project locally, the commands you'll run day to day, the Prisma migration workflow, and the coding/commit conventions this repo follows. Read [`architecture.md`](architecture.md) first if you need to understand *why* something is structured a certain way — this document is about the mechanics of making a change.

## Index

1. [Requirements and Environment Variables](#requirements-and-environment-variables)
2. [Install and Run](#install-and-run)
3. [Available Commands](#available-commands)
4. [Prisma Workflow](#prisma-workflow)
5. [Code Conventions](#code-conventions)
6. [Commit and PR Conventions](#commit-and-pr-conventions)
7. [Pre-PR Checklist](#pre-pr-checklist)

---

## Requirements and Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | Yes | SQLite connection string for Prisma (e.g. `file:./dev.db`) |
| `NEXTAUTH_URL` | Yes | Base URL NextAuth uses for callbacks |
| `NEXTAUTH_SECRET` | Yes | Secret used to sign JWT sessions |
| `PUBLIC_URL` | No | Absolute base URL used for OG image / social-share links when the app sits behind a reverse proxy. Falls back to `NEXTAUTH_URL`, then `http://localhost:3000`. |

## Install and Run

```bash
npm install
npm run prisma:generate
npx prisma migrate dev --name init   # first migration
npm run dev
```

## Available Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm run start` | Production build / run |
| `npm run lint` / `npm run lint:fix` | ESLint (`--max-warnings 0` — warnings fail the build) |
| `npm run format` / `npm run format:check` | Prettier |
| `npm run type-check` | `tsc --noEmit` |
| `npm run prisma:generate` | Regenerate the Prisma client after a schema change |
| `npm run prisma:migrate` | `prisma migrate dev` (prompts for a migration name) |

There is no configured test runner (`npm test`) in this repo.

## Prisma Workflow

After changing `prisma/schema.prisma`:

1. `npx prisma migrate dev --name <message>`
2. `npm run prisma:generate`

If TypeScript types don't reflect the schema change after that:

1. Stop the dev server.
2. Regenerate the Prisma client (`npm run prisma:generate`).
3. Restart your editor's TS server.
4. Restart `npm run dev`.

## Code Conventions

- Import via the `@/*` path alias (maps to the repo root) instead of relative paths across directories.
- Components use PascalCase filenames and exports (`CountdownTimer.tsx`); hooks use camelCase with a `use` prefix (`lib/useCountdown.ts`).
- Styles are co-located SCSS Modules: `ComponentName.module.scss` next to `ComponentName.tsx`. No global CSS beyond `styles/globals.scss`.
- Shared types live in `interfaces/` — prefer reusing them over inlining shapes.
- ESLint specifics (`eslint.config.mjs`): `_`-prefixed unused args/vars/caught errors are allowed, `var` is forbidden, `console` is limited to `console.warn`/`console.error`, and lint runs with `--max-warnings 0` so any warning breaks the build.
- Prettier: double quotes, semicolons, 100-char print width, trailing commas (ES5), 2-space indent.

## Commit and PR Conventions

Recent history follows Conventional Commits with a scope, e.g.:

```
feat(countdown): improve countdown styles
fix(countdown-form): improve styles
feat(admin): add user limit control
```

Use short, imperative subjects. PRs should include a concise description, verification steps, linked issues when applicable, and screenshots for visual changes. Call out explicitly:

- New Prisma migrations
- New/changed environment variables
- Translation updates (`messages/en.json`, `messages/es.json`)

## Pre-PR Checklist

- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] For UI changes: manually verified in `npm run dev` across affected locale routes and, if relevant, both the public countdown page and the admin flow
- [ ] Prisma migration included if `schema.prisma` changed, and `prisma:generate` was re-run
- [ ] No `.env`, SQLite database file, or generated secret committed
