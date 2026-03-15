# Gatherly — Design & Architecture Document

## 1. Product overview

Gatherly is an event-planning platform focused on catering services in Bahrain. It consists of two portals and a shared API:

| Portal | Target user | Platform | URL |
|--------|------------|----------|-----|
| **Consumer app** | Event planners (individuals) | Mobile-first PWA (installable) | `localhost:3000` / gatherly-consumer.vercel.app |
| **Vendor app** | Catering businesses | Desktop dashboard | `localhost:3002` / gatherly-vendor.vercel.app |
| **API** | Both portals | Express + Prisma | `localhost:3001` / gatherly-skl4.onrender.com |

### Service categories

Only **Catering** is active. The following are scaffolded but show "Coming soon": Decor, Rentals, Entertainment, Photography, Miscellaneous.

---

## 2. Core business flow

```
Consumer creates event (name, date, guests, location)
       │
       ▼
Consumer browses catering vendors → views packages → books
       │
       ▼
Booking created  ──  status: "pending"  /  paymentStatus: "unpaid"
       │
       ▼
Vendor receives notification
       │
       ├── Decline  →  status: "cancelled"
       │
       └── Accept   →  status: "confirmed"
              │
              ▼
       ALL bookings for the event must be "confirmed"
       (no partial payments allowed)
              │
              ▼
       Consumer pays  →  paymentStatus: "paid"
       (Gatherly receives, pays vendors simultaneously)
              │
              ▼
       Vendor starts preparation  →  status: "in_preparation"
       (blocked until consumer has paid)
              │
              ▼
       Vendor marks delivered  →  status: "delivered"
       Consumer can leave a review
              │
              ▼
       Vendor marks completed  →  status: "completed"
```

### Status constants (from `@gatherly/shared`)

| Domain | Values |
|--------|--------|
| Booking status | `pending` → `confirmed` → `in_preparation` → `delivered` → `completed` / `cancelled` |
| Payment status | `unpaid` → `paid` / `refunded` |
| Event status | `draft` → `in_progress` → `completed` / `cancelled` |
| Event types | `birthday`, `anniversary`, `corporate`, `wedding`, `engagement`, `family_gathering`, `other` |
| User roles | `consumer`, `vendor`, `admin` |

---

## 3. Consumer app — features & components

### 3.1 App shell

| Component | File | Purpose |
|-----------|------|---------|
| `AppLayout` | `components/AppLayout.tsx` | Main shell — sidebar (desktop), content area, bottom nav (mobile). Max width 430px on mobile, responsive breakpoints for desktop. |
| `BottomNav` | `components/BottomNav.tsx` | Fixed bottom bar with 5 items: Home, Events, Create (center fab), Discover, Profile. Glass-morphism background with `backdrop-blur-xl`. |
| `Sidebar` | `components/Sidebar.tsx` | Desktop-only (≥768px), 256px wide. Links: Dashboard, Events, Bookings, Services, Profile. |
| `ConsumerTopBar` | `components/ConsumerTopBar.tsx` | Fixed top bar on dashboard — logo + notification bell with unread badge. Glass-morphism. |
| `AppBootstrap` | `components/AppBootstrap.tsx` | Session validator on app load — checks token, shows splash screen, redirects. |
| `SplashScreen` | `components/SplashScreen.tsx` | Initial loading screen with branding. |
| `PageTransition` | `components/PageTransition.tsx` | Fade + slide-up animation between routes. |

### 3.2 Authentication

| Screen | Route | Components used |
|--------|-------|----------------|
| Welcome | `/welcome` | `AuthScreenWrapper` — full-screen with decorative blur shapes |
| Get started | `/get-started` | Sign-up options (Apple, Phone disabled; Email active) |
| Login | `/login` | `AuthInput`, `AuthButton` — email + password |
| Register | `/register` | Name, email, password — role set to `consumer` |
| Forgot password | `/forgot-password` | Placeholder ("coming soon") |

**Auth mechanism:** JWT stored in `localStorage`. Token validated on app load via `GET /api/auth/me`. Automatic redirect to `/login` on 401 via the `fetchAuth()` wrapper.

### 3.3 Dashboard (`/dashboard`)

Sections in order:

