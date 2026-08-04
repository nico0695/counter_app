## Surface Map Digest
- status: working
- objective: tech-debt-inventory
- updated: 2026-08-04
- summary: Surface map: 19 app routes, 7 counter variants, Prisma+SQLite, NextAuth v4, next-intl v4

## Surface Map

### Entry Points
- `app/layout.tsx` — root layout
- `app/[locale]/layout.tsx` — locale-aware layout
- `middleware.ts` — next-intl routing middleware
- `next.config.mjs` — experimental serverActions config

### Route Surface (app/[locale]/)
- Public: `/[locale]/` (home), `/[locale]/[slug]/` (counter page), `/[locale]/[slug]/qr/`, `/[locale]/login/`
- Admin: `/[locale]/admin/dashboard/`, `/[locale]/admin/users/`, `/[locale]/admin/links/`, `/[locale]/admin/counter/new/`, `/[locale]/admin/counter/edit/[id]/`
- API: `/api/auth/[...nextauth]/`, `/robots.ts`, `/sitemap.ts`

### Module Boundaries
- **Auth**: `lib/auth.ts` — NextAuth v4, credentials provider, auto-registration, JWT
- **Data**: `lib/prisma.ts` — Prisma singleton, `prisma/schema.prisma` — User + Counter models, SQLite
- **i18n**: `middleware.ts`, `i18n.ts`, `messages/en.json`, `messages/es.json` — next-intl v4.5.8
- **Counters**: `lib/counterOptions.ts` (registry), `components/counters/index.ts` (dynamic imports), 7 variant components
- **State**: `store/timezone.ts` — Zustand
- **UI**: `components/ui/`, `components/admin/`, `components/countdown/`, `components/social/`
- **Interfaces**: `interfaces/auth.interfaces.ts`, `interfaces/counter.interfaces.ts`
- **Constants**: `consts/countdownTimer.constants.ts`
- **Styles**: `styles/globals.scss`, SCSS modules co-located with components

### Structural Dependencies
- Counter variants → `lib/counterOptions.ts` → `components/counters/index.ts` → dynamic import per variant
- Admin pages → `lib/auth.ts` → `lib/prisma.ts` → `prisma/schema.prisma`
- Public pages → i18n middleware → locale layout → counter display

### Prior Artifacts
- None found (no audits/, bugs/, or ideas/ directories populated)

### Key Observations (structural only)
- No TODO/FIXME comments found
- No `any` types or `@ts-ignore` directives
- No direct `process.env` in app/components (centralized)
- No direct Prisma imports in app/components (centralized in lib/)
- No empty catch blocks
- No console.log usage (lint-enforced)
