# Gatherly

Event-planning platform and catering marketplace. Consumers create events, browse vendors, book packages, and pay — all from a mobile-first PWA. Vendors manage packages, accept bookings, and track orders from a desktop dashboard.

**Live URLs**

| App | URL |
|-----|-----|
| Consumer | https://gatherly-consumer.vercel.app |
| Vendor | https://gatherly-vendor.vercel.app |
| API | https://gatherly-skl4.onrender.com |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Consumer app | Next.js 14 (App Router), React 18, Tailwind CSS, PWA |
| Vendor app | Next.js 14 (App Router), React 18, Tailwind CSS |
| API | Express.js, Prisma ORM, PostgreSQL |
| Shared | TypeScript, Zod schemas |
| Auth | JWT (access tokens stored in localStorage) |
| Image uploads | Cloudinary |
| Icons | Phosphor Icons |
| Fonts | Poppins (body), Lora (serif headings), Bright (logo) |

---

## Quick start

### Prerequisites

- Node.js 18+ (see `.nvmrc`)
- Docker (for local PostgreSQL)
- npm (workspaces are configured for npm, not pnpm/yarn)

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
npm run db:up
```

Runs a `postgres:16-alpine` container on port 5432 (user `gatherly` / password `gatherly_dev`).

### 3. Configure environment

```bash
cp .env.example .env
```

Defaults work with the Docker Postgres. See [Environment variables](#environment-variables) for details.

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed dev data

```bash
npm run db:seed
```

Creates test accounts:

| Email | Password | Role |
|-------|----------|------|
| `consumer@gatherly.com` | `password123` | Consumer |
| `sarah@gatherly.com` | `password123` | Consumer |
| `ahmed@gatherly.com` | `password123` | Consumer |
| `admin@gatherly.com` | `password123` | Admin |

Plus 5 catering vendors, each with 2 packages, menu items, sample events, guests, and a booking.

### 6. Start development

Run these in separate terminals:

```bash
npm run dev:api        # API on http://localhost:3001
npm run dev:consumer   # Consumer on http://localhost:3000
npm run dev:vendor     # Vendor on http://localhost:3002
```

### Mobile testing (consumer PWA)

1. Find your local IP: `ipconfig getifaddr en0` (macOS)
2. Set in `apps/consumer/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://<your-ip>:3001
   ```
3. Add to root `.env`:
   ```
   CONSUMER_URL_MOBILE="http://<your-ip>:3000"
   ```
4. Restart API and consumer, then open `http://<your-ip>:3000` on your device

---

## Project structure

```
gatherly-v1/
├── apps/
│   ├── consumer/              # Consumer PWA (Next.js)
│   └── vendor/                # Vendor dashboard (Next.js)
├── packages/
│   ├── api/                   # Backend API (Express + Prisma)
│   └── shared/                # Shared types, Zod schemas, constants
├── docs/
│   ├── consumer/              # Consumer app deep-dive, QA report
│   ├── deployment/            # Render/Vercel guides, env templates
│   ├── plans/                 # Feature plans and redesign specs
│   └── references/            # UI reference files
├── assets/                    # Branding (app logo)
├── scripts/                   # test-api.sh
├── .env.example               # All env vars with docs
├── docker-compose.yml         # Local Postgres
└── package.json               # Workspace root
```

---

## Workspace scripts

All scripts run from the repo root via `npm run <script>`.

| Script | What it does |
|--------|-------------|
| `dev:api` | Start API dev server (port 3001) |
| `dev:consumer` | Start consumer app (port 3000) |
| `dev:vendor` | Start vendor app (port 3002) |
| `build` | Build all packages in order: shared → api → consumer → vendor |
| `db:up` | Start Postgres container |
| `db:down` | Stop Postgres container |
| `db:migrate` | Run Prisma migrations |
| `db:seed` | Seed database with test data |
| `db:studio` | Open Prisma Studio (database GUI) |
| `test:api` | Run API smoke tests against live or local URL |

---

## Architecture overview

