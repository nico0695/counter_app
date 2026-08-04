<!-- Budget: 200-400 words. Owned by: bp-doc-exporter. Final artifact: bp-workspace/audits/audit-tech-debt-inventory.md -->
## Audit Digest
- status: approved
- objective: tech-debt-inventory
- updated: 2026-08-04
- summary: Full project technical debt inventory — 14 findings across security, architecture, data, and testing; 3 high, 6 medium, 5 low priority

## Question
What is the current technical debt across the entire counter_app project, prioritized by impact on maintainability, security, and scalability?

## Scope Examined
- **Auth**: `lib/auth.ts`, `app/api/auth/[...nextauth]/`, `interfaces/auth.interfaces.ts`
- **Data**: `prisma/schema.prisma`, `lib/prisma.ts`
- **Server actions**: `app/[locale]/admin/actions.ts` (375 lines)
- **Components**: `components/CountdownTimer.tsx`, `components/QRCodeDisplay.tsx`, `components/counters/`
- **Hooks/utils**: `lib/useCountdown.ts`, `lib/counterOptions.ts`, `lib/textStyles.ts`, `lib/navigation.ts`
- **State**: `store/timezone.ts`
- **Config**: `package.json`, `tsconfig.json`, `next.config.mjs`, `eslint.config.mjs`

## Findings

### HIGH Priority

**H1. Auto-registration on login bypasses intent** (`lib/auth.ts:23-41`)
- **fact**: The `authorize` callback creates a new user on any failed lookup. Anyone who types any email/password gets an account.
- **risk**: Uncontrolled user proliferation, no email verification, no password policy enforcement beyond bcrypt hashing.
- **recommendation**: Separate registration from login; add email verification and password strength requirements.

**H2. All server actions in a single 375-line file** (`app/[locale]/admin/actions.ts`)
- **fact**: Counter CRUD, user management, admin operations, and helper functions all coexist in one file with no module boundaries.
- **risk**: Merge conflicts, difficult testing, unclear ownership, accidental privilege escalation bugs.
- **recommendation**: Split into `actions/counters.ts`, `actions/users.ts`, `actions/admin.ts` with shared validation utilities.

**H3. No input validation on server actions** (`app/[locale]/admin/actions.ts:42-63`)
- **fact**: Raw `String(formData.get(...))` with manual `trim()` and `if (!x)` checks. Zod is a dependency but unused here.
- **risk**: Silent type coercion, missing field validation, inconsistent error messages.
- **recommendation**: Define Zod schemas per action and use `safeParse` for structured validation errors.

### MEDIUM Priority

**M1. SQLite as production database** (`prisma/schema.prisma:7`)
- **fact**: `provider = "sqlite"`. No connection pooling, no concurrent write support.
- **risk**: Write locks under concurrent access, no horizontal scaling, backup complexity.
- **recommendation**: Evaluate PostgreSQL for production; keep SQLite for local dev only.

**M2. Duplicated counter creation logic** (`actions.ts:23-109` vs `actions.ts:317-374`)
- **fact**: `createCounter` and `adminCreateCounterForUser` share slug generation, timezone conversion, and `prisma.counter.create` with near-identical data shapes.
- **risk**: Divergence when one path is updated but not the other; bug multiplication.
- **recommendation**: Extract a shared `buildCounterData(formData, userId)` function.

**M3. Hardcoded Spanish error messages** (`lib/auth.ts`, `actions.ts`)
- **fact**: Error strings like `"Datos inválidos"`, `"No autorizado"`, `"Admin only"` are embedded in code, not in `messages/en.json` / `messages/es.json`.
- **risk**: Inconsistent i18n, harder to maintain translations.
- **recommendation**: Move all user-facing strings to the i18n message files.

**M4. No rate limiting on auth or actions**
- **fact**: No rate limiting middleware on `/api/auth/[...nextauth]` or server actions.
- **risk**: Brute-force login attacks, action spam.
- **recommendation**: Add rate limiting via `@upstash/ratelimit` or similar, at minimum on the auth endpoint.

**M5. No test framework configured**
- **fact**: `package.json` has no test script, no test dependencies, no `__tests__/` directories.
- **risk**: Regression risk on every change, especially in auth and data mutation paths.
- **recommendation**: Add Jest or Vitest with React Testing Library; start with server action validation tests.

**M6. Slug collision via sequential retry** (`actions.ts:70-75`, `actions.ts:341-346`)
- **fact**: `while (await prisma.counter.findUnique({ where: { slug } }))` loops with `-1`, `-2` suffixes. Under load, race conditions can cause duplicate slugs.
- **risk**: Unique constraint violations, failed counter creation.
- **recommendation**: Use UUID suffixes or handle the Prisma unique constraint error with a retry.

### LOW Priority

**L1. Dynamic Google Fonts via DOM manipulation** (`components/CountdownTimer.tsx:37-70`)
- **fact**: Fonts loaded by creating a `<link>` element in `useEffect`, bypassing Next.js font optimization.
- **risk**: FOIT/FOUT, no font preloading, suboptimal LCP.
- **recommendation**: Use `next/font/google` for automatic optimization.

**L2. `counter` field stored as nullable string instead of enum** (`prisma/schema.prisma:35`)
- **fact**: `counter String?` instead of a Prisma enum type.
- **risk**: No type safety at the database level; invalid values can be stored.
- **recommendation**: Define `enum CounterType { ... }` in the schema.

**L3. `window` access in CountdownTimer** (`components/CountdownTimer.tsx:30`)
- **fact**: `typeof window !== "undefined"` check for `window.location.origin`.
- **risk**: Works but fragile; SSR hydration mismatch possible.
- **recommendation**: Use `usePathname` from `next/navigation` or pass URL as a prop.

**L4. `eslint-config-next` version mismatch** (`package.json:42`)
- **fact**: `next@^14.2.5` paired with `eslint-config-next@^16.0.10`.
- **risk**: Potential rule incompatibilities, unexpected lint behavior.
- **recommendation**: Align `eslint-config-next` with the Next.js major version.

**L5. No React error boundaries**
- **fact**: No `error.tsx` files in route segments, no class-component error boundaries.
- **risk**: Unhandled render errors crash the entire page tree.
- **recommendation**: Add `error.tsx` to `[locale]/` and `[slug]/` routes.

## Prioritization Summary

| Priority | Count | Focus Area |
|----------|-------|------------|
| HIGH | 3 | Security (H1), Architecture (H2), Validation (H3) |
| MEDIUM | 6 | Data (M1), Duplication (M2), i18n (M3), Security (M4), Testing (M5), Concurrency (M6) |
| LOW | 5 | Performance (L1), Type safety (L2), SSR (L3), Config (L4), Resilience (L5) |

## Recommendations

1. **Immediate**: Separate auth registration from login (H1) and add Zod validation to server actions (H3). These are security-critical and low-effort.
2. **Short-term**: Split `actions.ts` into domain modules (H2) and extract shared counter creation logic (M2). This reduces the largest maintainability risk.
3. **Medium-term**: Add a test framework (M5), rate limiting (M4), and evaluate PostgreSQL migration (M1). These require more planning but compound in value.
4. **Ongoing**: Address low-priority items as part of regular feature work; L1 (fonts) and L4 (eslint version) are quick wins.