1. **Greeting** — "Welcome back, {name}" with current date
2. **Upcoming events** — Horizontal scroll of event cards with gradient date blocks. Empty state with dashed border + `CalendarPlus` icon
3. **Featured partners** — Horizontal scroll (mobile) / 6-column grid (desktop). Vendor cards with avatar, name, cuisine, capacity
4. **Spotlight** — Horizontally scrollable cards (200×240px) for promoted packages
5. **Quick actions** — 2×2 grid: New Event, Browse Catering, Payments, Guest Lists

### 3.4 Events

| Feature | Route | Key patterns |
|---------|-------|-------------|
| Event list | `/events` | **Tabs:** Planning, Past, Draft with toggle animation. Cards show date gradient block, name, location, guest count. "Planning" label badge on active cards. |
| Create event | `/events/create` | Multi-field form. **Auto-saves** to `localStorage` as draft — cloud icon indicates saved status. Guest count via direct number input (not +/- steppers). |
| Event detail | `/events/[eventId]` | **Accordion layout** — progressive disclosure. Sections: Event details (date, time, location, guests, notes), Services/Catering (list of bookings with status badges). Dynamic CTA at bottom. |
| Edit event | `/events/[eventId]/edit` | Form with name, type, date/time, guests, location, venue, image upload. |
| Event services | `/events/[eventId]/services` | Grid of service categories. Only Catering is active; others show "Coming soon". |
| Event cart | `/events/[eventId]/cart` | **Accordion** for catering services. Per-vendor rows with status + amount. "Pay all" button (conditional — requires all vendors accepted). Payment method selection. |

**Event detail — CTA logic:**

| Condition | CTA shown |
|-----------|-----------|
| No bookings | "Add services" (links to services) |
| Some vendors pending | "Waiting for X vendor(s) to accept" (disabled) |
| All accepted, unpaid exist | "View cart & pay" |
| All paid | "View cart" |

### 3.5 Vendor browsing & booking

| Feature | Route | Description |
|---------|-------|-------------|
| Service discovery | `/services` | Categories grid. Top rated vendors. All partners list with search. |
| Catering browse | `/services/catering` | Search + cuisine filters (All, Italian, Arabic, Indian, etc.). Vendor cards with gradient backgrounds, capacity range. |
| Vendor profile | `/vendor/[id]` | Hero section, packages list, capacity info, about. |
| Package detail | `/vendor/[id]/package/[pkgId]` | Menu items with thumbnails, pricing breakdown, guest count selector. "Book package" button with subtle pulse animation. |
| Request booking | `/vendor/[id]/book` | Event picker, guest count, special requirements textarea. Frosted glass card backgrounds. |

### 3.6 Bookings

| Feature | Route | Description |
|---------|-------|-------------|
| Bookings list | `/bookings` | **Grouped by event** using accordion pattern. Tabs: Active, Past, Cancelled. Each event accordion shows bookings with status badges. "View in event" links to event detail. |
| Booking detail | `/bookings/[id]` | `OrderProgress` stepper (6 steps). Vendor info, event info, menu items with thumbnails, special requirements. Pay button (conditional on all event vendors accepted). Review form for delivered/completed bookings. |

**Order progress steps:** Request sent → Confirmed → Paid → In preparation → Delivered → Completed

### 3.7 Profile & settings

| Feature | Route | Description |
|---------|-------|-------------|
| Profile hub | `/profile` | User card with avatar + stats (events, upcoming, guests). Quick access links. Account items: Payment Methods, Payment History, Order History, Personal Info. Sign out. |
| Edit profile | `/profile/edit` | Name, phone, profile photo upload. Email is read-only. |
| Payment methods | `/profile/payment-methods` | Add/remove cards (dummy implementation for dev). |
| Payment history | `/profile/payment-history` | List of paid bookings with amounts. |

### 3.8 Notifications (`/notifications`)

List with Recent/Earlier grouping. Mark individual or all as read. Type-specific icons (event, booking, payment, reminder, message). Cards link to related resources.

### 3.9 PWA features

| Feature | Component | Details |
|---------|-----------|---------|
| Install prompt | `InstallPrompt` | Chrome: native `beforeinstallprompt`. iOS: manual "Add to Home Screen" instructions. Only on `/welcome` and `/get-started`. |
| Offline banner | `OfflineBanner` | Shows when device goes offline. |
| Update prompt | `AppUpdatePrompt` | Notifies when new service worker version is available. |
| Pull to refresh | `PullToRefresh` | Wraps list pages (events, bookings). |
| Display mode | `useDisplayMode` hook | Detects `standalone` vs `browser` mode. |

