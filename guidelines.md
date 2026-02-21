# 🎨 UI REVAMP — Complete Design System
### Glovo-Inspired Food Delivery PWA
**For Cursor AI — Read this entire file before touching a single component.**

---

## ⚡ WHY THIS REVAMP EXISTS

The current UI is broken in these exact ways:
- Icons are random sizes — some 18px, some 24px, some 30px in the same screen
- Cards have different heights, different border radii, different padding per screen
- Typography is made up per component — no shared scale
- Spacing is arbitrary — 7px here, 13px there, 22px somewhere else
- Colors are applied inconsistently — no token system

**This document is the single source of truth. Every value here is a decision, not a guess. Cursor must apply these globally and never use one-off values.**

---

## 🔧 SETUP — DO THIS FIRST

### Step 1 — Install Font

Add to your `index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Step 2 — Install Icon Library

```bash
npm install @phosphor-icons/react
```

Use **only** Phosphor Icons. No mixing with heroicons, lucide, feather, or any other library. Delete all other icon imports.

### Step 3 — Create `/src/styles/tokens.css`

This file is imported globally. All CSS variables live here and nowhere else.

```css
/* ============================================================
   DESIGN TOKENS — Single source of truth
   Replace YOUR_PRIMARY with your actual brand hex
   Replace YOUR_PRIMARY_DARK with a ~15% darker shade of it
   Replace YOUR_PRIMARY_LIGHT with a ~90% lighter tint of it
   ============================================================ */

:root {

  /* ─── BRAND (replace these with your actual colors) ─── */
  --color-primary:        YOUR_PRIMARY;       /* e.g. #FF6B00 */
  --color-primary-dark:   YOUR_PRIMARY_DARK;  /* e.g. #E05A00 — hover/pressed */
  --color-primary-light:  YOUR_PRIMARY_LIGHT; /* e.g. #FFF3EB — light bg tint */
  --color-primary-text:   #FFFFFF;            /* text ON primary bg */

  /* ─── NEUTRALS ─── */
  --color-bg:             #F7F8FA;  /* App background — slightly warm grey, not pure white */
  --color-surface:        #FFFFFF;  /* Cards, sheets, modals */
  --color-surface-raised: #FFFFFF;  /* Elevated cards with shadow */
  --color-border:         #EBEBEB;  /* Dividers, input borders */
  --color-border-strong:  #D4D4D4;  /* Pressed states, strong dividers */

  /* ─── TEXT ─── */
  --color-text-primary:   #111111;  /* Headlines, card titles */
  --color-text-secondary: #666666;  /* Subtitles, metadata */
  --color-text-tertiary:  #999999;  /* Placeholders, disabled */
  --color-text-inverse:   #FFFFFF;  /* Text on dark/primary backgrounds */

  /* ─── SEMANTIC ─── */
  --color-success:        #1DB954;  /* Confirmed, delivered, online */
  --color-success-light:  #E8F9EF;  /* Success badge background */
  --color-warning:        #F5A623;  /* Delayed, attention needed */
  --color-warning-light:  #FEF6E7;  /* Warning badge background */
  --color-error:          #E53935;  /* Failed, closed, unavailable */
  --color-error-light:    #FDEEEE;  /* Error badge background */
  --color-info:           #2196F3;  /* Informational only */
  --color-info-light:     #E8F4FE;  /* Info badge background */

  /* ─── RATING ─── */
  --color-star:           #FFC107;  /* Star rating fill */

  /* ─── OVERLAY ─── */
  --color-overlay:        rgba(0, 0, 0, 0.48); /* Backdrop for modals/sheets */
  --color-scrim:          rgba(0, 0, 0, 0.06); /* Subtle image overlay for text legibility */

  /* ─── SPACING ─── */
  --sp-1:   4px;
  --sp-2:   8px;
  --sp-3:   12px;
  --sp-4:   16px;
  --sp-5:   20px;
  --sp-6:   24px;
  --sp-8:   32px;
  --sp-10:  40px;
  --sp-12:  48px;
  --sp-16:  64px;

  /* ─── BORDER RADIUS ─── */
  --radius-xs:     6px;
  --radius-sm:     10px;
  --radius-md:     14px;
  --radius-lg:     20px;
  --radius-xl:     28px;
  --radius-pill:   999px;
  --radius-circle: 50%;

  /* ─── SHADOWS ─── */
  --shadow-none:   none;
  --shadow-xs:     0 1px 3px rgba(0,0,0,0.06);
  --shadow-sm:     0 2px 8px rgba(0,0,0,0.08);
  --shadow-md:     0 4px 16px rgba(0,0,0,0.10);
  --shadow-lg:     0 8px 24px rgba(0,0,0,0.12);
  --shadow-xl:     0 16px 40px rgba(0,0,0,0.14);

  /* ─── ICONS ─── */
  --icon-xs:   14px;
  --icon-sm:   18px;
  --icon-md:   22px;
  --icon-nav:  24px;
  --icon-lg:   28px;
  --icon-xl:   40px;

  /* ─── TRANSITIONS ─── */
  --transition-fast:   120ms ease;
  --transition-base:   200ms ease;
  --transition-slow:   320ms ease;

  /* ─── Z-INDEX LAYERS ─── */
  --z-base:      0;
  --z-raised:    10;
  --z-dropdown:  100;
  --z-sticky:    200;
  --z-overlay:   300;
  --z-modal:     400;
  --z-toast:     500;
}
```

### Step 4 — Global Base Styles in `index.css`

```css
@import './tokens.css';

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
}

