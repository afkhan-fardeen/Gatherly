# Vendor app gap closure (living reference)

This document tracks agreed behavior for the Gatherly **vendor** dashboard so auth, simulated payments, and route checks stay consistent.

## Constraints

### Payments (spotlight)

- **Spotlight purchases** use the API’s **dummy/simulated** payment path (`POST /api/vendor/spotlight/purchase`). There is no live PSP until a final pre-launch milestone (same stance as consumer: see [PLAN_CONSUMER_GAPS.md](./PLAN_CONSUMER_GAPS.md)).

### Auth

- Authenticated requests use **`vendorFetch`** from [`apps/vendor/lib/api.ts`](../apps/vendor/lib/api.ts): adds `Authorization: Bearer` from `localStorage`, and on **401** clears `token`/`user` and redirects to `/login`.
- **Plain `fetch`** is only for: **login**, **register** (`/api/auth/*`), and any intentionally public calls.

### Route protection

- JWT is in **localStorage**; Next **middleware** cannot read it without a cookie/session change.
- Dashboard layout validates **role** from stored user and probes **`GET /api/vendor/me`** via `vendorFetch`; invalid/expired sessions are cleared when the API returns non-OK (except 401, which triggers redirect inside `vendorFetch`).
- **`VendorProfileProvider`** in the dashboard layout holds the parsed **`/api/vendor/me`** payload so **`VendorLayout`** can render the header without a second **`GET /api/vendor/me`** when the probe succeeded (fallback fetch remains if context is empty).

### Mobile / desktop stance

- The vendor shell is **desktop-first**: below the `md` breakpoint the UI shows a full-screen message to use a larger screen (`VendorLayout`). This is intentional for MVP; responsive shell work is out of scope unless explicitly scheduled.

### Dashboard metrics (revenue)

- **“Paid event revenue (this month)”** on the dashboard is the sum of **paid** bookings whose **event date** falls in the **current calendar month** — i.e. revenue attributed to events happening this month, **not** necessarily cash received this month.

### Resolved UX notes (vendor polish)

- Dashboard empty state: **Import booking** is disabled with **“Coming soon”** (no dead primary action).
- Spotlight purchase errors use **toast** (not `alert`).
- Package deactivate failures surface **`parseApiError`** via toast; reviews list shows load failure state / toasts.
- Notification dropdown rows with a **`link`** navigate on row click and close the panel.

---

## Regression checklist (manual)

1. Login as vendor → dashboard loads (metrics + recent bookings).
2. **Expired/invalid token** on a protected page → redirect to `/login`, not silent empty tables.
3. **Bookings** list loads; **Accept/Decline** shows API errors via toast when rules fail.
4. **Booking detail** loads; status updates work; error message on failure.
5. **Search** (2+ chars): results or empty state; **not** a fake empty when the API returns an error (error line in dropdown).
6. **Packages** list, **new package**, **edit package** (including image upload and menu items).
7. **Spotlight**: load pricing/active; **purchase** completes (simulated) or shows clear error.
8. **Availability** save blocked dates.
9. **Notifications** list; mark read / mark all read.
10. **Profile** load and save; logo/featured uploads.

---

## Exit criteria

- No stray `Authorization: Bearer` in `apps/vendor` except `lib/api.ts` and auth flows that must use plain `fetch`.
- `npx tsc --noEmit` in `apps/vendor` passes.