---

## 4. Vendor app — features & components

### 4.1 App shell

| Component | File | Purpose |
|-----------|------|---------|
| `VendorLayout` | `components/VendorLayout.tsx` | Dashboard shell — sidebar (256px) + header (64px) + content area. Desktop only — mobile shows "Use desktop to manage" overlay. |
| `Logo` | `components/Logo.tsx` | "Gatherlii" in Bright font. |
| `Breadcrumb` | `components/Breadcrumb.tsx` | Path-based breadcrumbs with route label mapping. |
| `PageHeader` | `components/PageHeader.tsx` | Title, optional subtitle, back link, optional action button. |
| `SearchBar` | `components/SearchBar.tsx` | Debounced search across bookings and packages. Dropdown results. |

**Sidebar navigation:**

| Item | Icon | Route |
|------|------|-------|
| Dashboard | `House` | `/dashboard` |
| Packages | `Package` | `/packages` |
| Bookings | `CalendarCheck` | `/bookings` |
| Notifications | `Bell` | `/notifications` |
| Unavailable dates | `CalendarBlank` | `/availability` |
| Reviews | `Star` | `/reviews` |
| Profile (settings) | `User` | `/profile` |
| Sign Out | `SignOut` | Clears localStorage → `/login` |

### 4.2 Authentication

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `/login` | Email + password. Checks `role === "vendor"`. Uses `AuthLayout`. |
| Register | `/register` | Name, business name, email, password. Service category picker, cuisine types, service areas. Creates user + vendor profile. |

**Auth guard:** The `(dashboard)` layout checks `localStorage` for token + vendor role. Redirects to `/login` on failure.

### 4.3 Dashboard (`/dashboard`)

| Section | Component | Details |
|---------|-----------|---------|
| Metrics | `MetricCard` × 4 | Total Bookings, Pending Requests, Average Rating, Revenue (This Month). 4-column grid on desktop. |
| Quick actions | Links | "Manage packages", "View bookings", "Reviews" — inline text links. |
| Recent bookings | Card list | Latest bookings with consumer name, event, package, date, status badge. |

### 4.4 Package management

| Feature | Route | Description |
|---------|-------|-------------|
| Packages list | `/packages` | Active and inactive packages. Actions: Spotlight, Edit, Deactivate. `ConfirmModal` for deactivation. |
| Create package | `/packages/new` | **4-step wizard** with `StepIndicator`: (1) Basic info — name, description, image, (2) Pricing — price type, base price, capacity, dietary tags, (3) Menu items — add/remove with name, description, category, image, (4) Review & submit. |
| Edit package | `/packages/[id]/edit` | Same 4-step wizard pre-filled. Can reactivate inactive packages. |
| Spotlight | `/packages/spotlight` | Select package, choose duration (3 or 7 days), preview, purchase. Lists active placements. |

### 4.5 Booking management

| Feature | Route | Description |
|---------|-------|-------------|
| Bookings list | `/bookings` | **Tabs:** Pending, Confirmed, In progress, Completed, Cancelled. Accept/decline directly from list for pending. |
| Booking detail | `/bookings/[id]` | Consumer info, event details, package + menu items, special requirements. Status-specific action buttons. |

**Status actions available to vendor:**

| Current status | Available action | Condition |
|---------------|-----------------|-----------|
| Pending | Accept → `confirmed` | Always |
| Pending | Decline → `cancelled` | Always |
| Confirmed | Start preparation → `in_preparation` | **Only if consumer has paid** (`paymentStatus === "paid"`). Otherwise shows "Awaiting customer payment" message. |
| In preparation | Mark delivered → `delivered` | Always |
| Delivered | Complete & close → `completed` | Always |

### 4.6 Other features

| Feature | Route | Description |
|---------|-------|-------------|
| Availability | `/availability` | Calendar grid. Click dates to toggle blocked (red) / available (gray). Past dates disabled. |
| Business profile | `/profile` | Edit business name, type, owner, description, cuisines, service areas, address, operating hours, logo, featured image. Image uploads to Cloudinary. |
| Notifications | `/notifications` | List from API. Mark single/all as read. Links to related resources. |
| Reviews | `/reviews` | Overall rating display. Paginated review list with rating, user, package, date, text. |

