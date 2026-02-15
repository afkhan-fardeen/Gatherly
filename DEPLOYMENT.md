# Gatherly Deployment – Environment Variables

Live URLs:
- **Consumer:** https://gatherly-consumer.vercel.app
- **Vendor:** https://gatherly-vendor.vercel.app
- **API:** https://gatherly-skl4.onrender.com

---

## Render (API)

**Dashboard:** [Render](https://dashboard.render.com) → Your API service → Environment

| Variable | Value |
|----------|-------|
| `NODE_VERSION` | `18` |
| `DATABASE_URL` | Neon connection string (from Neon dashboard) |
| `JWT_SECRET` | Strong random string (e.g. `openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Another strong random string |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `CONSUMER_URL` | `https://gatherly-consumer.vercel.app` |
| `VENDOR_URL` | `https://gatherly-vendor.vercel.app` |

---

## Vercel (Consumer)

**Dashboard:** [Vercel](https://vercel.com) → gatherly-consumer → Settings → Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://gatherly-skl4.onrender.com` |

---

## Vercel (Vendor)

**Dashboard:** [Vercel](https://vercel.com) → gatherly-vendor → Settings → Environment Variables

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://gatherly-skl4.onrender.com` |

---

## Neon (Database)

No env vars needed in the apps. `DATABASE_URL` is set in Render only.

---

## Quick copy-paste

**Render:**
```
NODE_VERSION=18
CONSUMER_URL=https://gatherly-consumer.vercel.app
VENDOR_URL=https://gatherly-vendor.vercel.app
```

**Vercel (both projects):**
```
NEXT_PUBLIC_API_URL=https://gatherly-skl4.onrender.com
```
**Important:** No quotes around the value. Set as `https://gatherly-skl4.onrender.com` not `"https://gatherly-skl4.onrender.com"`.

---

## Test API with curl

```bash
./scripts/test-api.sh
# Or with custom URL:
./scripts/test-api.sh https://gatherly-skl4.onrender.com
```

---

## Troubleshooting: 405 on login

If you get "405 Method Not Allowed" when logging in:

1. **Check Vercel env var** – `NEXT_PUBLIC_API_URL` must be exactly `https://gatherly-skl4.onrender.com` (no quotes, no trailing slash).
2. **Redeploy** – Env vars are inlined at build time. After changing, trigger a new deployment.
3. **Verify API** – Run `curl -X POST https://gatherly-skl4.onrender.com/api/auth/login -H "Content-Type: application/json" -d '{"email":"consumer@gatherly.com","password":"password123"}'` – should return 200 with token.
