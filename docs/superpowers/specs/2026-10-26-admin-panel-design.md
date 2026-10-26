# Admin Panel Design — Hôtel Résidence Aïcha

**Date:** 2026-10-26
**Status:** Approved, ready for implementation planning

> **Implementation note (added during Task 1 of the build):** Vercel KV was deprecated and is no longer installable for new projects. The implementation uses **Upstash Redis** instead — the same underlying service Vercel KV was already built on, reachable via the Vercel Marketplace integration, with an equivalent `get`/`set` API. Every "KV" reference below describes the same architecture; only the package/env-var names changed (see the implementation plan for specifics).

## Problem

The client wants full control over the site's content — editing contact numbers, room info, gallery photos, and page text — without needing a developer for every change. Today everything (phone/WhatsApp numbers in `lib/whatsapp.ts`, room lists in `app/chambres/page.tsx` and the homepage, gallery photos in `app/galerie/page.tsx`) is hardcoded.

## Approach

Build a password-protected `/admin` section backed by **Vercel KV** (text/JSON content) and **Vercel Blob** (images). No third-party CMS (Sanity, Contentful, Decap) — the site is small enough that a custom admin is less overhead than learning/integrating an external tool, and everything stays inside the existing Vercel deployment with free-tier services.

Alternatives considered and rejected:
- **Headless CMS (Sanity, etc.)** — richer editing UX out of the box, but adds a third-party service, an account for the client to manage, and a learning curve, for a site with ~6 content sections.
- **Git-based content (edit JSON/MDX files, redeploy)** — no new infra, but every edit requires a deploy and some Git literacy from the client, which defeats the goal of "full control without a developer."

## 1. Architecture & Data Model

**Stack addition:** `@vercel/kv` and `@vercel/blob` on top of the existing Next.js App Router app.

**Key principle:** every public page reads its content from KV instead of a hardcoded array. If a KV key is missing, unreadable, or fails validation (see §4), the page falls back to default values identical to today's hardcoded content — the public site never breaks, even before the first admin save and even during a KV/Blob outage.

**KV keys (one JSON value per key):**
- `content:global` — phone, WhatsApp, email, address, Google Maps links, SEO title/description
- `content:rooms` — single shared list of rooms (name, capacity, bed type, photo, alt text, amenities, description). The homepage shows the first 3 entries; `/chambres` shows all. One list, one place to edit, per the decision to unify what were previously two separate hardcoded room lists.
- `content:home` — hero (title/text), intro, trust badges (text only, icons stay fixed in code), testimonials, "why choose us" reasons
- `content:chambresPage` — header text, "et aussi" section (photos + captions), bathroom section text
- `content:gallery` — header text + list of photos (`{ id, image, imageAlt, caption }`)
- `content:contact` — services, booking steps, header text

**Icons stay fixed in code** per section — the client edits text, not which icon is shown. Building an icon picker was judged not worth the complexity for the value it adds.

## 2. Authentication & Admin Structure

**Auth:** single shared password via `ADMIN_PASSWORD` env var (no per-user accounts — one trusted client, no audit-trail requirement).
- `app/admin/login/page.tsx`: password form. A server action checks the password and sets an `httpOnly`, `secure` cookie containing an HMAC-signed value (signed with `ADMIN_SECRET`, not the raw password), expiring after 7 days.
- `middleware.ts` protects all of `/admin/*` except `/admin/login`: verifies the cookie signature, redirects to `/admin/login` if missing/invalid.
- A "Log out" action clears the cookie.

**Page structure**, one route per KV key, under a shared `app/admin/layout.tsx` (side nav listing each section):
- `/admin` → redirects to `/admin/general`
- `/admin/general` → `content:global`
- `/admin/accueil` → `content:home`
- `/admin/chambres` → `content:rooms` (also houses `content:chambresPage`, since both concern the Chambres page)
- `/admin/galerie` → `content:gallery`
- `/admin/contact` → `content:contact`

Each page: a form pre-filled from the current KV value (read server-side), a "Save" button invoking a server action that writes to KV and calls `revalidatePath` on the affected public page(s) for an instant update with no redeploy.

**Image upload:** file inputs upload directly to Vercel Blob via a server action; the returned URL is written into the relevant KV JSON, replacing the old URL. The previous blob is not deleted automatically (kept simple for v1).

## 3. Rooms & Gallery Management (list CRUD)

**`content:rooms` shape:**
```json
[
  { "id": "deluxe-1", "name": "Chambre Deluxe", "capacity": 2, "bed": "Lit double",
    "amenities": ["Climatisation", "Salle de bain privée", "Rangement et miroir"], "description": "...",
    "image": "https://blob.vercel-storage.com/...", "imageAlt": "..." }
]
```
Each room has a stable `id` (slug + short random suffix) generated on creation, so edits/deletes target the right entry independently of array order.

**`/admin/chambres` UI:**
- Rooms rendered as collapsed cards (thumbnail + name) with ▲▼ buttons to reorder; array order = display order, and the homepage simply takes the first 3.
- Clicking a card expands it for editing: name, capacity, bed type, amenities (free-text list — add/remove lines; each is rendered publicly with the same fixed checkmark icon, matching today's behavior), description, photo.
- "Add room" button inserts a new blank card in edit mode.
- Delete uses a two-click "Confirm?" state instead of a JS `confirm()` dialog, to avoid accidental deletes and blocking native dialogs.
- One global "Save changes" button submits the whole array to the server action in one write (simpler than per-card partial saves).

**`content:gallery`** follows the same pattern with a simpler shape — `{ id, image, imageAlt, caption }` — reorder, add, delete, no amenities/capacity.

**Image upload inside cards:** choosing a file uploads to Blob immediately and updates the preview, rather than waiting for the global Save — so an upload isn't lost if the user forgets to click Save, and there's instant visual feedback.

## 4. Error Handling, Resilience, Testing

**Read-side resilience (public pages):** every KV read is validated against a Zod schema for that key. If the key is missing, the read fails, or the JSON doesn't match the schema (e.g. after a shape change), the page silently falls back to the hardcoded defaults and logs the error via `console.error`. The public site never breaks from a KV outage or malformed data.

**Write-side validation (admin):** before saving, the server action validates submitted data against the same Zod schema (required fields, correct types — e.g. capacity is a positive number). On failure, an inline form error is shown and the form retains the user's input; nothing is written to KV.

**Image upload validation:** client- and server-side checks on MIME type (jpeg/png/webp only) and max size (5 MB). Errors show under the relevant field without blocking the rest of the form.

**Auth errors:** wrong password → generic "Incorrect password" message, no hints. No account lockout or rate-limiting for v1 (single trusted user, low risk); revisit if it becomes an issue.

**Testing:** the project has no test runner today. Given the site's size, add **Vitest** for targeted unit tests of the Zod schemas and pure helpers (room id generation, fallback logic) rather than a full suite. No automated end-to-end tests for v1 — the admin flow (login, edit each section, add/delete a room, upload an image, confirm instant update on the public page) is verified manually.

## Out of Scope (v1)

- Per-user accounts / audit trail
- Automatic cleanup of replaced Blob images
- Icon selection in the admin UI
- Automated end-to-end tests
- Rate-limiting / lockout on login
