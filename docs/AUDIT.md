# Gatherly — Feature Audit & Roadmap

Full audit of both portals and API. Covers what's working, what's incomplete, and what must be fixed before payment integration.

**Last updated:** February 2026

---

## Table of contents

1. [Feature status matrix](#1-feature-status-matrix)
2. [Critical issues](#2-critical-issues)
3. [High priority issues](#3-high-priority-issues)
4. [Medium priority issues](#4-medium-priority-issues)
5. [Dead code](#5-dead-code)
6. [Pre-payment checklist](#6-pre-payment-integration-checklist)

---

## 1. Feature status matrix

### Consumer app

| # | Feature | Status | Key file(s) | Notes |
|---|---------|--------|-------------|-------|
| 1 | Login | Working | `(auth)/login/page.tsx` | Redirect, validation, error handling present |
| 2 | Register | Working (minor) | `(auth)/register/page.tsx` | Uses `router.push` instead of full reload — can show stale UI (C4) |
| 3 | Forgot password | **Placeholder** | `(auth)/forgot-password/page.tsx` | Static "coming soon" text, no form (C1) |
| 4 | Apple/Phone sign-in | **Disabled** | `get-started/page.tsx` | Buttons greyed out, no explanation |
| 5 | Dashboard | Working | `dashboard/page.tsx` | Silently swallows fetch errors (H8) |
| 6 | Event create | Working (gaps) | `events/create/CreateEventContent.tsx` | No past date validation (C3), no time validation (H7), no dietary UI (H9) |
| 7 | Event edit | Working (gaps) | `events/[eventId]/edit/page.tsx` | Type mismatch with create page (C2), same date/time issues |
| 8 | Event delete | Working | `events/[eventId]/page.tsx` | Confirmation modal, error handling present |
| 9 | Event detail | Working | `events/[eventId]/page.tsx` | Accordion layout, CTA logic complete |
| 10 | Mark complete | Working (no feedback) | `events/[eventId]/page.tsx` | No toast, no error handling (H1) |
| 11 | Event services | Working | `events/[eventId]/services/page.tsx` | Coming-soon handled differently than main services page |
| 12 | Event cart | Working | `events/[eventId]/cart/page.tsx` | Pay all, pay individual, payment method selection all work |
| 13 | Auto-save draft | Working | `CreateEventContent.tsx` | 500ms debounce, localStorage, visual indicator |
| 14 | Catering browse | Working (gaps) | `CateringContent.tsx` | No search debounce (H4), hardcoded filters, non-functional sort |
| 15 | Vendor profile | Working | `vendor/[id]/page.tsx` | Hardcoded badges/response time, non-functional heart/share |
| 16 | Package detail | Working | `vendor/[id]/package/[pkgId]/page.tsx` | Guest count, price calc, event picker all work |
| 17 | Book package | Working | `vendor/[id]/book/page.tsx` | End-to-end flow functional |
| 18 | Bookings list | Working | `bookings/page.tsx` | Event grouping, tabs, accordion all work |
| 19 | Booking detail | Working | `bookings/[id]/page.tsx` | Order progress, conditional pay, review form |
| 20 | Review submission | Working | `bookings/page.tsx`, `bookings/[id]/page.tsx` | Star rating + text submission |
| 21 | Profile | Working | `profile/page.tsx` | Real stats from API, all links work except Help (#) |
| 22 | Edit profile | Working (gaps) | `profile/edit/page.tsx` | No image compression (H5), no phone validation |
| 23 | Payment methods | **Dummy** | `profile/payment-methods/page.tsx` | Test card instructions shown (H6) |
| 24 | Payment history | Working | `profile/payment-history/page.tsx` | Fetches real paid bookings |
| 25 | Notifications | Working (gaps) | `notifications/page.tsx` | No error handling (H2), no global badge (H3) |
| 26 | PWA install | Working | `components/InstallPrompt.tsx` | Chrome + iOS handled |
| 27 | PWA manifest | Working (gaps) | `app/manifest.json` | Only 2 icon sizes (should be more) |
| 28 | Favorites | **Not implemented** | Multiple files | Buttons exist but do nothing |
| 29 | Sharing | **Not implemented** | `vendor/[id]/page.tsx` | Button exists but does nothing |
| 30 | Sorting | **Not implemented** | `CateringContent.tsx` | Button exists but does nothing |

### Vendor app

| # | Feature | Status | Key file(s) | Notes |
|---|---------|--------|-------------|-------|
| 1 | Login | Working | `(auth)/login/page.tsx` | Role validation present |
| 2 | Register | Working (gap) | `(auth)/register/page.tsx` | Profile PATCH failure is silent (M14) |
| 3 | Dashboard | Working | `dashboard/page.tsx` | Real metrics from API. Swallows fetch errors (M15) |
| 4 | Packages list | Working | `packages/page.tsx` | Active/inactive toggle, deactivate with modal |
| 5 | Package create | Working (gaps) | `packages/new/page.tsx` | No back button on step 4 (M16), error gap in handleNext (M17) |
| 6 | Package edit | Working | `packages/[id]/edit/page.tsx` | Dual navigation is confusing (M18) |
| 7 | Spotlight | Working | `packages/spotlight/page.tsx` | Payment is simulated, uses alert() not toast (M23) |
| 8 | Bookings list | Working | `bookings/page.tsx` | All tabs work, accept/decline from list. No error toast (M19) |
| 9 | Booking detail | Working | `bookings/[id]/page.tsx` | Status flow works, prep blocked until paid (UI-side only) |
| 10 | Availability | Working | `availability/page.tsx` | Race condition on rapid clicks (M20) |
| 11 | Business profile | Working | `profile/page.tsx` | All fields editable, no success toast (M21), no image compression (M22) |
| 12 | Notifications | Working | `notifications/page.tsx` | Mark read works, optimistic update without rollback |
| 13 | Reviews | Working (gap) | `reviews/page.tsx` | Pagination fetched but never rendered — only first 20 visible (H10) |
| 14 | Search | Working | `components/SearchBar.tsx` | Debounced, results clickable |
| 15 | Mobile blocking | Working | `components/VendorLayout.tsx` | "Use desktop" overlay on mobile |

### API

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | Auth (register/login/me) | Working | Hardcoded JWT fallback (A3), admin registration not blocked (A6) |
| 2 | Events CRUD | Working | No try-catch, no past date validation, no status transition validation |
| 3 | Guest management | Working | Full CRUD with ownership checks |
| 4 | Bookings CRUD | Working | No duplicate prevention (A5), no try-catch |
| 5 | Booking payment | Working | All-vendors-accepted check works, pay-single vs pay-event inconsistency (M26) |
| 6 | Booking review | Working | Rating update is O(n), no review notification to vendor |
| 7 | Vendor dashboard | Working | Status transitions not validated server-side (A4) |
| 8 | Vendor packages | Working | Full CRUD with items |
| 9 | Vendor availability | Working | Blocked dates save/load |
| 10 | Public vendors | Working | List, detail, packages, reviews |
| 11 | Spotlight | Working | Lazy expiration cleanup, simulated payment |
| 12 | Upload | Working | Cloudinary integration, type + size validation |
| 13 | Payment methods | **Dummy** | Stores last4 + brand only, no real gateway |
| 14 | Notifications | Working | Missing: review posted, event deleted, spotlight expiring |
| 15 | Health check | Working | DB connectivity test |

---

## 2. Critical issues

Issues that are broken, insecure, or will cause data corruption.

### A1. No error handling on 45 of 49 async API handlers

**Location:** All files in `packages/api/src/routes/`
**Impact:** Any Prisma error (connection lost, invalid UUID, constraint violation) will either crash the process or hang the response indefinitely. Express 4 does not catch async errors automatically.
**Fix:** Add try-catch to every async handler, or add a global async error wrapper. Add `app.use((err, req, res, next) => ...)` to `server.ts`.

### A2. No rate limiting on any endpoint

**Location:** `packages/api/src/server.ts`
**Impact:** Login and register are completely unthrottled. Enables brute-force password attacks, account enumeration, and DDoS amplification.
**Fix:** Add `express-rate-limit`. At minimum: 5 attempts/15min on `/api/auth/login`, 3 attempts/hour on `/api/auth/register`.

### A3. JWT secret falls back to hardcoded value

**Location:** `packages/api/src/routes/auth.ts:17`, `packages/api/src/middleware/auth.ts:5`
**Code:** `JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"`
**Impact:** If the env var is missing in production, every token is signed with a publicly known secret. Any attacker can forge valid tokens.
**Fix:** Throw on startup if `JWT_SECRET` is not set.

### A4. Booking status transitions not validated server-side

**Location:** `packages/api/src/routes/vendor.ts:432-507`
**Impact:** A vendor (or direct API call) can skip steps: pending → completed, or go backwards: delivered → confirmed. Only the frontend enforces the flow, which can be bypassed.
**Fix:** Add a status transition map and validate `currentStatus → newStatus` is allowed.

### A5. No duplicate booking prevention

**Location:** `packages/api/src/routes/bookings.ts`
**Impact:** A consumer can book the same vendor+package+event multiple times. No unique constraint or code-level check.
**Fix:** Add `@@unique([userId, vendorId, eventId, packageId])` to Prisma schema, or check before insert.

### A6. Anyone can register as admin

**Location:** `packages/shared/src/schemas/auth.ts`
**Impact:** The registration schema allows `role: "admin"`. Any user can register as admin.
**Fix:** Remove `"admin"` from the allowed roles in `registerSchema`, or enforce role restrictions in the registration handler.

### A7. No security headers

**Location:** `packages/api/src/server.ts`
**Impact:** Missing `helmet` middleware means no `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc. No explicit body size limit on `express.json()`.
**Fix:** Add `helmet()` middleware. Add `express.json({ limit: '1mb' })`.

### A8. Missing database indexes

**Location:** `packages/api/prisma/schema.prisma`
**Impact:** No `@@index` directives exist. Queries on `bookings.userId`, `bookings.vendorId`, `bookings.eventId`, `events.userId`, `notifications.userId`, `reviews.vendorId`, etc. will do full table scans as data grows.

**Recommended indexes:**

```
@@index([userId])          on Booking, Event, Notification, Review
@@index([vendorId])        on Booking, Package, Review
@@index([eventId])         on Booking, Guest
@@index([status])          on Booking
@@index([userId, isRead])  on Notification
@@index([packageId])       on SpotlightPlacement
```

### A9. Vendor prep not blocked server-side

**Location:** `packages/api/src/routes/vendor.ts:432-507`
**Impact:** The consumer UI blocks "Preparing order" until `paymentStatus === "paid"`, but the API has no such check. A direct API call can move to `in_preparation` without payment.
**Fix:** In the status update handler, check `booking.paymentStatus === "paid"` before allowing `in_preparation`.

### C1. Forgot password is a dead end

**Location:** `apps/consumer/app/(auth)/forgot-password/page.tsx`
**Impact:** Static "coming soon" text. Users who forget their password are permanently locked out. The login page links to this dead end.
**Fix:** Implement password reset flow (send email with reset token) or at minimum remove the link from the login page.

### C2. Event type mismatch between Create and Edit pages

**Location:** `apps/consumer/app/events/create/CreateEventContent.tsx:29-35` vs `apps/consumer/app/events/[eventId]/edit/page.tsx:25-29`
**Impact:** Create offers: `social`, `corporate`, `family_gathering`, `wedding`, `birthday`. Edit offers: `wedding`, `corporate`, `family_gathering`, `other`. If you create a "social" or "birthday" event, no chip is selected in the edit page, and the type can silently change.
**Fix:** Use a single shared `EVENT_TYPE_OPTIONS` constant imported by both pages.

### C3. No past date validation on event create or edit

**Location:** `apps/consumer/app/events/create/CreateEventContent.tsx:410-417`, `apps/consumer/app/events/[eventId]/edit/page.tsx:289-296`
**Impact:** Users can create events with dates in the past, which immediately appear in the "past" tab.
**Fix:** Add `min={new Date().toISOString().split("T")[0]}` to the date input.

### C4. Register redirect inconsistency

**Location:** `apps/consumer/app/(auth)/register/page.tsx:55-56`
**Impact:** Login uses `window.location.href` (full reload). Register uses `router.push` + `router.refresh`. Components that checked `getToken()` on initial mount won't re-run, potentially showing logged-out UI.
**Fix:** Use `window.location.href` in register, same as login.

---

## 3. High priority issues

Poor UX, missing error handling, or incorrect data display.

### H1. Mark Complete — no feedback

**Location:** `apps/consumer/app/events/[eventId]/page.tsx:96-109`
**Details:** No `toast.success()` on success, no catch block, no error toast. Silent on both success and failure.

### H2. Notification mark-read — no try-catch

**Location:** `apps/consumer/app/notifications/page.tsx:68-82`
**Details:** Both `markAsRead` and `markAllRead` have no try-catch. Failed API calls cause unhandled promise rejections with no user feedback.

### H3. No global unread notification badge

**Location:** `apps/consumer/components/BottomNav.tsx`, `Sidebar.tsx`, `ConsumerTopBar.tsx`
**Details:** Unread count is computed on the notifications page but never shown on nav items. Users have no way to know they have unread notifications without visiting the page.

### H4. No search debounce on catering page

**Location:** `apps/consumer/app/services/catering/CateringContent.tsx:61-88`
**Details:** Every keystroke fires an API request. Typing "Italian" sends 7 requests. The `fetchVendors` callback depends on `search` with no debounce.

### H5. Profile photo upload missing compression

**Location:** `apps/consumer/app/profile/edit/page.tsx:57-83`
**Details:** Uploads raw file directly. The `compressImage` utility exists and is used in event create/edit, but not here. Large phone photos (5-10MB) uploaded as-is.

### H6. Payment system is explicitly dummy

**Location:** `apps/consumer/app/profile/payment-methods/page.tsx:131-132`
**Details:** Shows "Use dummy numbers like 4242 4242 4242 4242 for testing." Add card form only takes a number — no expiry, CVV, or cardholder name. Same dummy pattern in pay modals.

### H7. No time range validation

**Location:** `apps/consumer/app/events/create/CreateEventContent.tsx:419-445`, `edit/page.tsx:299-319`
**Details:** No validation that `timeEnd > timeStart`. Users can set start=20:00, end=08:00 with no warning.

### H8. Dashboard swallows all fetch errors

**Location:** `apps/consumer/app/dashboard/page.tsx:98-101`
**Details:** `.catch(() => { fallback to localStorage })`. If all API calls fail, the page shows empty data with no error indication.

### H9. Dietary requirements — no UI

**Location:** `apps/consumer/app/events/create/CreateEventContent.tsx`
**Details:** `dietaryRequirements` exists in form state (line 57) and is sent to the API (line 175), but there is no UI control to select or enter dietary requirements. Always sends empty array. The event detail page tries to display them.

### H10. Reviews pagination never rendered (vendor)

**Location:** `apps/vendor/app/(dashboard)/reviews/page.tsx:56-60`
**Details:** API returns `pagination` object (page, totalPages, total). Frontend destructures it but never renders pagination controls. Only the first 20 reviews are visible, with no way to see more.

---

## 4. Medium priority issues

Incomplete features, missing polish, or inconsistencies.

### Consumer app

| # | Issue | Location |
|---|-------|----------|
| M1 | Heart/Favorite buttons non-functional (5 locations) | `vendor/[id]/page.tsx`, `CateringContent.tsx`, `services/page.tsx` |
| M2 | Sort button renders but does nothing | `CateringContent.tsx:157-160` |
| M3 | Apple & Phone sign-in disabled with no explanation | `get-started/page.tsx:30-49` |
| M4 | Help & Support links to `#` | `profile/page.tsx:57` |
| M5 | Terms & Privacy links are dead (6 locations) | `get-started/page.tsx`, `page.tsx` footer |
| M6 | "Premium Partner" & "Verified" hardcoded on all vendors | `vendor/[id]/page.tsx`, `CateringContent.tsx` |
| M7 | "Replies in 2h" hardcoded for all vendors | `vendor/[id]/page.tsx:209` |
| M8 | "2,400+ events" marketing stat hardcoded | `page.tsx:236` |
| M9 | Filter chips hardcoded (may not match vendor data) | `CateringContent.tsx:35` |
| M10 | Coming-soon services handled inconsistently | Event services page vs main services page |
| M11 | No phone format validation on edit profile | `profile/edit/page.tsx:230-238` |
| M12 | PWA manifest only has 2 icon sizes | `app/manifest.json` |
| M13 | Empty `AuthContext.tsx` file (dead code) | `contexts/AuthContext.tsx` |
| M14 | Five-star display always shows 5 stars regardless of rating | `services/page.tsx:199` |
| M15 | Coming-soon page uses white/slate design, not cream/warm | `services/coming-soon/[slug]/page.tsx` |
| M16 | Cart payment methods not pre-fetched on page load | `events/[eventId]/cart/page.tsx:47` |

### Vendor app

| # | Issue | Location |
|---|-------|----------|
| M17 | Registration silently drops profile data if PATCH fails | `register/page.tsx:49-62` |
| M18 | Dashboard `.catch(() => {})` swallows all errors | `dashboard/page.tsx:60` |
| M19 | Package wizard — no "Back" button on step 4 (Review) | `packages/new/page.tsx:406-414` |
| M20 | Package wizard — `createPackage` error not caught in `handleNext` | `packages/new/page.tsx:50-125` |
| M21 | Package edit — dual navigation (StepIndicator + tab buttons stacked) | `packages/[id]/edit/page.tsx:368-392` |
| M22 | Bookings list — no error toast on failed accept/decline | `bookings/page.tsx:70-94` |
| M23 | Availability — rapid clicks cause race conditions (no debounce) | `availability/page.tsx:60-66` |
| M24 | Profile save — no success toast (only place that doesn't) | `profile/page.tsx:93-141` |
| M25 | Logo/featured image upload missing compression | `profile/page.tsx:381-408` |
| M26 | Spotlight uses `alert()` instead of toast | `packages/spotlight/page.tsx:84` |
| M27 | Hardcoded "Good morning!" greeting at all hours | `dashboard/page.tsx:82` |
| M28 | Duplicate CSS classes `text-slate-500 text-slate-400` | `packages/page.tsx:131, 204` |
| M29 | Package edit fetches ALL packages instead of single one | `packages/[id]/edit/page.tsx:284-304` |
| M30 | Frontend allows basePrice=0 but backend rejects it (`.positive()`) | `packages/new/page.tsx:137` |
| M31 | No min/max guest cross-validation | `packages/new/page.tsx` |
| M32 | "Watch Demo" + "Import Booking" buttons do nothing | `dashboard/page.tsx:79-85, 219-224` |
| M33 | Landing page footer — 3 dead links | `page.tsx:176-184` |

### API

| # | Issue | Location |
|---|-------|----------|
| M34 | No password change or password reset endpoint | `packages/api/src/routes/auth.ts` |
| M35 | No consumer-side booking cancellation endpoint | `packages/api/src/routes/bookings.ts` |
| M36 | Pay-single only allows `confirmed`, pay-event allows `confirmed`+`in_preparation`+`delivered` | `bookings.ts:302 vs 192` |
| M37 | No notification for: review posted, event deleted, spotlight expiring | Various |
| M38 | Vendor status not checked in vendorAuthMiddleware (suspended vendor can operate) | `packages/api/src/middleware/vendorAuth.ts` |
| M39 | Missing schema fields: `paidAt`, `confirmedAt`, `deliveredAt`, `completedAt`, `isDefault` on PaymentMethod | `schema.prisma` |
| M40 | No event status transition validation (completed → draft allowed) | `packages/api/src/routes/events.ts` |
| M41 | Spotlight expiration cleanup runs on every GET (should be cron) | `packages/api/src/routes/spotlight.ts:13-27` |
| M42 | No notification deletion endpoint (table grows unbounded) | `packages/api/src/routes/notifications.ts` |
| M43 | Upload `folder` query param not validated (user-controlled) | `packages/api/src/routes/upload.ts:37` |
| M44 | No `defaultLocation` update in profile schema | `packages/api/src/routes/auth.ts:9-13` |
| M45 | Booking reference retry exhaustion not handled (proceeds with duplicate ref) | `packages/api/src/routes/bookings.ts:72-79` |

---

## 5. Dead code

Files that exist but are never imported or used.

| File | Lines | Notes |
|------|-------|-------|
| `apps/consumer/contexts/AuthContext.tsx` | 0 | Empty file, 0 bytes |
| `apps/vendor/components/Breadcrumb.tsx` | 55 | Complete component, never imported |
| `apps/vendor/components/QuickActionCard.tsx` | 40 | Complete component, never imported |
| `apps/vendor/lib/events-ui.ts` | 16 | `TYPO`, `ROUND`, `CHERRY` — all unused. Spotlight page redefines `CHERRY` locally |

---

## 6. Pre-payment integration checklist

These must be completed before integrating a real payment gateway (Stripe, Tap, etc.):

### Must have (blocking)

- [ ] **A1** — Add try-catch to all 45 unprotected async handlers + add global error middleware
- [ ] **A2** — Add `express-rate-limit` on auth endpoints
- [ ] **A3** — Throw on startup if `JWT_SECRET` is missing (remove hardcoded fallback)
- [ ] **A4** — Add status transition state machine in vendor booking status update
- [ ] **A5** — Add duplicate booking prevention (unique constraint or code check)
- [ ] **A6** — Block admin registration via public endpoint
- [ ] **A7** — Add `helmet()` middleware + explicit `express.json({ limit: '1mb' })`
- [ ] **A8** — Add database indexes on frequently queried columns
- [ ] **A9** — Enforce `paymentStatus === "paid"` server-side before allowing `in_preparation`
- [ ] **M39** — Add `paidAt` timestamp to Booking model, add `stripePaymentMethodId`/`isDefault` to PaymentMethod model
- [ ] **H6** — Replace dummy payment UI with Stripe Elements or Tap checkout widget

### Should have (important but not blocking)

- [ ] **C1** — Implement password reset flow or remove the dead link
- [ ] **C2** — Unify event type options between create and edit pages
- [ ] **C3** — Add `min` date attribute to prevent past dates
- [ ] **C4** — Fix register redirect to use `window.location.href`
- [ ] **H1–H3** — Add missing toasts and error handling across consumer app
- [ ] **H4** — Add search debounce on catering page
- [ ] **M34** — Add password change endpoint
- [ ] **M35** — Add consumer booking cancellation endpoint
- [ ] **M36** — Align pay-single and pay-event allowed statuses
- [ ] **M38** — Check vendor status in vendorAuthMiddleware
- [ ] **M40** — Add event status transition validation

### Nice to have (can follow payment integration)

- [ ] **H9** — Add dietary requirements UI in event create
- [ ] **H10** — Add reviews pagination UI in vendor app
- [ ] **M1–M2** — Implement favorites and sorting, or remove the buttons
- [ ] **M4–M5** — Create Terms, Privacy, and Help pages, or remove the links
- [ ] **M6–M8** — Replace hardcoded badges and stats with real data
- [ ] **M37** — Add missing notification types
- [ ] **M41** — Move spotlight expiration to a scheduled job
- [ ] Dead code cleanup (D1–D4)
