# Plan Changes Log

Record what changed after each plan iteration. This keeps context for the latest decisions and revisions.

---

## 2026-02-15 – Initial plan setup

**Plan:** [gatherly-mvp-development-plan.md](plans/gatherly-mvp-development-plan.md)

**Changes:**
- Removed timeline/week references from all phases
- Added "Is This the Best Plan?" section with single-app vs 3-app comparison
- Fixed typo: `**.env.example**` → `.env.example`
- Created `docs/plans/` for saved plans
- Created `docs/plan-changes.md` for this changelog

---

## 2026-02-15 – Initial implementation

**Plan:** [gatherly-mvp-development-plan.md](plans/gatherly-mvp-development-plan.md)

**Changes:**
- Created pnpm monorepo with `pnpm-workspace.yaml`
- Added Docker Compose for PostgreSQL 16
- Created `packages/shared` – constants, Zod auth schemas
- Created `packages/api` – Express, Prisma, JWT auth (register, login, me)
- Created `apps/consumer` – Next.js 14 landing, login, register, dashboard
- Prisma schema: users, vendors, packages, package_items, events, guests, bookings, reviews, notifications
- Seed script with admin, vendor, consumer test accounts
- `.env.example` and `packages/api/.env` for local dev

---

## 2026-02-15 – Next phase plan

**Plan:** [next-phase-consumer-ui.md](plans/next-phase-consumer-ui.md)

**Changes:**
- Created next-phase plan for consumer UI and core flows
- Design system from ui.html: Manrope font, primary #2b7cee, status colors (confirmed/pending/declined)
- Bottom nav: Events, Guests, Catering, Profile
- Priority: design system → events API → guest management (ui.html reference) → create event → vendors → bookings

---

## Template for future entries

```markdown
## YYYY-MM-DD – Brief description

**Plan:** [filename](plans/filename.md)

**Changes:**
- What changed
- Why (if relevant)
```
