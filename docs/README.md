# Documentation Index

This folder documents the Countdown Generator app from two angles: how it's built (`dev/`) and what it does for users (`business/`).

## dev/ — for anyone writing code in this repo

- [`dev/architecture.md`](dev/architecture.md) — System design: stack, folder layout, routing, rendering flow, auth, data layer, the counter-style plugin system, and OG image generation. Read this to understand how a request turns into a rendered page.
- [`dev/contributing.md`](dev/contributing.md) — Day-to-day workflow: setup, commands, Prisma migrations, code conventions, commit/PR style, and a pre-PR checklist. Read this before making a change.

## business/ — for anyone who needs to understand product behavior

- [`business/product-overview.md`](business/product-overview.md) — What the product is, its core concepts (counter, slug, target date, timezone), user roles, and the end-to-end flow from creating a counter to a visitor viewing it.
- [`business/features-and-rules.md`](business/features-and-rules.md) — The concrete business rules behind each feature: slug generation, timezone handling, visual styles, text styling, media fallbacks, social links, SEO/sharing, and admin capabilities.

All documents describe only what exists in this repository today.
