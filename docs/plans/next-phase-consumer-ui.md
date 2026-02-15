# Next Phase: Consumer UI & Core Flows

**Reference:** [ui.html](../../ui.html) – mobile UI design reference

---

## 1. Design System (from ui.html)

Align consumer app with the ui.html mobile reference. **Light theme only.**

### 1.1 Typography

- **Font:** Manrope (Google Fonts)
- **Weights:** 400, 500, 600, 700, 800
- **Headings:** `font-800`, `tracking-tight` for titles

### 1.2 Colors

| Token | Value | Use |
|-------|-------|-----|
| `primary` | `#2b7cee` | CTAs, active nav, links |
| `confirmed` | `#34C759` | RSVP confirmed, success |
| `pending` | `#FF9500` | RSVP pending |
| `declined` | `#8E8E93` | RSVP declined |
| `background` | `#ffffff` / `slate-50` | Page background |

### 1.3 Layout

- **Max width:** `max-w-[430px]` – mobile-first phone width
- **Border radius:** `rounded-2xl` (1rem), `rounded-[2rem]` for cards, `rounded-full` for pills
- **Blur header:** `backdrop-filter: blur(25px)` for sticky headers
- **Bottom nav:** Fixed, 4 items, `pb-8` for safe area

### 1.4 Icons

- **Material Symbols Outlined** (Google Fonts)
- Use `material-symbols-outlined` class
- Size: `text-[26px]` for nav, `text-xl` for actions

### 1.5 Bottom Navigation

From ui.html – 4 items:

| Icon | Label | Route |
|------|-------|-------|
| `calendar_today` | Events | `/events` |
| `group` | Guests | `/events/[id]/guests` (or context) |
| `restaurant` | Catering | `/vendors` |
| `person` | Profile | `/profile` |

---

## 2. Pages to Build (Priority Order)

### 2.1 Design System & Layout

- [ ] Add Manrope font, Material Symbols
- [ ] Update Tailwind: primary `#2b7cee`, status colors
- [ ] Create `BottomNav` component
- [ ] Create `MobileLayout` wrapper (max-w-[430px], centered)
- [ ] Apply to dashboard, auth pages

### 2.2 Events List

- [ ] **Route:** `/events`
- [ ] List user's events (draft, active, completed)
- [ ] Card per event: name, date, guest count, status
- [ ] "Create Event" FAB or CTA
- [ ] **API:** `GET /api/events` (needs backend)

### 2.3 Guest Management (ui.html reference)

- [ ] **Route:** `/events/[eventId]/guests`
- [ ] Header: event name, circular progress (confirmed/total)
- [ ] Search bar
- [ ] "Add Guest" button (primary)
- [ ] Guest list: avatar (initials), name, phone, status badge (Confirmed/Pending/Declined)
- [ ] Plus-one badge where applicable
- [ ] "View All" if > N guests
- [ ] **API:** `GET/POST /api/events/:id/guests`, `PUT/DELETE /api/events/:id/guests/:guestId`

### 2.4 Create Event

- [ ] **Route:** `/events/create`
- [ ] Multi-step form: Basic → Location → Guests & Budget → Special Requirements
- [ ] **API:** `POST /api/events`

### 2.5 Vendor Browse

- [ ] **Route:** `/vendors`
- [ ] Search, filters (cuisine, price, rating)
- [ ] Vendor cards: image, name, cuisine, rating, starting price
- [ ] **API:** `GET /api/vendors` (with query params)

### 2.6 Vendor Profile

- [ ] **Route:** `/vendor/[id]`
- [ ] Tabs: About, Packages, Gallery, Reviews
- [ ] **API:** `GET /api/vendors/:id`, `GET /api/vendors/:id/packages`

### 2.7 My Bookings

- [ ] **Route:** `/bookings`
- [ ] Tabs: Active, Past, Cancelled
- [ ] **API:** `GET /api/bookings`

---

## 3. Backend API Endpoints Needed

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/events` | List user's events |
| POST | `/api/events` | Create event |
| GET | `/api/events/:id` | Get event |
| PUT | `/api/events/:id` | Update event |
| GET | `/api/events/:id/guests` | List guests |
| POST | `/api/events/:id/guests` | Add guest |
| PUT | `/api/events/:id/guests/:guestId` | Update guest |
| DELETE | `/api/events/:id/guests/:guestId` | Remove guest |
| GET | `/api/vendors` | List vendors (filters) |
| GET | `/api/vendors/:id` | Vendor details |
| GET | `/api/vendors/:id/packages` | Vendor packages |
| GET | `/api/bookings` | List user's bookings |

---

## 4. Suggested Start Order

1. **Design system** – Manrope, colors, BottomNav, MobileLayout
2. **API: events + guests** – CRUD for events and guests
3. **Events list page** – `/events`
4. **Guest management page** – `/events/[id]/guests` (ui.html reference)
5. **Create event flow** – `/events/create`
6. **API: vendors** – list, detail, packages
7. **Vendor browse + profile** – `/vendors`, `/vendor/[id]`
8. **Bookings** – `/bookings` + API

---

## 5. ui.html Components to Replicate

- **Header:** Sticky, blur, title + subtitle, notification icon
- **Stats card:** Circular progress (e.g. 85/100 guests), progress bar, helper text
- **Search + action:** Search input with icon, primary "Add" button
- **Guest row:** Avatar (initials), status dot, name, phone, status badge, more menu
- **Bottom nav:** 4 items, active state, uppercase labels
