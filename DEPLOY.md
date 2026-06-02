# Deploy Guide (v1)

This guide covers static deployment for the current browser-only v1.

For **Phase 2** (Supabase, Stripe, local three-terminal setup, production API planning, and ongoing maintenance), see [`OPERATIONS.md`](./OPERATIONS.md).

## 1) Pre-deploy checks

Run locally before pushing:

```bash
pnpm lint
pnpm build
```

Confirm:
- Build succeeds
- Main page works
- ZIP download works
- `/privacy.html` is reachable

## 2) Vercel deploy (chosen)

1. Push project to GitHub.
2. In Vercel, create a new project from this repo.
3. Framework preset: `Vite`.
4. Build command: `pnpm build`.
5. Output directory: `dist`.
6. (Optional) Add environment variable:
   - `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
7. Deploy.

After deploy:
- Open the production URL.
- Test one full upload -> process -> ZIP flow.
- Confirm analytics is active only when `VITE_GA_MEASUREMENT_ID` is configured.

## 3) Why this stays free

- Vercel Hobby supports static Vite apps without a trial window.
- ResizePack v1 is browser-side processing, so there is no paid server compute for image jobs.
- Google Analytics (GA4) is free to start and optional.

## 4) Optional custom domain

When ready, connect your domain (for example `resizepack.com` or `resizepack.io`) in hosting settings.

## 5) Optional analytics (v1)

- Recommended: **Google Analytics 4 (free)** via `VITE_GA_MEASUREMENT_ID`.
- If you do not set the env var, analytics code stays inactive.
- No custom backend analytics is required for v1.

## 6) Post-deploy checklist

- Confirm page title and hero copy are correct.
- Confirm Etsy disclaimer in footer is visible.
- Confirm file limits and validation still work in production.
- Confirm no login/paywall UI exists in v1.
- Follow `LAUNCH.md` for Search Console + first validation loop.
