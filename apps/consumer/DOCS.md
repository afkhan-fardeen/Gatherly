# Consumer App Documentation

## Overview

The consumer app is a Progressive Web App (PWA) for event planning. The welcome screen is the starting point for new users.

---

## PWA Configuration

### Manifest

- **File:** `app/manifest.json`
- **Start URL:** `/`
- **Display:** `standalone` (opens without browser chrome when installed)
- **Icons:** 192x192 and 512x512 PNG (any + maskable)

### Service Worker

- **Library:** `@ducanh2912/next-pwa`
- **Config:** `next.config.js` — PWA plugin applied only during production build
- **Output:** `public/sw.js` (service worker)
- **Scope:** `/`

---

## Display Mode Detection

### Hook: `useDisplayMode`

- **File:** `hooks/useDisplayMode.ts`
- **Returns:** `"standalone"` | `"browser"`

**Detection logic:**
- `window.matchMedia("(display-mode: standalone)")` — Chrome, Edge, Samsung
- `window.matchMedia("(display-mode: fullscreen)")` — some PWAs
- `navigator.standalone` — iOS Safari (legacy)

**Usage:** Used by `InstallPrompt` to show install banner only in browser (not when installed as PWA).

---

## Entry Points and Flow

### Home (`/`)

All users (browser and PWA) hitting `/` are redirected:

```
/ (Home)
  └── Redirect
        ├── Has token? → /dashboard
        └── No token? → /welcome
```

The welcome screen is the starting point for new users.

---

## Auth Flow

### Welcome Screen (`/welcome`)

- Circular image, "Welcome to Gatherlii", value prop
- **Continue** → `/get-started`
- **Install prompt** shown here (browser only)

### Get Started (`/get-started`)

- Sign-up options: Apple, Phone, Email
- **Continue with Email** → `/register`
- **Install prompt** shown here (browser only)
- Terms and Privacy links

### Login (`/login`)

- Email + password form
- Forgot Password, Continue with Google
- **Sign up** link → `/register`

### Register (`/register`)

- Name, email, password
- **Sign in** link → `/login`

---

## Install Prompt

### When It Shows

- **Display mode:** Browser only (not when running as installed PWA)
- **Routes:** `/welcome` and `/get-started` only
- **Dismissal:** Stored in `sessionStorage` (`installPromptDismissed`)

### Behavior by Platform

| Platform | Behavior |
|----------|----------|
| Chrome, Edge | Listens for `beforeinstallprompt`, shows Install / Not now buttons |
| iOS Safari | No `beforeinstallprompt`; shows "Tap Share, then Add to Home Screen" |

### Component

- **File:** `components/InstallPrompt.tsx`
- **Rendered in:** `app/layout.tsx` (global, but visibility gated by route and display mode)

---

## Route Summary

| Route | Description |
|-------|-------------|
| `/` | Redirects to /dashboard (if logged in) or /welcome |
| `/welcome` | Welcome screen + install prompt (browser only) |
| `/get-started` | Sign-up options + install prompt (browser only) |
| `/login` | Login form |
| `/register` | Register form |
| `/forgot-password` | Password reset |
| `/dashboard` | Dashboard (if logged in) |
| `/events` | My events list |
| `/events/create` | Create event |
| `/events/[id]` | Event detail |
| `/events/[id]/edit` | Edit event |
| `/events/[id]/services` | Event services |
| `/bookings` | My bookings |
| `/bookings/[id]` | Booking detail |
| `/services` | Service categories |
| `/services/catering` | Catering browse |
| `/services/coming-soon/[slug]` | Coming soon placeholder |
| `/vendor/[id]` | Vendor profile |
| `/vendor/[id]/package/[pkgId]` | Package detail |
| `/vendor/[id]/book` | Book vendor |
| `/profile` | Profile & settings |
| `/profile/edit` | Edit profile |
| `/profile/payment-methods` | Payment methods |
| `/profile/payment-history` | Payment history |
| `/notifications` | Notifications |
| `/vendors` | Redirects to /services/catering |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `InstallPrompt` | Install banner (Chrome) or iOS instructions |
| `AuthScreenWrapper` | Full-screen auth layout (cream bg, blur shapes) |
| `PageTransition` | Fade/slide animation on route change |
| `AppLayout` | Main layout with Sidebar + BottomNav |
| `SplashScreen` | Initial loading splash |
| `PullToRefresh` | Pull-to-refresh on events/bookings |