body {
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--color-text-primary);
  background-color: var(--color-bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow-x: hidden;
}

/* Remove tap highlight on mobile */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Consistent image behaviour */
img {
  display: block;
  max-width: 100%;
  object-fit: cover;
}

/* Focusable elements — no default outline, custom one instead */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## ✏️ TYPOGRAPHY SYSTEM

**Rule: Every text element maps to one of these. No custom font sizes anywhere in component files.**

```css
/* ─────────────────────────────────────────
   Add these classes to /src/styles/typography.css
   ───────────────────────────────────────── */

/* DISPLAY — Hero banners only */
.t-display {
  font-size: 30px;
  font-weight: 800;
  line-height: 38px;
  letter-spacing: -0.6px;
  color: var(--color-text-primary);
}

/* H1 — Page titles */
.t-h1 {
  font-size: 22px;
  font-weight: 700;
  line-height: 30px;
  letter-spacing: -0.4px;
  color: var(--color-text-primary);
}

/* H2 — Section headings ("Popular Now", "Order Again") */
.t-h2 {
  font-size: 17px;
  font-weight: 700;
  line-height: 24px;
  letter-spacing: -0.2px;
  color: var(--color-text-primary);
}

/* H3 — Card titles, restaurant names */
.t-h3 {
  font-size: 15px;
  font-weight: 600;
  line-height: 21px;
  color: var(--color-text-primary);
}

/* BODY — Default body text, descriptions */
.t-body {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: var(--color-text-primary);
}

/* BODY MEDIUM — Prices, ETA, key data */
.t-body-md {
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: var(--color-text-primary);
}

/* BODY SMALL — Supporting info, addresses */
.t-body-sm {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: var(--color-text-secondary);
}

/* LABEL — Badge text, status text, button labels */
.t-label {
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.1px;
}

/* CAPTION — Timestamps, footnotes */
.t-caption {
  font-size: 11px;
  font-weight: 400;
  line-height: 15px;
  color: var(--color-text-tertiary);
}
```

### Usage Map — Where Each Style Goes

| UI Element | Class |
|---|---|
| Page title ("Restaurants Near You") | `t-h1` |
| Section header ("Popular Now") | `t-h2` |
| Restaurant name on card | `t-h3` |
| Food item name | `t-h3` |
| Menu item description | `t-body-sm` |
| Price, ETA, delivery fee | `t-body-md` |
| Address, meta info | `t-body-sm` |
| Button label | `t-label` |
| Badge (New, Promo, Open) | `t-label` |
| Rating count, small meta | `t-caption` |
| Search input text | `t-body` |
| Placeholder text | `t-body` + `color: var(--color-text-tertiary)` |

---

## 🔲 ICON RULES

**Inconsistent icon sizes are the biggest visual problem. These rules are non-negotiable.**

| Context | Size Token | Pixel | Phosphor Weight |
|---|---|---|---|
| Bottom nav (inactive) | `--icon-nav` | 24px | `regular` |
| Bottom nav (active) | `--icon-nav` | 24px | `fill` |
| Top header (back, search, cart) | `--icon-md` | 22px | `regular` |
| Inline with body text | `--icon-xs` | 14px | `regular` |
| Card metadata (clock, star, bike) | `--icon-sm` | 18px | `regular` |
| Category bubble icons | `--icon-lg` | 28px | `regular` |
| Empty state illustration | `--icon-xl` | 40px | `thin` |
| Form field prefix (map pin, etc) | `--icon-sm` | 18px | `regular` |
| Chip/pill icons | `--icon-xs` | 14px | `regular` |

