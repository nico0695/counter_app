# Features and Rules

**Summary:** The concrete business rules behind each feature area of Countdown Generator — how slugs are generated, how timezones are handled, what visual and text styling options exist, how media fallbacks work, and what admins can do. Read [`product-overview.md`](product-overview.md) first for the high-level concepts (counter, slug, roles) this document assumes.

## Index

1. [Slug Generation](#slug-generation)
2. [Date and Timezone Handling](#date-and-timezone-handling)
3. [Visual Counter Styles](#visual-counter-styles)
4. [Text Styling](#text-styling)
5. [Background Media](#background-media)
6. [Social Links](#social-links)
7. [SEO and Social Sharing](#seo-and-social-sharing)
8. [Admin Capabilities](#admin-capabilities)

---

## Slug Generation

The public URL segment (slug) is derived automatically from the counter's title when it's created — there is no manual slug field:

- Lowercased, accents/diacritics stripped, non-alphanumeric runs collapsed to a single hyphen, leading/trailing hyphens trimmed, capped at 60 characters.
- If the title produces an empty string, the base becomes `evento`.
- If the resulting slug is already taken, a numeric suffix is appended and incremented until it's unique (`evento`, `evento-1`, `evento-2`, ...).
- The slug is fixed at creation time — editing a counter's title later does not change its existing slug or URL.

## Date and Timezone Handling

- When creating or editing a counter, the user enters a local date/time plus an IANA timezone (e.g. `America/Argentina/Buenos_Aires`).
- The server converts that local date/time to an absolute UTC timestamp before storing it. The countdown is always computed against this UTC instant, so it reaches zero simultaneously for every visitor worldwide.
- On the public page, each visitor can independently override the *displayed* timezone via a selector in the page footer, without affecting the underlying target instant. This preference is remembered in the visitor's browser (not synced across devices) and defaults to the browser's own detected timezone.

## Visual Counter Styles

A counter's countdown is rendered in one of seven pre-built visual styles, selected by the creator:

| Style | Label |
|---|---|
| `colon` (default) | Clásico (con etiquetas) |
| `blocks` | Bloques |
| `flipclock` | Flip Clock |
| `ring` | Anillos |
| `bar` | Barras |
| `glass` | Glassmorphism |
| `segmentlcd` | Siete segmentos |

If a counter has no style set, or its stored style id doesn't match any known style, the public page falls back to the default (`colon`) rather than failing to render.

## Text Styling

Title and description each have independent styling, chosen at creation/edit time:

- **Font**: one of 19 predefined Google Fonts (e.g. Roboto, Montserrat, Playfair Display, Bebas Neue, Pacifico) — defaults to Roboto.
- **Size**: one of six presets, `xs` through `xxl` — defaults to `md`.
- **Color**: a hex color — defaults to white (`#FFFFFF`).

## Background Media

A counter's background is either a static image or a looping video:

- **Image**: the image URL is used directly as the background.
- **Video**: the poster image is shown while the video loads/if playback fails; if no poster is set, a bundled default image (`public/bg/default_bg.jpeg`) is used instead. If the video itself is missing or fails to load client-side, the page falls back to the same default image.
- If no background is set at all, the default image is used.

## Social Links

A counter may optionally list links to Twitter, Instagram, TikTok, Facebook, and up to two generic external links, rendered on the public page for visitors to follow.

## SEO and Social Sharing

Every counter gets a dynamically generated Open Graph preview image (1200×630) so links look good when shared on social platforms and messaging apps:

- The image shows the counter's title, description, target date/time with timezone, and a background derived from the same fallback chain as the live page (image → `bgUrl`; video → `posterUrl` → default image).
- If the counter doesn't exist or is disabled, a "Countdown Not Found" preview image is shown instead — the sharing surface never exposes raw errors.
- Page metadata (`<title>`, description, Open Graph and Twitter card tags) is generated per-counter from its title/description, with absolute URLs built from `PUBLIC_URL` (or `NEXTAUTH_URL`) so sharing works correctly even behind a reverse proxy.
- Each counter also has a dedicated QR-code page linking to its public URL, meant for offline/print distribution of the link.

## Admin Capabilities

Admins (`role === "ADMIN"`) have no counter limit and can manage the whole system from two sections:

**User management (`/admin/users`)**
- Block or unblock a user (blocked users can't log in).
- Change a user's role (`USER` ↔ `ADMIN`).
- Adjust a user's `maxCounters` limit.
- Create a new user directly (email/password/role).
- Delete a user (cascades to delete all of their counters).

**Link/counter management (`/admin/links`)**
- Enable or disable any counter (independent of who owns it).
- Disable *all* counters belonging to a given user in one action.
- Delete any counter.
- Create a counter on behalf of any user.

Regular `USER` accounts only see and manage their own counters and cannot access either admin section.