```
┌──────────────┐    ┌──────────────┐
│   Consumer   │    │    Vendor    │
│   (Next.js)  │    │   (Next.js)  │
│  port 3000   │    │  port 3002   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       │  NEXT_PUBLIC_API_URL
       │                   │
       ▼                   ▼
┌─────────────────────────────────┐
│           API (Express)         │
│           port 3001             │
│                                 │
│  Auth (JWT) │ CORS │ Multer    │
│  Routes: auth, events, bookings │
│  vendors, packages, payments    │
│  notifications, upload, spotlight│
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│     PostgreSQL (Prisma ORM)     │
│         port 5432               │
└─────────────────────────────────┘
               │
         ┌─────┴─────┐
         │ Cloudinary │  (image uploads)
         └───────────┘
```

---

## Database schema

The full Prisma schema is at `packages/api/prisma/schema.prisma`.

### Models

| Model | Purpose | Key fields |
|-------|---------|-----------|
| **User** | All users (consumer, vendor, admin) | email, passwordHash, name, role, phone, profilePictureUrl |
| **Vendor** | Vendor profile (1:1 with User) | businessName, businessType, cuisineTypes[], serviceAreas[], ratingAvg, operatingHours, availability |
| **Package** | Vendor service packages | name, basePrice, priceType, minGuests, maxGuests, dietaryTags[], isSpotlight |
| **PackageItem** | Menu items within a package | name, description, category, imageUrl, dietaryTags[], allergenWarnings[] |
| **Event** | Consumer events | name, eventType, date, guestCount, location, status (draft/in_progress/completed/cancelled) |
| **Guest** | Event guest list | name, email, rsvpStatus, dietaryPreferences[] |
| **Booking** | Links consumer ↔ vendor ↔ event ↔ package | bookingReference, status, paymentStatus, totalAmount, guestCount |
| **Review** | Post-delivery reviews (1:1 with Booking) | ratingOverall, ratingFood, ratingService, ratingValue, reviewText |
| **Notification** | In-app notifications | type, title, message, isRead |
| **PaymentMethod** | Saved cards (dummy for dev) | last4, brand |
| **SpotlightPlacement** | Paid spotlight placements | packageId, durationDays, amountBhd, startDate, endDate |

### Key relations

- User → Vendor (1:1), User → Event[] (1:N), User → Booking[] (1:N)
- Event → Booking[] (1:N), Vendor → Package[] (1:N), Package → PackageItem[] (1:N)
- Booking → User, Vendor, Event, Package (many:1 each)
- Booking → Review (1:1)

---

## API reference

Base URL: `http://localhost:3001` (dev) or `https://gatherly-skl4.onrender.com` (prod).

All authenticated routes require `Authorization: Bearer <token>` header.

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register. Body: `{ email, password, name, role?, businessName? }` |
| POST | `/login` | — | Login. Returns `{ user, token }` |
| GET | `/me` | Yes | Current user profile |
| PATCH | `/me` | Yes | Update name, phone, profilePictureUrl |

### Events (`/api/events`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List user's events |
| POST | `/` | Yes | Create event |
| GET | `/:id` | Yes | Event detail with guests |
| PUT | `/:id` | Yes | Update event |
| DELETE | `/:id` | Yes | Delete event (cascades bookings + reviews) |
| GET | `/:eventId/guests` | Yes | List guests |
| POST | `/:eventId/guests` | Yes | Add guest |
| PUT | `/:eventId/guests/:guestId` | Yes | Update guest |
| DELETE | `/:eventId/guests/:guestId` | Yes | Delete guest |

### Bookings (`/api/bookings`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Yes | List bookings. Query: `status`, `paymentStatus`, `eventId` |
| POST | `/` | Yes | Create booking. Body: `{ eventId, vendorId, packageId, guestCount, specialRequirements? }` |
| GET | `/:id` | Yes | Booking detail |
| PATCH | `/:id/pay` | Yes | Pay single booking (requires all event bookings accepted) |
| POST | `/pay-event` | Yes | Pay all confirmed bookings for an event |
| POST | `/:id/review` | Yes | Submit review for delivered/completed booking |

### Vendors — public (`/api/vendors`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List vendors. Query: `search`, `cuisine`, `businessType` |
| GET | `/:id` | — | Vendor detail |
| GET | `/:id/packages` | — | Vendor packages with menu items |
| GET | `/:id/reviews` | — | Vendor reviews (paginated) |