---

## 5. Design system

### 5.1 Brand colors

| Token | Hex | Usage |
|-------|-----|-------|
| **Primary (Cherry)** | `#6D0D35` | Buttons, active states, links, accents |
| Primary hover | `#5A0B2C` | Button hover |
| Primary pressed | `#4A0923` | Button active |
| Primary subtle | `#F5ECF0` | Light backgrounds |
| Text heading | `#1e0f14` / `#5A0B2C` | Headings |
| Text body | `#2D2D2D` / `#5A1E2C` | Body copy |
| Text secondary | `#6B6B6B` / `#8C5A68` | Secondary text |
| Text tertiary | `#9E9E9E` / `#BF9AA8` | Captions, hints |
| Card background | `#fdfaf7` | Consumer cards |
| Page background (consumer) | `#f4ede5` → `#ede4da` | Dashboard gradient |
| Page background (vendor) | `#f8fafc` (slate-50) | All pages |

### 5.2 Status colors

| Status | Background | Text | Used for |
|--------|-----------|------|----------|
| Pending | `amber-100` | `amber-700/800` | Awaiting vendor response |
| Confirmed | `emerald-100` | `emerald-700` | Vendor accepted |
| Paid | `blue-100` | `blue-700` | Payment complete |
| In preparation | `blue-100` | `blue-700` | Vendor cooking |
| Delivered | `emerald-100` | `emerald-700` | Order delivered |
| Completed | `emerald-100` / `#d1fae5` | `emerald-700` / `#047857` | Done |
| Cancelled/Declined | `red-100` / `#fee2e2` | `red-700` / `#b91c1c` | Cancelled |

### 5.3 Typography

| Font | Family | Usage |
|------|--------|-------|
| **Poppins** | Sans-serif | Body text, buttons, labels, UI |
| **Lora** | Serif | Headings, page titles, section labels (consumer) |
| **Bright** | Display | Logo "Gatherlii" |
| **Dancing Script** | Cursive | Decorative (available but rarely used) |

**Consumer type scale:**

| Token | Size | Weight | Use |
|-------|------|--------|-----|
| H1 | 20px | Semibold | Page titles |
| H2 | 17px | Semibold | Section headers |
| H3 | 15px | Semibold | Subsections |
| Body | 14px | Normal | Body text |
| Body small | 13px | Normal | Secondary |
| Caption | 12px | Medium | Labels |
| Caption small | 11px | Light | Tertiary |
| Micro | 10px | Light | Legal, timestamps |

**Vendor type scale:** Uses Tailwind defaults — `text-3xl` (titles), `text-lg` (sections), `text-sm` (body), `text-xs` (captions).

### 5.4 Spacing & radius

**Consumer (CSS custom properties):**

| Token | Value |
|-------|-------|
| `--radius-xs` | 6px |
| `--radius-sm` | 10px |
| `--radius-md` | 14px |
| `--radius-lg` | 20px |
| `--radius-xl` | 28px |
| `--radius-pill` | 999px |

**Vendor:** Default Tailwind radius — `rounded-lg` (8px), `rounded-xl` (12px), `rounded-2xl` (16px), `rounded-3xl` (24px).

Consumer uses pill-shaped (fully rounded) buttons and inputs. Vendor uses rounded rectangles.

### 5.5 Shadows

**Consumer** — cherry-tinted shadows:

| Token | Value |
|-------|-------|
| `--shadow-xs` | `0 1px 3px rgba(109, 13, 53, 0.05)` |
| `--shadow-sm` | `0 2px 8px rgba(109, 13, 53, 0.07)` |
| `--shadow-md` | `0 4px 16px rgba(109, 13, 53, 0.09)` |
| `--shadow-lg` | `0 8px 28px rgba(109, 13, 53, 0.11)` |
| `--shadow-xl` | `0 16px 48px rgba(109, 13, 53, 0.13)` |
| `--shadow-cherry` | `0 4px 14px rgba(109, 13, 53, 0.35)` |

**Vendor** — neutral Tailwind shadows: `shadow-lg`, `shadow-xl`.

### 5.6 Gradients

Used on consumer for card backgrounds (event cards, partner avatars, spotlight):

