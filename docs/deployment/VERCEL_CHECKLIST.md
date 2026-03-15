# Vercel deployment checklist

## Consumer & Vendor apps

### Build status
- ✅ Consumer: `npm run build -w consumer` — passes
- ✅ Vendor: `npm run build -w vendor` — passes

### Environment variables (set in Vercel dashboard)

| Project | Variable | Value |
|---------|----------|-------|
| gatherly-consumer | `NEXT_PUBLIC_API_URL` | `https://gatherly-skl4.onrender.com` |
| gatherly-vendor | `NEXT_PUBLIC_API_URL` | `https://gatherly-skl4.onrender.com` |

**Important:** No quotes around the value. No trailing slash.

### Root directory (Vercel project settings)

- **Consumer:** `apps/consumer`
- **Vendor:** `apps/vendor`

### Build & output
- Framework: Next.js (auto-detected)
- Build command: `npm run build` (runs from app root)
- Output directory: `.next` (default)

### Console error modal
Both apps now include a modal that appears when `console.error` or `console.warn` is triggered. Users can:
- View the message
- Copy details for support
- Dismiss the modal

---

## API (Render) – production env vars

Set in Render dashboard for the API service:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon/Postgres connection string |
| `JWT_SECRET` | Strong random secret (e.g. `openssl rand -base64 32`) |
| `JWT_EXPIRES_IN` | `7d` (or desired expiry) |
| `CONSUMER_URL` | Vercel consumer URL (e.g. `https://gatherly-consumer.vercel.app`) |
| `VENDOR_URL` | Vercel vendor URL (e.g. `https://gatherly-vendor.vercel.app`) |
| `CLOUDINARY_*` | Cloudinary credentials for image uploads |

---

## Pre-deploy checklist
1. [ ] API deployed and reachable at `https://gatherly-skl4.onrender.com`
2. [ ] Render CORS: `CONSUMER_URL` and `VENDOR_URL` match Vercel deployment URLs
3. [ ] Vercel env vars set for consumer & vendor (no quotes)
4. [ ] Trigger redeploy after env var changes
