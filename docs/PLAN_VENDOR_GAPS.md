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

### Error UX convention

- Use **`parseApiError`** from [`apps/vendor/lib/api.ts`](../apps/vendor/lib/api.ts) for JSON error bodies on **`!res.ok`** responses (validation and API messages).
- Use **`getNetworkErrorMessage(err, fallback)`** in **`catch`** blocks so offline / **Failed to fetch** gets a clear line instead of a generic failure.
- **Toast** for background failures, global actions, and mutations where inline state is not already shown; **inline** (`setError` / banner) for long forms when the user needs to correct fields. Profile save uses **both** inline error and toast for visibility.
- Global **`Toaster`** uses **`toastOptions.duration`** (~4s) for consistent timing.

### Guidance and empty states

- **Getting started** card on the dashboard ([`GettingStartedCard`](../apps/vendor/components/GettingStartedCard.tsx)): prompts **active package** + **profile** completion (description ≥ 20 chars or logo); dismiss persists via **`localStorage`** key `vendor_getting_started_dismissed`. Optional line links to **Unavailable dates**.
- **Bookings** empty list (no bookings at all): copy + **Create a package** CTA.
- **Notifications** empty and error states distinguish “no items yet” vs **load failure** (with refresh).

### Near real-time (notifications)

- Unread count: **`focus`** refetch; **`visibilitychange`** to visible refetches once and adjusts interval (**~15s** when tab visible, **~60s** when hidden) to balance freshness and background load. Not WebSocket/SSE.

### UI patterns (layout, loading, navigation)

- **Breadcrumbs**: [`Breadcrumb`](../apps/vendor/components/Breadcrumb.tsx) is rendered in [`VendorLayout`](../apps/vendor/components/VendorLayout.tsx) above page content. UUID segments under **`/bookings/`** label as **Booking**; under **`/packages/`** as **Package**. Route labels include **Spotlight**, **Unavailable dates**, etc.
- **Loading placeholders**: shared components in [`VendorSkeleton`](../apps/vendor/components/VendorSkeleton.tsx) replace ad-hoc `animate-pulse` blocks on dashboard, bookings, packages, notifications, profile, availability, reviews, spotlight, and package edit.
- **Spotlight in sidebar**: primary nav includes **Spotlight** (`/packages/spotlight`). **Packages** stays active for `/packages`, `/packages/new`, and `/packages/[id]/edit` only—not for Spotlight (see `isNavActive` in `VendorLayout`).
- **Paid revenue metric**: dashboard card shows visible subtext + `title` tooltip aligned with **Dashboard metrics (revenue)** above; [`MetricCard`](../apps/vendor/components/MetricCard.tsx) supports `labelSubtext` / `labelHint`.
- **Booking status labels**: list, dashboard recent bookings, and booking detail use [`booking-status-ui`](../apps/vendor/lib/booking-status-ui.ts) for consistent wording and badge colors (including **cancelled**).
- **Spotlight checkout copy**: page header + Pay section state **simulated** payment; primary button label reflects test checkout.
- **Accessibility**: **Skip to main content** targets `#vendor-main-scroll`; header notification button has **`aria-controls`** + panel **`role="region"`**; **Escape** closes the notification dropdown and returns focus to the bell. **Search** dropdown supports **ArrowUp/Down** highlight and **Enter** to open; input uses **`combobox`** + **`listbox`** roles.
- **Search**: [`SearchBar`](../apps/vendor/components/SearchBar.tsx) — see roles above.

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
9. **Notifications** list; mark read / mark all read; failed load shows error + refresh; failed mark shows toast.
10. **Profile** load and save; logo/featured uploads; save success toast.
11. **Getting started** card appears for new vendors; **Dismiss** hides until `localStorage` cleared.
12. **Offline** or network error on dashboard/bookings load → toast with connection copy, not silent empty state.
13. Return to tab after backgrounding → unread badge updates (focus / visibility).
14. **Breadcrumbs** on nested routes (e.g. `/packages/…/edit`, `/bookings/[id]`) show sensible segments; links navigate correctly.
15. **Spotlight** from sidebar opens `/packages/spotlight`; **Packages** nav is not highlighted on that route.
16. **Notification** dropdown: **Escape** closes it; bell remains keyboard-reachable.
17. **Search** (2+ chars): **Arrow** keys move highlight; **Enter** opens highlighted booking or package.

---

## Exit criteria

- No stray `Authorization: Bearer` in `apps/vendor` except `lib/api.ts` and auth flows that must use plain `fetch`.
- `npx tsc --noEmit` in `apps/vendor` passes.