| Set | Count | Tones | Used on |
|-----|-------|-------|---------|
| `PARTNER_GRADIENTS` | 4 | Brown, dark, blue, green | Dashboard event/partner cards |
| `SPOTLIGHT_GRADIENTS` | 3 | Dark warm tones | Spotlight cards |
| `FEAT_GRADIENTS` | 3 | Brown, dark, green | Services feature cards |
| `CARD_GRADIENTS` | 4 | Brown/earthy | Catering vendor cards |

All use `135deg` or `160deg` angles. Colors are warm/earthy to match the brand.

### 5.7 Animations

| Animation | Duration | Easing | Used on |
|-----------|----------|--------|---------|
| `fadeIn` | 200–350ms | ease-out | General appearance |
| `fadeInUp` | 300ms | cubic-bezier(0.22, 1, 0.36, 1) | Cards, sections |
| `slideInUp` | 450ms | cubic-bezier(0.22, 1, 0.36, 1) | Page transitions |
| `modalBackdropIn` | 250ms | ease-out | Modal overlays |
| `modalSlideUp` | 350ms | cubic-bezier(0.32, 0.72, 0, 1) | Mobile modals (bottom sheet) |
| `modalScaleIn` | 300ms | cubic-bezier(0.32, 0.72, 0, 1) | Desktop modals (centered) |
| `subtle-pulse` | 2.5s | ease-in-out, infinite | "Book package" button |
| `tap-scale` | instant | — | `scale(0.98)` on `:active` for touch feedback |

All animations respect `prefers-reduced-motion: reduce`.

### 5.8 Elevation system (consumer)

5 levels from subtle to prominent:

| Level | Shadow | Typical use |
|-------|--------|-------------|
| 1 | `0 1px 3px rgba(0,0,0,0.06)` | Cards at rest |
| 2 | `0 2px 8px rgba(0,0,0,0.08)` | Cards on hover |
| 3 | `0 4px 16px rgba(0,0,0,0.10)` | Mobile content area |
| 4 | `0 8px 24px rgba(0,0,0,0.12)` | Popovers |
| 5 | `0 16px 40px rgba(0,0,0,0.14)` | Modals |

---

## 6. UI patterns

### 6.1 Accordion (consumer)

Used on: Event detail, Cart, Bookings list.

- Container: `bg-[#fdfaf7] border border-primary/10 rounded-[18px]`
- Active shadow: `shadow-[0_4px_20px_rgba(109,13,53,0.08)]`
- Header: full-width button with icon + title + subtitle + `CaretDown` (rotates 180° when expanded)
- Body: `border-t border-primary/10 pt-4 animate-fade-in`
- State: single `expanded` state variable — only one section open at a time

### 6.2 Bottom navigation (consumer)

- Glass-morphism: `rgba(255, 255, 255, 0.75)` + `backdrop-blur-xl`
- 5 items, center item (Create) is elevated: 56×56px circle, primary background, raised with `-mt-6` and cherry shadow
- Active indicator: primary color on icon + label
- Safe area: respects `env(safe-area-inset-bottom)` for notched devices

### 6.3 Cards

**Consumer:** Warm cream (`#fdfaf7`) with `border-primary/10`, `rounded-2xl`. Cherry-tinted shadows on hover.

**Vendor:** White with `border-slate-200`, `rounded-2xl`. Neutral shadows on hover.

### 6.4 Modals

**Consumer:**
- Mobile: bottom sheet (slides up from bottom)
- Desktop (≥640px): centered with scale-in animation
- Overlay: `bg-black/50` with fade-in

**Vendor:**
- Always centered (`ConfirmModal`): white card, `rounded-2xl`, `shadow-xl`, max-width 384px
- Supports `variant="danger"` for destructive actions (red confirm button)

### 6.5 Status badges

Inline pill badges: `text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full`. Color-coded by status (see section 5.2).

### 6.6 Order progress stepper (consumer)

Vertical stepper with 6 steps. Each step has:
- Circle (28×28px): emerald with check (done), primary with ring (current), slate (pending)
- Label: primary color (current), dark (done), muted (pending)

### 6.7 Step indicator (vendor)

Horizontal stepper for package wizard (4 steps):
- Circles (40×40px): primary with check (done), primary with ring offset (current), slate (pending)
- Connectors: thin line between circles, primary (done) or slate
- Labels below each circle

### 6.8 Form patterns

**Consumer:** Pill-shaped inputs (52px height, `rounded-full`). Focus ring: `ring-2 ring-primary/20 border-primary/40`.