```jsx
// CORRECT usage in JSX
import { Star, Clock, Bicycle } from '@phosphor-icons/react';

<Star size={18} weight="regular" color="var(--color-star)" />
<Clock size={18} weight="regular" color="var(--color-text-secondary)" />
<Bicycle size={22} weight="regular" color="var(--color-primary)" />
```

**Never hardcode pixel values. Always reference the token in CSS or pass the variable value.**

---

## 🃏 CARD COMPONENTS

### Card — Restaurant (Vertical, Grid-style) — PRIMARY CARD FORMAT

This is Glovo's signature card. Image on top, details below. Used in the main feed.

```
┌─────────────────────────┐
│                         │  ← Image 16:9 ratio, fills full card width
│       [Photo]           │    Height: 130px
│                         │
│ ⭐ 4.8  🕐 20–30 min   │  ← Overlaid on image bottom (scrim gradient)
├─────────────────────────┤
│ Restaurant Name         │  ← t-h3, --color-text-primary
│ Burgers · $$            │  ← t-body-sm, --color-text-secondary
│ 🚲 Free delivery        │  ← t-caption + icon-xs, primary color
└─────────────────────────┘
```

```css
.card-restaurant {
  background: var(--color-surface);
  border-radius: var(--radius-md);       /* 14px */
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  width: 100%;
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.card-restaurant:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-xs);
}

.card-restaurant__image-wrap {
  position: relative;
  width: 100%;
  height: 130px;
  overflow: hidden;
}

.card-restaurant__image-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Gradient scrim for text legibility over image */
.card-restaurant__image-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 55%);
}

.card-restaurant__image-meta {
  position: absolute;
  bottom: var(--sp-2);
  left: var(--sp-2);
  right: var(--sp-2);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  color: #FFFFFF;
}

.card-restaurant__body {
  padding: var(--sp-3) var(--sp-3) var(--sp-3);  /* 12px all sides */
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);  /* 4px between lines */
}

.card-restaurant__delivery-row {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  margin-top: var(--sp-1);
}
```

Grid layout for this card: **2-column grid, gap 12px, page padding 16px**

```css
.restaurant-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-3);  /* 12px */
  padding: 0 var(--sp-4);  /* 16px sides */
}
```

---

### Card — Restaurant (Horizontal) — Used in "Order Again", Featured rows

```
┌────────────────────────────────────────┐
│  [Img]  │ Restaurant Name              │
│  72×72  │ Burgers · ⭐ 4.8             │  ← t-h3 + t-body-sm
│         │ 🕐 20 min · Free delivery   │  ← t-caption
└────────────────────────────────────────┘
```

```css
.card-restaurant-h {
  display: flex;
  align-items: center;
  gap: var(--sp-3);            /* 12px gap */
  padding: var(--sp-3) var(--sp-4);  /* 12px top/bottom, 16px sides */
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.card-restaurant-h:active {
  background: var(--color-bg);
}

.card-restaurant-h__image {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-sm);  /* 10px */
  object-fit: cover;
  flex-shrink: 0;
}

.card-restaurant-h__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);  /* 4px */
  min-width: 0;  /* prevent overflow */
}

.card-restaurant-h__meta {
  display: flex;
  align-items: center;
  gap: var(--sp-2);  /* 8px */
  flex-wrap: wrap;
}
```

---

### Card — Food / Menu Item

```
┌────────────────────────────────────────────┐
│ Item Name                    │  [Img 80×80] │
│ t-h3                         │              │
│                              │              │
│ Description text here        └──────────────│
│ t-body-sm, 2 lines max                      │
│                                             │
│ $12.99                         [  +  ]      │
│ t-body-md                   (add button)    │
└─────────────────────────────────────────────┘
```

```css
.card-food-item {
  display: flex;
  align-items: flex-start;
  gap: var(--sp-3);
  padding: var(--sp-4) var(--sp-4);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}

.card-food-item__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  min-width: 0;
}

.card-food-item__description {
  /* 2-line clamp */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-food-item__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--sp-2);
}

.card-food-item__image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);  /* 10px */
  object-fit: cover;
  flex-shrink: 0;
}
```

---

## 🏠 HOME SCREEN LAYOUT — Glovo-style

