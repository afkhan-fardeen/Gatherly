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