**Vendor:** Standard inputs with `rounded-xl` or `rounded-lg`. Focus ring: `ring-2 ring-primary/20`. Grouped in `FormSection` with section title headings.

---

## 7. Data flow & API integration

### 7.1 Authentication

Both portals use the same pattern:
1. Login/register via `POST /api/auth/login` or `/register`
2. Response returns `{ user, token }`
3. Token + user stored in `localStorage`
4. All subsequent requests include `Authorization: Bearer <token>`
5. Consumer uses `fetchAuth()` wrapper that auto-clears session and redirects on 401
6. Vendor checks token + role in the dashboard layout on mount

### 7.2 Image uploads

1. Client compresses image (`lib/compress-image.ts`) — max 1200×1200px, JPEG, under 1MB
2. Upload via `POST /api/upload/image` (multipart form data, 5MB server limit)
3. API uploads to Cloudinary, returns `{ url }`
4. URL stored on the relevant model (user profile, event, package, menu item)

### 7.3 Notifications

- Created server-side when status changes (booking accepted, payment received, etc.)
- Consumer and vendor poll via `GET /api/notifications/unread-count`
- Full list fetched with cursor-based pagination
- Mark read: `PATCH /api/notifications/:id/read` or `/read-all`

### 7.4 Draft persistence

| Draft type | Storage | Lifetime | Data saved |
|-----------|---------|----------|------------|
| Event creation | `localStorage` | Survives reload + close | All form fields |
| Booking | `sessionStorage` | Clears on tab close | Vendor, package, guest count |

---

## 8. Differences between portals

| Aspect | Consumer | Vendor |
|--------|----------|--------|
| Target device | Mobile-first (430px max) | Desktop-only (mobile blocked) |
| Navigation | Bottom nav + sidebar | Sidebar only + top header |
| Background | Warm cream/gradient | Cool slate |
| Cards | Cream (`#fdfaf7`) | White |
| Shadows | Cherry-tinted | Neutral |
| Inputs | Pill-shaped (`rounded-full`) | Rounded rectangles |
| Typography headings | Lora (serif) | Poppins (sans) |
| PWA | Yes (installable, offline) | No |
| Auth storage | `localStorage` | `localStorage` |
| API base | `NEXT_PUBLIC_API_URL` | `NEXT_PUBLIC_API_URL` |

---

## 9. File & component map

### Consumer (`apps/consumer/`)

```
app/
├── layout.tsx                    # Root: fonts, metadata, global wrappers
├── page.tsx                      # Landing / redirect
├── globals.css                   # All custom CSS + animations
├── tokens.css                    # Design token CSS variables
├── manifest.json                 # PWA manifest
├── (auth)/                       # Login, register, forgot-password
├── dashboard/page.tsx            # Main dashboard
├── events/                       # CRUD + detail + services + cart
├── bookings/                     # List + detail
├── services/                     # Discovery + catering browse
├── vendor/[id]/                  # Vendor profile + package + book
├── profile/                      # Profile + edit + payments
├── notifications/page.tsx        # Notification list
└── welcome/ & get-started/       # Onboarding

components/
├── AppLayout.tsx                 # Shell (sidebar + content + bottom nav)
├── BottomNav.tsx                 # Mobile bottom navigation
├── Sidebar.tsx                   # Desktop sidebar
├── ConsumerTopBar.tsx            # Dashboard header
├── OrderProgress.tsx             # 6-step order stepper
├── AppBootstrap.tsx              # Session validation
├── SplashScreen.tsx              # Loading splash
├── PageTransition.tsx            # Route animations
├── PullToRefresh.tsx             # Pull-to-refresh wrapper
├── InstallPrompt.tsx             # PWA install banner
├── OfflineBanner.tsx             # Offline indicator
├── AppUpdatePrompt.tsx           # Service worker update notice
├── EventImage.tsx                # Event image with fallback
├── RemoteImage.tsx               # Remote image with fallback
├── Logo.tsx                      # App logo
├── auth/AuthScreenWrapper.tsx    # Auth screen layout with blur shapes
├── auth/BrandHeading.tsx         # Logo heading for auth
├── ui/AuthInput.tsx              # Form input (pill-shaped)
├── ui/AuthButton.tsx             # Form button (pill-shaped)
├── ui/StatusBadge.tsx            # Event status badge
└── ui/Tag.tsx                    # Booking/cuisine tags

lib/
├── api.ts                        # API_URL, fetchAuth, error parsing
├── session.ts                    # Token get/set/clear/validate
├── date-utils.ts                 # Date formatting helpers
├── events-ui.ts                  # Design tokens (colors, typography, buttons, inputs, cards)
├── gradients.ts                  # Gradient definitions for cards
├── bookingStatus.ts              # Status labels + order step definitions
├── booking-draft.ts              # Booking draft persistence (sessionStorage)
├── event-create-draft.ts         # Event draft persistence (localStorage)
├── compress-image.ts             # Client-side image compression
└── logger.ts                     # Dev logging utilities

hooks/
└── useDisplayMode.ts             # PWA display mode detection
```