Glovo's home screen is intentionally minimal: search bar + category bubbles. No clutter.

```
┌──────────────────────────────────┐
│  📍 Delivering to: [Address] ▾  │  ← Header (sticky, 56px)
├──────────────────────────────────┤
│  [🔍 Search restaurants...]      │  ← Search bar (48px)
├──────────────────────────────────┤
│  🍔  🍕  🥗  🛒  💊  🍜  more  │  ← Category bubbles (horizontal scroll)
├──────────────────────────────────┤
│  ─── BANNER / PROMO ─────────── │  ← Hero card (optional, 160px)
├──────────────────────────────────┤
│  Popular Near You  [See all]     │  ← Section header
│  [card] [card]                   │  ← 2-col grid
│  [card] [card]                   │
├──────────────────────────────────┤
│  Order Again       [See all]     │  ← Section header
│  → horizontal scroll row         │
└──────────────────────────────────┘
```

### Page wrapper

```css
.page {
  padding-bottom: calc(var(--sp-16) + env(safe-area-inset-bottom));
  /* 64px + iPhone bottom safe area — clears bottom nav */
}

.page-content {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-6);  /* 24px between all sections */
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);  /* 12px between header and content */
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--sp-4);  /* Always 16px horizontal */
}

.section-header__see-all {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-primary);
  cursor: pointer;
}
```

---

## 🔍 SEARCH BAR

```css
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  height: 48px;
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);    /* 20px — Glovo-style fully rounded */
  padding: 0 var(--sp-4);
  margin: 0 var(--sp-4);             /* 16px page padding */
  cursor: text;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-primary);
}

.search-bar input::placeholder {
  color: var(--color-text-tertiary);
}
```

---

## 🫧 CATEGORY BUBBLES — Glovo Signature Component

Horizontal scrollable row of circular icon + label. This is what makes Glovo feel like Glovo.

```
  🍔     🍕     🥗     🛒     💊
Burgers  Pizza  Salads Grocer Pharma
```

```css
.category-row {
  display: flex;
  gap: var(--sp-4);           /* 16px between bubbles */
  padding: 0 var(--sp-4);     /* 16px from edges */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.category-row::-webkit-scrollbar {
  display: none;
}

.category-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);           /* 4px between icon and label */
  flex-shrink: 0;
  scroll-snap-align: start;
  cursor: pointer;
}

.category-bubble__icon-wrap {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-circle);  /* 50% */
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.category-bubble:active .category-bubble__icon-wrap {
  transform: scale(0.94);
  background: var(--color-primary-light);
}

.category-bubble.active .category-bubble__icon-wrap {
  background: var(--color-primary-light);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.category-bubble__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.category-bubble.active .category-bubble__label {
  color: var(--color-primary);
}
```

---

## 🔘 BUTTONS

### Primary Button

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 52px;
  padding: 0 var(--sp-6);           /* 24px horizontal */
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
  border-radius: var(--radius-sm);   /* 10px */
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.1px;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  width: 100%;                       /* Full width by default in PWA */
}

.btn-primary:active {
  background: var(--color-primary-dark);
  transform: scale(0.98);
}

.btn-primary:disabled {
  background: var(--color-border);
  color: var(--color-text-tertiary);
  cursor: not-allowed;
  transform: none;
}
```

### Secondary Button (Outline)

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-2);
  height: 48px;
  padding: 0 var(--sp-5);
  background: transparent;
  color: var(--color-primary);
  border: 1.5px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.btn-secondary:active {
  background: var(--color-primary-light);
}
```

### Icon Add Button (Food item cards)

```css
.btn-add {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-circle);
  background: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.btn-add:active {
  background: var(--color-primary-dark);
  transform: scale(0.90);
}
```

### Pill / Filter Chip

```css
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  height: 34px;
  padding: 0 var(--sp-3);           /* 12px horizontal */
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.chip.active {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 600;
}
```

---

## 🏷️ BADGES & STATUS PILLS

```css
/* Base badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--sp-1);
  padding: 3px var(--sp-2);         /* 3px top/bottom, 8px sides */
  border-radius: var(--radius-xs);   /* 6px */
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
}

.badge-success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.badge-warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.badge-error {
  background: var(--color-error-light);
  color: var(--color-error);
}

.badge-info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.badge-promo {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-dark {
  background: rgba(0,0,0,0.65);
  color: #FFFFFF;
}
/* Use badge-dark on image overlays (rating on card image) */
```

