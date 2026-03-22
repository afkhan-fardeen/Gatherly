# Consumer gap closure (living reference)

This document tracks agreed scope for the Gatherly **consumer** app so we do not regress copy, payments behavior, or guest-related semantics.

## Product constraints

### Payments (dummy until pre-launch)

- Checkout remains **simulated / dummy** everywhere in Phases 0–4: no live payment gateway, no production PSP keys in these phases.
- **Phase 5 (final pre-launch milestone only):** integrate the chosen PSP, webhooks, schema updates (e.g. payment intent IDs, `paidAt` — see `docs/AUDIT.md`), full staging regression, then production keys. **Do not** start PSP work until prior phases are done.

### Guest headcount vs guest “management”

- **In scope:** `guestCount` on events, package min/max guests, booking guest counts — they drive capacity and pricing.
- **Out of scope (for now):** invite lists, RSVPs, per-guest CRM in the consumer UI. The `Guest` model and `/api/events/:eventId/guests` may exist on the backend but are not a consumer promise until built.

---

## Phases (summary)

| Phase | Focus |
| ----- | ----- |
| **0** | Product truth: remove misleading “guest list / invites” copy; keep headcount everywhere it matters. |
| **1** | Authenticated requests use `fetchAuth` from `apps/consumer/lib/api.ts` so **401 → clear session + redirect to `/login`**, not silent empty states. |
| **2** | Route protection: see checklist below; optional future cookie/session for middleware. |
| **3** | Dummy payment UX: safe numeric handling for amounts (`formatBdAmount` / guards before `toFixed`); manual QA script below. |
| **4** | Discover / catering: debounced search, honest sort/filter labels, data-driven “Premium” badges. |
| **5** | Pre-launch only: real PSP — see **Payments** above. |

---

## Protected routes checklist (new pages)

When adding a page that requires login:

1. **Client guard:** On load, call `getToken()` from `apps/consumer/lib/session.ts` (or equivalent) and `router.replace` / `window.location` to `/login?redirect=…` if missing.
2. **Authenticated API:** Use `fetchAuth` for any request that needs `Authorization: Bearer …` so expired tokens redirect to login.
3. **Public exceptions:** Login/register, public vendor/catalog list/detail, and unauthenticated flows stay on plain `fetch`.

### Optional later: middleware + cookies

Today the JWT is in **localStorage**, so Next.js **middleware** cannot read it without a **httpOnly cookie** session or a server-visible session. That is a larger change; defer unless we need server-side route protection.

---

## Manual QA — dummy payment flow

Use staging or local API with a test user.

1. **Book:** From vendor/package, create a booking (or add to cart from event flow).
2. **Vendor accept:** In vendor app (or API), move booking to accepted/confirmed as required by your flow.
3. **Pay (dummy):** From **Bookings** or **Event cart**, complete pay with dummy card / saved method; confirm success toast and `paid` state.
4. **Lifecycle:** Prep → deliver → review (if applicable).
5. **Expired token:** With an invalid/expired token, open a migrated page — expect **redirect to `/login`**, not empty lists.

---

## Regression checklist (after consumer changes)

- Logged-in: dashboard, events, create/edit event, profile, bookings, cart pay, notifications badge (top bar).
- Expired token: redirect to login on migrated pages.
- No UI promises for **guest list / RSVP** until the feature is built.