### Vendor dashboard (`/api/vendor`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/me` | Vendor | Vendor profile |
| PATCH | `/me` | Vendor | Update business info |
| GET | `/availability` | Vendor | Get blocked dates |
| PUT | `/availability` | Vendor | Set blocked dates |
| GET | `/packages` | Vendor | List packages |
| POST | `/packages` | Vendor | Create package |
| PATCH | `/packages/:id` | Vendor | Update package |
| DELETE | `/packages/:id` | Vendor | Deactivate package |
| POST | `/packages/:id/items` | Vendor | Add menu item |
| PATCH | `/packages/:id/items/:itemId` | Vendor | Update menu item |
| DELETE | `/packages/:id/items/:itemId` | Vendor | Delete menu item |
| GET | `/bookings` | Vendor | List bookings. Query: `status` |
| GET | `/bookings/:id` | Vendor | Booking detail |
| PATCH | `/bookings/:id/status` | Vendor | Update status (confirmed/cancelled/in_preparation/delivered/completed) |
| GET | `/reviews` | Vendor | Paginated reviews |
| GET | `/search` | Vendor | Search bookings and packages |

### Spotlight (`/api/vendor/spotlight` and `/api/spotlight`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/spotlight` | — | Active spotlight packages (public) |
| GET | `/api/vendor/spotlight/active` | Vendor | Vendor's spotlight placements |
| GET | `/api/vendor/spotlight/pricing` | Vendor | Pricing tiers |
| POST | `/api/vendor/spotlight/purchase` | Vendor | Purchase spotlight |

### Other endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Health check + DB connectivity |
| POST | `/api/upload/image` | Yes | Upload image to Cloudinary (max 5MB) |
| GET | `/api/payment-methods` | Yes | List saved cards |
| POST | `/api/payment-methods` | Yes | Add card (dummy) |
| DELETE | `/api/payment-methods/:id` | Yes | Remove card |
| GET | `/api/notifications` | Yes | List notifications (cursor-paginated) |
| GET | `/api/notifications/unread-count` | Yes | Unread count |
| PATCH | `/api/notifications/:id/read` | Yes | Mark read |
| PATCH | `/api/notifications/read-all` | Yes | Mark all read |

---

## Booking & payment flow

This is the core business logic of the platform:

```
Consumer creates event
       │
       ▼
Consumer browses vendors → selects package → books
       │
       ▼
Booking created (status: "pending", paymentStatus: "unpaid")
       │
       ▼
Vendor sees booking notification
       │
       ├─ Vendor declines → status: "cancelled"
       │
       └─ Vendor accepts → status: "confirmed"
              │
              ▼
       ALL event bookings must be "confirmed"
       before consumer can pay (no partial payments)
              │
              ▼
       Consumer pays → paymentStatus: "paid"
       (payment goes to Gatherly, Gatherly pays vendors simultaneously)
              │
              ▼
       Vendor notified → can now start preparation
       status: "in_preparation" (vendor triggers this)
              │
              ▼
       Vendor marks "delivered" → status: "delivered"
              │
              ▼
       Consumer can leave review
       Vendor marks "completed" → status: "completed"
```

**Key rules:**
- Payment is blocked until ALL vendors for an event have accepted
- Vendors cannot start preparation until the consumer has paid
- Both API-level and UI-level enforcement exist for these rules

---

## Consumer app (PWA)

**Port:** 3000 | **Framework:** Next.js 14 App Router

### User flow

```
Welcome → Get Started → Register/Login → Dashboard
   │
   ├── Create Event → Edit → Add Services → Browse Catering → Select Vendor
   │                                            │
   │                                    View Package → Book Package
   │                                            │
   │                                     Event Cart → Pay
   │
   ├── My Events (Planning / Past / Draft tabs)
   │       └── Event Detail (accordion layout)
   │              ├── Event details section
   │              ├── Services section (catering bookings + status)
   │              └── CTA: Add services / Waiting / View cart & pay
   │
   ├── My Bookings (grouped by event, accordion layout)
   │       └── Booking Detail → Order progress → Pay / Review
   │
   ├── Profile → Edit / Payment Methods / Payment History
   │
   ├── Notifications
   │
   └── Discover → Catering (search, filter by cuisine)
```

### PWA features

- Installable (Add to Home Screen) on Chrome, Edge, iOS Safari
- Service worker for offline caching (production only)
- Pull-to-refresh on lists
- Splash screen on launch

### Key design patterns

