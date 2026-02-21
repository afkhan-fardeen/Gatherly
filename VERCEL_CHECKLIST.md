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

### Pre-deploy checklist
1. [ ] API deployed and reachable at `https://gatherly-skl4.onrender.com`
2. [ ] Render CORS: `CONSUMER_URL` and `VENDOR_URL` match Vercel deployment URLs
3. [ ] Vercel env vars set (no quotes)
4. [ ] Trigger redeploy after env var changes
