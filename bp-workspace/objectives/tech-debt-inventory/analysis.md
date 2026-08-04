## Analysis Digest
- status: working
- objective: tech-debt-inventory
- updated: 2026-08-04
- summary: 14 findings across data layer, auth, server actions, type safety, and testing

## Scope Examined

8 files read in depth: `prisma/schema.prisma`, `lib/auth.ts`, `lib/prisma.ts`, `lib/counterOptions.ts`, `lib/useCountdown.ts`, `lib/counterHelpers.ts`, `app/[locale]/layout.tsx`, `app/[locale]/[slug]/page.tsx`, `app/[locale]/admin/actions.ts`, `components/counters/index.ts`, `interfaces/auth.interfaces.ts`, `interfaces/counter.interfaces.ts`, `store/timezone.ts`, `i18n.ts`, `next.config.mjs`, `package.json`.

## Facts

| # | Claim | Severity | Proof |
|---|---|---|---|
| F1 | SQLite as production database — limits concurrency, no connection pooling, file-locking risks | high | `prisma/schema.prisma:7` |
| F2 | Auto-registration on login without email verification or rate limiting | high | `lib/auth.ts:36-40` |
| F3 | Hardcoded third-party analytics script with exposed website-id in layout | medium | `app/[locale]/layout.tsx:66-69` |
| F4 | Counter model has 12+ styling fields mixed with core entity data | medium | `prisma/schema.prisma:24-46` |
| F5 | Form field parsing duplicated 3× across createCounter, updateCounter, adminCreateCounterForUser | medium | `app/[locale]/admin/actions.ts:42-63, 134-156, 320-338` |
| F6 | N+1 slug collision loop — sequential DB queries per collision | medium | `app/[locale]/admin/actions.ts:73-75` |
| F7 | Role stored as String in DB and JWT, not enforced as UserRole enum | low | `prisma/schema.prisma:15`, `lib/auth.ts:50` |
| F8 | `as any` cast bypasses TypeScript type checking for locale validation | low | `app/[locale]/layout.tsx:56` |
| F9 | Server actions use experimental config flag in Next.js 14.2.5 | info | `next.config.mjs:7-10` |
| F10 | No Zod/schema validation on server action inputs — raw String() casting only | medium | `app/[locale]/admin/actions.ts:42-63` |
| F11 | getCounter() returns any counter by slug without ownership check | medium | `app/[locale]/admin/actions.ts:111-113` |
| F12 | All 7 counter variants use `ssr: false` — no server-side rendering for any variant | info | `components/counters/index.ts:7-30` |
| F13 | No automated test framework or test files configured | medium | `package.json` (no test script), AGENTS.md confirms no tests |
| F14 | pnpm-lock.yaml present but package.json scripts use `npm run` | low | `package.json:6-15`, `pnpm-lock.yaml` exists |

## Inferences

| # | Claim | Evidence Class |
|---|---|---|
| I1 | Counter model will become unmaintainable as more styling options are added — suggests need for a JSON config column or separate CounterStyle model | inferential |
| I2 | Auto-registration enables account enumeration and spam — no CAPTCHA, rate limit, or email confirmation | inferential |
| I3 | Duplicated form parsing means any new field requires changes in 3 places, increasing regression risk | inferential |
| I4 | Missing test coverage means refactoring any server action or counter variant carries unquantified risk | inferential |

## Unknowns

| # | What's unknown | Resolution needed |
|---|---|---|
| U1 | Whether SQLite is intentional for small-scale deployment or a placeholder | Deploy config / README review |
| U2 | Whether the analytics script URL is a paid service with usage limits | External service documentation |
| U3 | Whether `getCounter()` is used only internally (safe) or exposed to users (security risk) | Call-site analysis across all admin pages |

## Root Cause Hypothesis

The primary maintainability debt stems from **monolithic data modeling** (F4, I1) and **duplicated server action logic** (F5, I3), both consequences of rapid feature iteration without abstraction layers. The primary architectural risk is **SQLite in production** (F1), which constrains horizontal scaling and concurrent write throughput. Security gaps (F2, F10, F11) reflect a trust-in-internal-calls pattern without defense-in-depth.