- **Event-centric UI:** The event detail page is the hub — services, statuses, and payments are tracked there
- **Accordion pattern:** Used on event detail, cart, and bookings pages for progressive disclosure
- **Auth:** JWT token in `localStorage`, validated via `/api/auth/me` on app load
- **Drafts:** Event creation auto-saves to `localStorage`; booking drafts use `sessionStorage`
- **Design tokens:** Centralized in `lib/events-ui.ts` — colors, typography, spacing

### Route reference

| Route | Description |
|-------|-------------|
| `/` | Redirect → dashboard (logged in) or welcome |
| `/welcome` | Welcome screen with install prompt |
| `/get-started` | Sign-up options |
| `/login`, `/register` | Auth forms |
| `/dashboard` | Home — upcoming events, featured vendors, quick actions |
| `/events` | Event list with Planning/Past/Draft tabs |
| `/events/create` | Create event form (auto-saves as draft) |
| `/events/[eventId]` | Event detail with accordion sections |
| `/events/[eventId]/edit` | Edit event |
| `/events/[eventId]/services` | Browse service categories for this event |
| `/events/[eventId]/cart` | Event cart — review and pay all bookings |
| `/bookings` | All bookings grouped by event |
| `/bookings/[id]` | Booking detail with order progress |
| `/services` | Service category discovery |
| `/services/catering` | Browse catering vendors |
| `/vendor/[id]` | Vendor profile and packages |
| `/vendor/[id]/package/[pkgId]` | Package detail with menu |
| `/vendor/[id]/book` | Request booking form |
| `/profile` | Profile hub — stats, quick access, settings |
| `/profile/edit` | Edit name, phone, photo |
| `/profile/payment-methods` | Manage saved cards |
| `/profile/payment-history` | Past transactions |
| `/notifications` | Notification list |

For detailed component and PWA docs, see `docs/consumer/DOCS.md`.

---

## Vendor app (dashboard)

**Port:** 3002 | **Framework:** Next.js 14 App Router

Desktop-focused dashboard. Mobile shows a "use desktop to manage" message.

### Features

| Area | What vendors can do |
|------|-------------------|
| **Dashboard** | View metrics (bookings, revenue, rating), recent bookings |
| **Packages** | Create/edit/deactivate packages, manage menu items with images |
| **Bookings** | Accept/decline requests, update status through the workflow |
| **Availability** | Block dates on a calendar |
| **Profile** | Edit business info, hours, logo, featured image |
| **Spotlight** | Pay to feature packages on consumer homepage |
| **Reviews** | View ratings and review text |
| **Notifications** | Booking requests, payments, status updates |

### Booking status actions

| Current status | Vendor actions |
|---------------|---------------|
| Pending | Accept (→ confirmed) or Decline (→ cancelled) |
| Confirmed | Start preparation (→ in_preparation) — **only after consumer has paid** |
| In preparation | Mark delivered (→ delivered) |
| Delivered | Complete & close (→ completed) |

### Auth guard

The `(dashboard)` route group layout checks `localStorage` for a valid token with `role === "vendor"`. Unauthenticated users are redirected to `/login`.

---

## Shared package (`@gatherly/shared`)

Located at `packages/shared/`. Imported by both the API and frontend apps.

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `USER_ROLES` | Constant | `"consumer"`, `"vendor"`, `"admin"` |
| `BOOKING_STATUS` | Constant | `"pending"`, `"confirmed"`, `"in_preparation"`, `"delivered"`, `"completed"`, `"cancelled"` |
| `PAYMENT_STATUS` | Constant | `"unpaid"`, `"paid"`, `"refunded"` |
| `EVENT_TYPES` | Constant | `"birthday"`, `"anniversary"`, `"corporate"`, `"wedding"`, `"engagement"`, `"family_gathering"`, `"other"` |
| `registerSchema` | Zod schema | Registration validation |
| `loginSchema` | Zod schema | Login validation |
| `createEventSchema` | Zod schema | Event creation validation |
| `updateEventSchema` | Zod schema | Event update validation |
| `createGuestSchema` | Zod schema | Guest creation validation |

Build with `npm run build -w @gatherly/shared` before other packages.

---

## Environment variables

Copy `.env.example` to `.env` for local dev. See `docs/deployment/` for production templates.