---

## 📱 BOTTOM NAVIGATION BAR

Glovo uses 4 tabs: Home, Search, Orders, Profile. Simple, never more than 5.

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: calc(60px + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: flex-start;
  justify-content: space-around;
  padding-top: var(--sp-2);
  z-index: var(--z-sticky);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  height: 48px;
  justify-content: center;
  cursor: pointer;
  /* Minimum tap target 44px satisfied by height + width */
}

.bottom-nav__icon {
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.bottom-nav__label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.bottom-nav__item.active .bottom-nav__icon,
.bottom-nav__item.active .bottom-nav__label {
  color: var(--color-primary);
}

.bottom-nav__item.active .bottom-nav__label {
  font-weight: 700;
}
```

```jsx
// JSX Example
import { House, MagnifyingGlass, ClipboardText, User } from '@phosphor-icons/react';

function BottomNav({ active }) {
  const tabs = [
    { id: 'home',    Icon: House,          label: 'Home'    },
    { id: 'search',  Icon: MagnifyingGlass, label: 'Search'  },
    { id: 'orders',  Icon: ClipboardText,  label: 'Orders'  },
    { id: 'profile', Icon: User,           label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map(({ id, Icon, label }) => (
        <div key={id} className={`bottom-nav__item ${active === id ? 'active' : ''}`}>
          <Icon
            size={24}
            weight={active === id ? 'fill' : 'regular'}
            className="bottom-nav__icon"
          />
          <span className="bottom-nav__label">{label}</span>
        </div>
      ))}
    </nav>
  );
}
```

---

## 📌 TOP HEADER

```css
.top-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 var(--sp-4);
  gap: var(--sp-3);
}

.top-header__location {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.top-header__location-text {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-header__action {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-circle);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.top-header__action:active {
  background: var(--color-bg);
}
```

---

## 📋 INPUT FIELDS

```css
.input-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
}

.input-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.input-field {
  height: 52px;
  padding: 0 var(--sp-4);
  background: var(--color-surface);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);   /* 10px */
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text-primary);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-field::placeholder {
  color: var(--color-text-tertiary);
}

.input-field:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input-field.error {
  border-color: var(--color-error);
  box-shadow: 0 0 0 3px var(--color-error-light);
}

.input-field:disabled {
  background: var(--color-bg);
  color: var(--color-text-tertiary);
}

.input-error-msg {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-error);
}
```

---

## 🧾 ORDER SUMMARY ROW

```css
.order-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--sp-3) var(--sp-4);
  border-bottom: 1px solid var(--color-border);
}

.order-row__left {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}

.order-row__qty {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-circle);
  background: var(--color-primary);
  color: var(--color-primary-text);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.order-row__price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}
```

---

## 💬 TOAST NOTIFICATIONS

```css
.toast {
  position: fixed;
  bottom: calc(72px + env(safe-area-inset-bottom)); /* above bottom nav */
  left: var(--sp-4);
  right: var(--sp-4);
  z-index: var(--z-toast);
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-3) var(--sp-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  font-size: 14px;
  font-weight: 500;
  animation: toast-in 200ms ease forwards;
}

.toast-success { background: #111111; color: #FFFFFF; }
.toast-error   { background: var(--color-error); color: #FFFFFF; }
.toast-info    { background: #111111; color: #FFFFFF; }

@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## ⬆️ BOTTOM SHEET / MODAL

Used for item customisation, filters, address pickers.

```css
.sheet-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: var(--z-overlay);
  animation: fade-in var(--transition-base) ease forwards;
}

.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-modal);
  background: var(--color-surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;  /* 28px top corners */
  padding-bottom: env(safe-area-inset-bottom);
  max-height: 90vh;
  overflow-y: auto;
  animation: sheet-up var(--transition-base) ease forwards;
}

.sheet__handle {
  width: 36px;
  height: 4px;
  border-radius: var(--radius-pill);
  background: var(--color-border-strong);
  margin: var(--sp-3) auto var(--sp-4);
}

.sheet__header {
  padding: 0 var(--sp-4) var(--sp-4);
  border-bottom: 1px solid var(--color-border);
}

.sheet__body {
  padding: var(--sp-4);
}

@keyframes sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

---

## ⏳ SKELETON LOADING — Use Instead of Spinners

Skeletons feel instant. Spinners feel slow. Always use skeletons for card lists.

```css
@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-border) 25%,
    #f0f0f0 50%,
    var(--color-border) 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: var(--radius-xs);
}

/* Usage */
.skeleton-card-image {
  width: 100%;
  height: 130px;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.skeleton-text-h3  { height: 16px; width: 70%; margin-bottom: var(--sp-1); }
.skeleton-text-sm  { height: 13px; width: 50%; }
.skeleton-text-xs  { height: 11px; width: 40%; }
```

---

## 🛒 FLOATING CART BUTTON

Always visible on menu page. Never hidden.

```css
.cart-fab {
  position: fixed;
  bottom: calc(72px + env(safe-area-inset-bottom) + var(--sp-3));
  left: var(--sp-4);
  right: var(--sp-4);
  z-index: var(--z-raised);

  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 var(--sp-4);
  background: var(--color-primary);
  color: var(--color-primary-text);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.cart-fab:active {
  transform: scale(0.98);
  box-shadow: var(--shadow-md);
}

.cart-fab__qty {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-circle);
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
}

.cart-fab__label {
  font-size: 15px;
  font-weight: 700;
}

.cart-fab__price {
  font-size: 15px;
  font-weight: 700;
}
```

---

## 🚦 ORDER STATUS STEPPER

```css
.status-stepper {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--sp-4);
  gap: 0;
}

.status-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-1);
  flex: 1;
}