---

## Shared Libraries

| File | Purpose |
|------|---------|
| `lib/api.ts` | API_URL, fetchAuth, parseApiError, getNetworkErrorMessage |
| `lib/session.ts` | getToken, setSession, clearSession, validateSession |
| `lib/date-utils.ts` | formatTime, formatDateLong, formatEventDate, etc. |
| `lib/gradients.ts` | PARTNER_GRADIENTS, CARD_GRADIENTS, etc. |
| `lib/events-ui.ts` | Design tokens (TYPO, BUTTON, INPUT, CARD) |
| `lib/booking-draft.ts` | Booking draft persistence |
| `lib/bookingStatus.ts` | getBookingStatusLine, getCurrentStepIndex |
| `lib/event-create-draft.ts` | Event create draft persistence |
| `lib/compress-image.ts` | Image compression for uploads |

---

## File Structure

```
apps/consumer/
├── app/
│   ├── layout.tsx           # Root layout, InstallPrompt, PageTransition, AppBootstrap
│   ├── page.tsx             # Home: redirects to /welcome or /dashboard
│   ├── globals.css          # Global styles
│   ├── tokens.css           # Design tokens (imported by globals.css)
│   ├── manifest.json        # PWA manifest
│   ├── welcome/page.tsx
│   ├── get-started/page.tsx
│   ├── dashboard/page.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── events/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   └── [eventId]/
│   │       ├── page.tsx
│   │       ├── edit/page.tsx
│   │       └── services/page.tsx
│   ├── bookings/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── services/
│   │   ├── page.tsx
│   │   ├── catering/page.tsx
│   │   └── coming-soon/[slug]/page.tsx
│   ├── vendor/[id]/
│   │   ├── page.tsx
│   │   ├── package/[pkgId]/page.tsx
│   │   └── book/page.tsx
│   ├── profile/
│   │   ├── page.tsx
│   │   ├── edit/page.tsx
│   │   ├── payment-methods/page.tsx
│   │   └── payment-history/page.tsx
│   ├── notifications/page.tsx
│   └── vendors/page.tsx     # Redirects to /services/catering
├── components/
│   ├── AppLayout.tsx
│   ├── AppBootstrap.tsx
│   ├── Sidebar.tsx
│   ├── BottomNav.tsx
│   ├── ConsumerTopBar.tsx
│   ├── InstallPrompt.tsx
│   ├── PageTransition.tsx
│   ├── PullToRefresh.tsx
│   ├── SplashScreen.tsx
│   ├── HomePageSkeleton.tsx
│   ├── OfflineBanner.tsx
│   ├── AppUpdatePrompt.tsx
│   ├── RemoteImage.tsx
│   ├── EventImage.tsx
│   ├── Logo.tsx
│   ├── OrderProgress.tsx
│   ├── auth/
│   │   ├── AuthScreenWrapper.tsx
│   │   └── BrandHeading.tsx
│   └── ui/
│       ├── AuthInput.tsx
│       ├── AuthButton.tsx
│       ├── StatusBadge.tsx
│       └── Tag.tsx
├── hooks/
│   └── useDisplayMode.ts
├── lib/
│   ├── api.ts
│   ├── session.ts
│   ├── date-utils.ts
│   ├── gradients.ts
│   ├── events-ui.ts
│   ├── booking-draft.ts
│   ├── bookingStatus.ts
│   ├── event-create-draft.ts
│   └── compress-image.ts
├── public/
│   ├── fonts/               # Lora font family
│   ├── icons/               # PWA icons (192, 512)
│   ├── images/              # Service categories, welcome screen
│   └── logo/                # logo1.png
├── types/
│   └── pwa.d.ts
├── DOCS.md
├── QA_TEST_REPORT.md
└── next.config.js
```

---

## Environment

- `NEXT_PUBLIC_API_URL` — API base URL (e.g. `http://localhost:3001` or `http://<ip>:3001` for mobile)
- See `.env.local.example` or root `.env.example` for reference.
