# Migrating from Render to Railway

Guide to deploy the Gatherly API (and optionally the database) from Render to Railway.

---

## What’s Changing

| Current (Render) | New (Railway) |
|------------------|---------------|
| API: `gatherly-skl4.onrender.com` | API: `your-project.up.railway.app` |
| Neon PostgreSQL (external) | Railway PostgreSQL (or keep Neon) |
| Render dashboard | Railway dashboard |

---

## Step 1: Set Up Railway

1. Go to [railway.app](https://railway.app) and sign in (GitHub is easiest).
2. **New Project** → **Deploy from GitHub repo**.
3. Choose your repo: `afkhan-fardeen/Gatherly` (or your fork).

---

## Step 2: Add a PostgreSQL Database (Optional)

You can keep using Neon or switch to Railway Postgres.

**If using Railway Postgres:**

1. In your Railway project → **+ New** → **Database** → **Add PostgreSQL**.
2. Open the PostgreSQL service → **Variables** → copy `DATABASE_URL`.
3. Use this as `DATABASE_URL` for the API service.

**If keeping Neon:**  
Use the existing connection string (no change).

---

## Step 3: Deploy the API as a Service

1. **+ New** → **GitHub Repo** → select your repo.
2. Railway auto-detects the repo. Configure the API service:

### Build & Deploy Settings

**Root Directory:** leave empty (monorepo root).

**Build Command:**
```bash
npm install && npm run build -w @gatherly/shared && cd packages/api && npx prisma generate && npx prisma migrate deploy && tsc
```

**Start Command:**
```bash
cd packages/api && node dist/server.js
```

**Watch Paths** (optional, for deploy triggers):
```
packages/api/**
packages/shared/**
```

### Alternative: `railway.json` (recommended)

Create `railway.json` at the repo root so you don’t have to configure build/start in the UI:

---

## Step 4: Environment Variables

In Railway → your API service → **Variables**:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | From Railway Postgres or your Neon URL |
| `JWT_SECRET` | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Another random string |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Your value |
| `CLOUDINARY_API_KEY` | Your value |
| `CLOUDINARY_API_SECRET` | Your value |
| `CONSUMER_URL` | `https://gatherly-consumer.vercel.app` |
| `VENDOR_URL` | `https://gatherly-vendor.vercel.app` |
| `PORT` | Railway sets this automatically (use `process.env.PORT`) |

`PORT` is provided by Railway. Your server already uses `process.env.PORT || 3001`, which works.

---

## Step 5: Get the Public URL

1. Open your API service in Railway.
2. **Settings** → **Networking** → **Generate Domain**.
3. Example: `gatherly-api-production.up.railway.app`.

---

## Step 6: Update Vercel

In Vercel for both consumer and vendor:

1. **Settings** → **Environment Variables**.
2. Set `NEXT_PUBLIC_API_URL` to your Railway URL, e.g.  
   `https://gatherly-api-production.up.railway.app`
3. Trigger a redeploy so the new value is picked up.

---

## Step 7: CORS

Update `packages/api/src/server.ts` cors origins to include the Railway URL:

```javascript
const corsOrigins = [
  process.env.CONSUMER_URL || "http://localhost:3000",
  process.env.VENDOR_URL || "http://localhost:3002",
  "https://gatherly-consumer.vercel.app",
  "https://gatherly-vendor.vercel.app",
  // Add your Railway domain if needed
].filter(Boolean);
```

If `CONSUMER_URL` and `VENDOR_URL` are set correctly in Railway, this is enough.

---

## Step 8: Migrate Database (If Moving to Railway Postgres)

If you switch from Neon to Railway Postgres:

1. Export from Neon (pg_dump or Neon dashboard export).
2. Import into Railway Postgres (psql or Railway’s DB tools).
3. Or use `prisma migrate deploy` after pointing `DATABASE_URL` at Railway Postgres and run migrations from your build step.

---

## Step 9: Decommission Render

1. Confirm API on Railway works (curl, login flow).
2. Check Vercel apps use the new `NEXT_PUBLIC_API_URL`.
3. In Render: **Settings** → **Delete Web Service**.

---

## Quick Checklist

- [ ] Railway project created
- [ ] PostgreSQL added (Railway or Neon)
- [ ] API service configured (build + start)
- [ ] All env vars set in Railway
- [ ] Public domain generated
- [ ] Vercel `NEXT_PUBLIC_API_URL` updated
- [ ] Test login: `curl -X POST https://YOUR-RAILWAY-URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"consumer@gatherly.com","password":"password123"}'`
- [ ] Render service deleted

---

## Railway vs Render

| Feature | Render | Railway |
|---------|--------|---------|
| Free tier | 750 hrs/month | $5 credit/month |
| Cold starts | Yes (free tier) | Typically faster |
| PostgreSQL | External (e.g. Neon) | Built-in add-on |
| Build config | Dashboard | `nixpacks.toml` / `railway.json` |
| GitHub deploy | Yes | Yes |

---

## Troubleshooting

**Build fails: `prisma generate` or `@gatherly/shared`**

- Ensure `nixpacks.toml` or build command includes `npm run build -w @gatherly/shared` and `prisma generate`.
- Check workspace names in root `package.json`.

**502 / Connection refused**

- Ensure `PORT` is used: `app.listen(process.env.PORT || 3001)`.
- Confirm start command is `cd packages/api && node dist/server.js`.

**CORS errors**

- Confirm `CONSUMER_URL` and `VENDOR_URL` in Railway match your Vercel URLs.
- Add any extra origins to the cors array in `server.ts`.
