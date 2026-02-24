# Gatherly

Event planning platform – catering marketplace MVP.

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start PostgreSQL (Docker)

```bash
pnpm db:up
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env if needed (defaults work with Docker)
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Seed dev data (optional)

```bash
pnpm db:seed
```

Creates test accounts:
- `admin@gatherly.com` / `password123`
- `vendor@gatherly.com` / `password123`
- `consumer@gatherly.com` / `password123`

### 6. Start development

**API only:**
```bash
pnpm dev:api
```

**Consumer app:**
```bash
pnpm dev:consumer
```

**Both** (in separate terminals):
```bash
# Terminal 1
pnpm dev:api

# Terminal 2
pnpm dev:consumer
```

- API: http://localhost:3001
- Consumer: http://localhost:3000

### Mobile testing

Test the consumer app on your phone or tablet on the same Wi‑Fi network:

1. Run `pnpm db:up`, `pnpm dev:api`, and `pnpm dev:consumer`
2. Find your machine's local IP:
   - Mac: `ipconfig getifaddr en0`
   - Linux: `hostname -I | awk '{print $1}'`
3. In `apps/consumer/.env.local`, set:
   ```
   NEXT_PUBLIC_API_URL=http://<your-ip>:3001
   ```
4. In root `.env`, add (for CORS to allow requests from mobile):
   ```
   CONSUMER_URL_MOBILE="http://<your-ip>:3000"
   ```
5. On your mobile device, open `http://<your-ip>:3000`
6. Restart both `pnpm dev:api` and `pnpm dev:consumer` after changing env vars

Postgres stays on the host at `localhost:5432`; the API and consumer both bind to `0.0.0.0` so they accept connections from other devices on your network.

## Project structure

```
gatherly-v1/
├── apps/
│   ├── consumer/     # Consumer PWA (Next.js) — event planning, bookings
│   └── vendor/       # Vendor dashboard (Next.js)
├── packages/
│   ├── api/          # Backend (Express + Prisma)
│   └── shared/       # Shared types & schemas
├── docs/             # PRD, features, plans, migration guides
├── scripts/          # test-api.sh, etc.
└── docker-compose.yml
```

- **Consumer:** `apps/consumer/DOCS.md` — PWA, routes, components
- **API:** `packages/api/` — Prisma schema, routes

## API endpoints

- `GET /api/health` – Health check
- `POST /api/auth/register` – Register (email, password, name, role)
- `POST /api/auth/login` – Login
- `GET /api/auth/me` – Current user (requires `Authorization: Bearer <token>`)