### Vendor (`apps/vendor/`)

```
app/
├── layout.tsx                    # Root: Poppins font, Toaster
├── page.tsx                      # Marketing landing page
├── globals.css                   # Custom CSS + Bright font
├── (auth)/                       # Login, register
└── (dashboard)/                  # Auth-guarded route group
    ├── layout.tsx                # Auth guard (token + role check)
    ├── dashboard/page.tsx        # Metrics + recent bookings
    ├── packages/                 # List, new (4-step wizard), edit, spotlight
    ├── bookings/                 # List with tabs + detail with status actions
    ├── availability/page.tsx     # Calendar date blocking
    ├── profile/page.tsx          # Business profile editor
    ├── notifications/page.tsx    # Notification list
    └── reviews/page.tsx          # Reviews list

components/
├── VendorLayout.tsx              # Dashboard shell (sidebar + header + content)
├── Logo.tsx                      # "Gatherlii" in Bright font
├── Breadcrumb.tsx                # Path-based breadcrumbs
├── PageHeader.tsx                # Page title + subtitle + action
├── MetricCard.tsx                # Dashboard metric card with icon
├── FormSection.tsx               # Form section wrapper with title
├── ConfirmModal.tsx              # Confirmation dialog (default + danger)
├── QuickActionCard.tsx           # Linked action card
├── SearchBar.tsx                 # Global search with dropdown
├── ui/AuthLayout.tsx             # Auth screen layout (centered)
├── ui/AuthInput.tsx              # Form input with label
├── ui/AuthButton.tsx             # Primary button with loading state
└── ui/StepIndicator.tsx          # Horizontal stepper for package wizard

lib/
├── api.ts                        # API_URL, parseJsonResponse
├── categories.ts                 # Vendor categories + icons + allowed list
├── compress-image.ts             # Client-side image compression
└── events-ui.ts                  # Design tokens (CHERRY, ROUND, TYPO)
```

### API (`packages/api/`)

```
src/
├── server.ts                     # Express app, CORS, route mounting
├── lib/
│   ├── prisma.ts                 # Singleton PrismaClient
│   └── logger.ts                 # logRequest, logError, logInfo
├── middleware/
│   ├── auth.ts                   # JWT verification → req.user
│   └── vendorAuth.ts             # Role check → req.vendor
└── routes/
    ├── auth.ts                   # Register, login, me, update profile
    ├── events.ts                 # Event CRUD + guest management
    ├── bookings.ts               # Booking CRUD, pay, review
    ├── vendors.ts                # Public vendor listing + detail
    ├── vendor.ts                 # Vendor dashboard (packages, bookings, profile)
    ├── spotlight.ts              # Public spotlight packages
    ├── spotlight-vendor.ts       # Vendor spotlight purchase
    ├── upload.ts                 # Cloudinary image upload
    ├── payment-methods.ts        # Card management (dummy)
    ├── notifications.ts          # Notification list + mark read
    └── health.ts                 # Health check + DB connectivity

prisma/
├── schema.prisma                 # Database models + relations
├── seed.ts                       # Dev seed data
└── migrations/                   # Migration history
```

### Shared (`packages/shared/`)

```
src/
├── index.ts                      # Re-exports all below
├── constants.ts                  # USER_ROLES, BOOKING_STATUS, PAYMENT_STATUS, EVENT_TYPES
└── schemas/
    ├── auth.ts                   # registerSchema, loginSchema (Zod)
    └── event.ts                  # createEventSchema, updateEventSchema, guest schemas (Zod)
```
