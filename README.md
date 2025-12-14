# Countdown Generator

Create and share countdowns with customizable styles.

Tech stack: Next.js (App Router) + TypeScript, Prisma (SQLite by default), NextAuth (Credentials), Zustand, date-fns/date-fns-tz, SCSS Modules.

**Highlights**

- Server-first Next.js app router with Server Actions.
- Per-counter background (image or video with poster).
- Timezone-aware display with override input on the public page.
- Pluggable countdown styles (variants) with a single source of truth for options.

**Project Structure**

- App routes: `app/` (e.g., `app/[slug]/page.tsx`, admin under `app/admin`).
- Components: `components/` (SCSS Modules co-located).
- Data: `lib/prisma.ts`, Prisma schema in `prisma/schema.prisma`.
- Auth: `lib/auth.ts`.
- State: `store/` (Zustand).
- Global styles: `styles/globals.scss`.

**Environment**

- Required: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- Copy `.env.example` to `.env` and fill values.

**Install & Run**

- Install deps: `npm install`
- Generate client: `npx prisma generate`
- First migration: `npx prisma migrate dev --name init`
- Dev server: `npm run dev`

**Docker & Compose**

- Build image: `docker build -t counter-app .`
- Run container with SQLite persisted:
  ```bash
  docker run --name counter_app \
  	-p 3000:3000 \
  	-v sqlite-data:/data \
  	-e DATABASE_URL=file:/data/dev.db \
  	-e NODE_ENV=production \
  	-e NEXTAUTH_SECRET=$(openssl rand -base64 32) \
  	-e NEXTAUTH_URL=http://localhost:3000 \
  	counter-app
  ```
- Using compose: `docker compose up -d --build`
- Apply migrations inside the container:
  ```bash
  docker exec -it counter_app sh -c "pnpm prisma migrate deploy && pnpm prisma generate"
  ```

Notes:

- NextAuth requires `NEXTAUTH_SECRET` in production and recommends `NEXTAUTH_URL`.
- The Dockerfile uses Debian slim to ensure Prisma engine compatibility (libssl3 present).

**Database & Migrations**

- Apply schema changes: `npx prisma migrate dev --name <message>`
- Regenerate client: `npx prisma generate`

**Features: Counter Styles**

- Options: `lib/counterOptions.ts` exports `counterOptions` (`{ id, name }[]`) and `defaultCounterId`.
- Variants registry: `components/counters/index.ts` maps id → React component.
- Hook: `lib/useCountdown.ts` provides ticking logic and time breakdown.
- Public page rendering: `components/CountdownTimer.tsx` uses the selected `counterId` (falls back to `defaultCounterId`).
- Admin forms include a `<select>` to choose the style when creating/editing.

**Admin Flow**

- Login at `/login` (email/password). If the email does not exist it is created automatically.
- Manage counters at `/admin/dashboard` (title, description, background, target date/time, timezone, and style).
- Each counter is public at `/{slug}`.

**Security Notes**

- Do not commit `.env` or SQLite databases.
- Basic role separation in admin; ensure `NEXTAUTH_SECRET` is set.

**Troubleshooting**

- Types not reflecting schema changes: stop dev server, run `npx prisma generate`, restart TS server in your editor, and re-run `npm run dev`.

**Roadmap: Internationalization (en/es)**

- Add i18n for admin and public pages (see plan below).

Internationalization quick start:

- Install: `npm install next-intl`
- Locale switching API: `POST /api/locale` with `{ locale: 'en' | 'es' }`.
- Language switcher: see `components/ui/LanguageSwitcher.tsx`.
- Messages: `messages/en.json`, `messages/es.json`.
- Provider: configured in `app/layout.tsx` using `NextIntlClientProvider`.
