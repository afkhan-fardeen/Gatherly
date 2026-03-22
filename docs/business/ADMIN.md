# Gatherly admin portal

**Audience:** operations, engineering, support.

The admin UI lives in [`apps/admin`](../../apps/admin). It talks to the same API as consumer/vendor apps via `NEXT_PUBLIC_API_URL` (e.g. `http://localhost:4000`).

## Environment

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | `apps/admin` | Base URL for REST calls (`/api/admin/*`, `/api/auth/login`). |
| `ADMIN_URL` | `packages/api` (CORS) | Origin allowed for browser requests from the admin app (e.g. `http://localhost:3003`). Set in production to the deployed admin URL. |
| Database | `packages/api` | Same Postgres as the rest of the platform; Prisma migrations include `admin_audit_logs`, `payout_batches`, `payout_lines`. |
| `DATABASE_URL_NEON` | `packages/api` (optional) | Neon connection string for **cloud-only** migrations. Copy from the Neon project dashboard (pooled URL is fine for `migrate deploy`). |

### Applying migrations

From the repo root:

| Command | When |
|---------|------|
| `npm run db:up` then `npm run db:migrate:deploy` | Local Docker Postgres. |
| `npm run db:migrate:neon` | **Neon only** — requires `DATABASE_URL_NEON` in `packages/api/.env`. |
| `SKIP_LOCAL_MIGRATE=1 npm run db:migrate:all` | Neon only when local DB is down (Unix). On Windows PowerShell: `$env:SKIP_LOCAL_MIGRATE="1"; npm run db:migrate:all`. |

After deploying API code, run the same migration command against the database your production API uses (`DATABASE_URL` on the host should match that DB).

## Authentication

- Admins are users with JWT claim `role: "admin"` (see [`USER_ROLES`](../../packages/shared/src/constants.ts)).
- Login uses `POST /api/auth/login` with admin credentials; store the returned token (same pattern as vendor/consumer).
- All `/api/admin/*` routes require a valid Bearer token and pass [`adminAuth`](../../packages/api/src/middleware/adminAuth.ts) (403 if not admin or inactive user).
- Rate limiting: [`adminRateLimiter`](../../packages/api/src/middleware/authRateLimit.ts) on the admin router.

## Capabilities

| Area | Endpoints (examples) | Notes |
|------|----------------------|--------|
| Session | `GET /api/admin/me` | Confirms admin session. |
| Dashboard | `GET /api/admin/dashboard/stats` | Aggregate KPIs (read-only). |
| Bookings | `GET /api/admin/bookings`, `GET .../:id` | Filters: status, payment, dates. |
| Refund | `POST /api/admin/bookings/:id/refund` | Body `{ reason }`. Idempotent if already refunded. Writes `AdminAuditLog`, updates `paymentStatus`, optional `refundedAt` / `refundReason`; notifies consumer and vendor. |
| Status override | `POST /api/admin/bookings/:id/status` | Break-glass booking status change; audited. |
| Payouts | `GET /api/admin/payouts/eligible`, `POST .../batches`, `PATCH .../batches/:id/mark-paid` | Builds batches from eligible **paid, completed (or delivered per policy), not refunded** bookings without an existing `PayoutLine`. Mark-paid sets batch + line status; **no bank API** — record off-platform transfer. |
| Vendors | `GET /api/admin/vendors`, `PATCH .../:id` | Approve / reject / suspend. New vendor signups default to `pending` until approved ([`auth` register flow](../../packages/api/src/routes/auth.ts)). |
| Users | `GET /api/admin/users`, `PATCH .../:id` | Suspend or activate (`User.status`). |
| Audit | `GET /api/admin/audit-log` | `AdminAuditLog` entries for sensitive actions. |
| Export | `GET /api/admin/export/bookings.csv` | CSV for finance/reporting. |

## Runbooks

### Refund a booking (after coordination)

1. Open admin **Bookings**, locate the booking (reference, consumer, vendor).
2. Open detail → **Refund** → enter reason → confirm.
3. Verify `paymentStatus` is **refunded** on consumer and vendor booking views; consumer and vendor receive in-app notifications.
4. For vendor cancel-after-pay scenarios ([BUSINESS_RULES §9](./BUSINESS_RULES.md)), automatic refund is **not** implemented — admin refund is the supported path until automation exists.

### Payout batch (manual bank run)

1. **Payouts → Eligible** — review bookings listed (paid, eligible status, not already in a line).
2. Select rows → **Create batch** (notes optional).
3. Perform the actual bank transfer outside Gatherly.
4. **Mark batch paid** with a reference and date; vendors see payout status on **vendor booking detail** (`payoutLines` + batch).

### Approve a pending vendor

1. **Vendors** → filter pending → open vendor → set status **approved** (or rejected / suspended).

### Suspend a user

1. **Users** → search → **PATCH** to suspended; login/API behavior follows `User.status` checks in auth middleware.

## Security notes

- Treat admin JWTs like production secrets; short TTL and HTTPS in production.
- **2FA for admin accounts** is recommended as a follow-up (not enforced in code v1).
- CORS must include the real admin origin in production (`ADMIN_URL`).

## Related docs

- [BUSINESS_RULES.md](./BUSINESS_RULES.md) — policy source of truth, including §12 implementation summary.
