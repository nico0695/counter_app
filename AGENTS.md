# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js App Router project using TypeScript, Prisma, NextAuth, Zustand, `next-intl`, and SCSS Modules. Route handlers and pages live in `app/`, with locale-aware routes under `app/[locale]/` and admin screens under `app/[locale]/admin/`. Shared React components live in `components/`; countdown style implementations are grouped in `components/counters/` and exported through `components/counters/index.ts`.

Core utilities are in `lib/`, shared types in `interfaces/`, Zustand state in `store/`, constants in `consts/`, Prisma schema and migrations in `prisma/`, static assets in `public/`, and translations in `messages/en.json` and `messages/es.json`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build.
- `npm run start`: run the production server after building.
- `npm run lint` / `npm run lint:fix`: check or fix ESLint issues.
- `npm run format` / `npm run format:check`: write or verify Prettier formatting.
- `npm run type-check`: run TypeScript checking with `tsc --noEmit`.
- `npm run prisma:generate`: regenerate Prisma Client.
- `npm run prisma:migrate`: create and apply a local migration.

## Coding Style & Naming Conventions

Use strict TypeScript and prefer shared interfaces from `interfaces/`. Components use PascalCase filenames and exports, for example `CountdownTimer.tsx`; hooks use camelCase with a `use` prefix, for example `lib/useCountdown.ts`. Co-locate styles as `ComponentName.module.scss`.

Formatting is managed by Prettier. ESLint allows `_`-prefixed unused values, forbids `var`, and limits console usage to `console.warn` and `console.error`.

## Testing Guidelines

No automated test framework or `npm test` script is currently configured. Before opening a PR, run `npm run lint`, `npm run type-check`, and `npm run build`. For UI changes, manually verify affected locale routes and admin flows in `npm run dev`. If tests are added, use filenames such as `CounterForm.test.tsx`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit style, such as `feat(countdown): improve countdown styles` and `fix(countdown-form): improve styles`. Use short, imperative commit subjects with an optional scope: `feat(admin): add user limit control`.

Pull requests should include a concise description, verification steps, linked issues when applicable, and screenshots for visual changes. Mention Prisma migrations, new environment variables, and translation updates explicitly.

## Security & Configuration Tips

Do not commit `.env` files, SQLite databases, generated secrets, or local build output. Required runtime variables are `DATABASE_URL`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`; `PUBLIC_URL` is optional for production sharing and Open Graph URLs. After changing `prisma/schema.prisma`, run Prisma generation and include migrations.

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

## Platform: AGENTS.md

This wrapper serves any agent driven by `AGENTS.md` / `.agents/`. Some of these agents support native sub-agent delegation, others do not. When sdd-lite is active and native sub-agents are available, prefer **native-workers mode** so delegated stages run in fresh contexts as required by `SDDL-ORCHESTRATOR.md`. When they are not available, use **inline-sequential mode**.

### Ask once for worker mode

On the first sdd-lite stage request in a session, ask for worker mode together with the canonical `interactive` / `auto` execution-mode question. Cache both choices for the session. Do not ask again unless the user explicitly requests a change.

Worker modes:

- `native-workers` (recommended when supported): use native sub-agents for canonical stage delegation and mandatory delegation triggers.
- `inline-sequential`: execute within the parent conversation. Use when the user explicitly selects it or native sub-agents are unavailable.

`interactive` / `auto` controls pauses between stages. It does not grant or revoke permission to delegate, edit code, or bypass approval gates. Background processes and cloud tasks are not the default delegation mechanism for sdd-lite.

### Native-workers mode

- Launch a fresh worker for each stage delegated by the canonical contract, including exploration, approved execution, and QA review.
- Delegate per phase or approved execution stage, not per file.
- Parallelize only independent read-only tasks or disjoint write scopes.
- Pass the compact canonical handoff envelope and collect worker results before routing.
- Child workers must not launch descendants.

### Review protocols

- `native-workers`: launch `sddl-code-review` lenses and `sddl-judgment-day` judges as parallel native sub-agents; each is a waited handoff, never fire-and-forget. Wait for both judges before merging and never let one judge see the other's output.
- `inline-sequential`: run each lens/judge pass sequentially, persisting only each pass's `findings` result before starting the next. Judge blindness is weaker inline — note it in the ledger.
- In both modes, review workers return `findings` only; the orchestrator writes `review-ledger.md`.

### Inline-sequential fallback

When native sub-agents are unavailable or the user selects `inline-sequential`:

- State visibly that stages will run without fresh-context isolation.
- Before starting each stage, compress context: keep `state.yaml` content, key decisions, and the next stage handoff envelope. Drop full artifact bodies from active context.
- Persist `state.yaml` immediately after each stage completes before continuing.
- Prefer persisted digests, targeted reads, and compact handoffs. Do not claim that active conversation context can be manually dropped.
- Apply all canonical result-processing, routing, and approval rules. When a mandatory delegation trigger fires, explain the degradation before continuing inline.
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

Blueprint performs **no** mutation of source code, the working tree, git history, or remotes — no exceptions. Recommended platform enforcement (offered by `bp-init`, applied to your agent settings only with your confirmation; otherwise apply manually):

- deny file edits/writes outside: `bp-workspace/**`, `sdd-lite/openspec/inbox/**`, and the `bp-init` setup paths (`.bp-harness/**`, `.claude/skills/**`, `.agents/skills/**`, `CLAUDE.md`, `AGENTS.md`) — the setup paths exist so re-init/update keeps working
- allow read-only git only: `git log`, `git show`, `git diff`, `git status`, `git blame`
- deny `git commit`, `git add`, `git push`, `git checkout`, `git reset`, `git tag`, and any state-changing shell command

## Platform: AGENTS.md

Ask the **worker mode** once, together with the session mode:

- `native-workers` (recommended when the platform can spawn sub-agents): launch each delegated phase as a fresh worker, one per phase, waited — never fire-and-forget.
- `inline-sequential` (fallback): run phases inline in order, persisting `state.yaml` and the phase artifact after each; compress context between phases (keep state, decisions, and the next envelope; drop artifact bodies); declare the isolation loss visibly.

Interviews are orchestrator-executed in both modes, never delegated.
<!-- bp-harness:end -->