.status-step__dot {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-circle);
  border: 2px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.status-step.complete .status-step__dot {
  background: var(--color-success);
  border-color: var(--color-success);
}

.status-step.active .status-step__dot {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.status-step__label {
  font-size: 10px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-align: center;
}

.status-step.complete .status-step__label,
.status-step.active .status-step__label {
  color: var(--color-text-primary);
}

/* Connecting line between dots */
.status-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 13px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 2px;
  background: var(--color-border);
}

.status-step.complete:not(:last-child)::after {
  background: var(--color-success);
}
```

---

## ✅ ACCESSIBILITY & TAP TARGETS

```css
/* Every interactive element must meet 44×44px minimum */
.tap-target {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Use this wrapper for small icon buttons that are visually small but need large tap area */
.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-circle);
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.icon-btn:active {
  background: var(--color-bg);
}
```

---

## 🚫 WHAT CURSOR MUST NEVER DO

These are the exact mistakes the current UI makes. Do not reproduce them.

| ❌ Never | ✅ Instead |
|---|---|
| `font-size: 13px` inline on a component | Use `t-body-sm` class |
| `border-radius: 8px` on a card | Use `var(--radius-md)` = 14px |
| `border-radius: 50px` on a pill | Use `var(--radius-pill)` = 999px |
| `padding: 10px 14px` | Use `var(--sp-3) var(--sp-4)` |
| `<Icon size={20} />` on nav bar | Nav icons are always `size={24}` |
| `<Icon size={24} />` inline with text | Inline icons are always `size={14}` |
| `margin-top: 15px` | Use `var(--sp-4)` = 16px |
| `color: #666` hardcoded | Use `var(--color-text-secondary)` |
| `box-shadow: 0 2px 4px #00000020` | Use `var(--shadow-xs)` |
| Mixed icon libraries | Phosphor only |
| `<span style="color:green">Open</span>` | Use `.badge-success` |
| `overflow: hidden` on card without radius | Always pair with border-radius token |
| `font-weight: bold` | Use `700` numeric value |
| Custom spinner on loading | Always use `.skeleton` pattern |

---

## 📋 QUICK REFERENCE CHEAT SHEET

```
FONT:         Plus Jakarta Sans — 400 / 500 / 600 / 700 / 800

FONT SIZES:   30 / 22 / 17 / 15 / 14 / 13 / 12 / 11 / 10px

SPACING:      4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64px

RADII:        6 / 10 / 14 / 20 / 28 / 999px / 50%

ICONS:        14 / 18 / 22 / 24(nav) / 28 / 40px  — Phosphor only

SHADOWS:      xs / sm / md / lg / xl

CARD IMAGE:   Grid card 130px tall · Horizontal card 72×72px · Food item 80×80px

HEADER:       56px sticky

SEARCH BAR:   48px height, radius-lg (20px), 16px margin

BOTTOM NAV:   60px + safe area, 24px icons, 4 tabs max

CART FAB:     56px height, radius-sm (10px), above bottom nav

MIN TAP:      44×44px on every interactive element
```

---

*This document is the law. When in doubt, refer back here. Every deviation creates the inconsistency we are fixing.*