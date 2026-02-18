# Consumer App Documentation

## Overview

The consumer app is a Progressive Web App (PWA) for event planning. The welcome screen is the starting point for all users.

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
| `/dashboard` | Dashboard (if logged in) |

---

## Key Components

| Component | Purpose |
|-----------|---------|
| `InstallPrompt` | Install banner (Chrome) or iOS instructions |
| `AuthScreenWrapper` | Full-screen auth layout (cream bg, blur shapes) |
| `PageTransition` | Fade/slide animation on route change |

---

## File Structure (Relevant)

```
apps/consumer/
├── app/
│   ├── layout.tsx          # Root layout, InstallPrompt, PageTransition
│   ├── page.tsx            # Home: redirects to /welcome or /dashboard
│   ├── manifest.json       # PWA manifest
│   ├── welcome/page.tsx
│   ├── get-started/page.tsx
│   └── (auth)/
│       ├── login/page.tsx
│       └── register/page.tsx
├── components/
│   ├── InstallPrompt.tsx
│   ├── PageTransition.tsx
│   └── auth/
│       ├── AuthScreenWrapper.tsx
│       ├── BrandHeading.tsx
│       ├── GlassCard.tsx
│       └── ...
├── hooks/
│   └── useDisplayMode.ts
└── next.config.js          # PWA plugin (production only)
```