| Variable | Default (dev) | Required | Used by |
|----------|---------------|----------|---------|
| `DATABASE_URL` | `postgresql://gatherly:gatherly_dev@localhost:5432/gatherly` | Yes | API |
| `JWT_SECRET` | `your-secret-key-change-in-production` | Yes | API |
| `JWT_EXPIRES_IN` | `7d` | No | API |
| `API_PORT` | `3001` | No | API |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Yes | Consumer, Vendor |
| `CONSUMER_URL` | `http://localhost:3000` | Yes | API (CORS) |
| `VENDOR_URL` | `http://localhost:3002` | Yes | API (CORS) |
| `CLOUDINARY_CLOUD_NAME` | — | For uploads | API |
| `CLOUDINARY_API_KEY` | — | For uploads | API |
| `CLOUDINARY_API_SECRET` | — | For uploads | API |

---

## Deployment

| Service | Platform | Config |
|---------|----------|--------|
| API | Render (Web Service) | `docs/deployment/DEPLOYMENT.md`, `docs/deployment/env.render.example` |
| Consumer | Vercel | `docs/deployment/VERCEL_CHECKLIST.md`, `docs/deployment/env.vercel.example` |
| Vendor | Vercel | Same as consumer |
| Database | Neon (serverless Postgres) | Connection string in Render env |

### Build commands

```bash
# Full build (all packages)
npm run build

# Individual
npm run build -w @gatherly/shared
npm run build -w api
npm run build -w consumer
npm run build -w vendor
```

---

## Common tasks

### Add a new API route

1. Create route file in `packages/api/src/routes/`
2. Use `authMiddleware` or `vendorAuth` from `src/middleware/`
3. Register the router in `src/server.ts`
4. If new DB models are needed, update `prisma/schema.prisma` and run `npm run db:migrate -w api`

### Add a new consumer page

1. Create `page.tsx` in `apps/consumer/app/<route>/`
2. Wrap with `<AppLayout>` for the standard shell (sidebar + bottom nav)
3. Use `getToken()` from `lib/session.ts` for auth-gated pages
4. Fetch data from `API_URL` with `Authorization: Bearer ${token}` header

### Add a new vendor page

1. Create `page.tsx` in `apps/vendor/app/(dashboard)/<route>/`
2. The dashboard layout auto-handles auth guard
3. Wrap content in `<VendorLayout>` for the sidebar + header shell

### Modify the database

```bash
# Edit schema
code packages/api/prisma/schema.prisma

# Create migration
npx prisma migrate dev --name describe_change -w api

# Regenerate client
npm run db:generate -w api
```

### Run API smoke tests

```bash
npm run test:api                    # against production
bash scripts/test-api.sh http://localhost:3001  # against local
```

---

## Conventions

- **Styling:** Tailwind CSS utility classes. Primary color: `#6D0D35` (cherry/maroon). Design tokens in `lib/events-ui.ts`.
- **Icons:** Phosphor Icons (`@phosphor-icons/react`). Import specific icons, not the full set.
- **State:** React hooks (`useState`, `useEffect`). No global state library on consumer; zustand is installed but unused.
- **API calls:** Direct `fetch()` with token from `localStorage`. Consumer uses `fetchAuth()` wrapper that auto-redirects on 401.
- **Forms:** Controlled inputs with `useState`. Validation via Zod schemas on API side.
- **Currency:** Bahraini Dinar (BD/BHD). Prices stored as `Decimal` in Prisma, displayed with 3 decimal places.
- **Dates:** Stored as `DateTime` in Prisma. Formatted with `lib/date-utils.ts` helpers.
- **Images:** Uploaded to Cloudinary via `/api/upload/image`. Compressed client-side before upload (`lib/compress-image.ts`, max 1200px, <1MB).

---

## Further reading

| Document | Location |
|----------|----------|
| Design & architecture doc (features, components, design system) | `docs/DESIGN.md` |
| Feature audit & roadmap (what's done, what's broken, pre-payment checklist) | `docs/AUDIT.md` |
| Consumer app deep-dive (PWA, components, hooks) | `docs/consumer/DOCS.md` |
| Consumer QA test report | `docs/consumer/QA_TEST_REPORT.md` |
| Deployment guide | `docs/deployment/DEPLOYMENT.md` |
| Vercel deployment checklist | `docs/deployment/VERCEL_CHECKLIST.md` |
| Event cart redesign plan | `docs/plans/EVENT_CART_REDESIGN_PLAN.md` |
| Prisma schema | `packages/api/prisma/schema.prisma` |
