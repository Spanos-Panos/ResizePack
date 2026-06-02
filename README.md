# ResizePack

Free bulk image resize and compress tool.

ResizePack is a browser-first utility where users drop many images, choose a preset, and download one ZIP. v1 has no account, no paywall, and no backend image storage.

## Current v1 status

- React + Vite SPA is set up and running
- Multi-file upload (drag/drop + browse)
- Presets: Etsy listing (default), Web, Custom
- Validation limits (50 files, 25 MB each, 200 MB total)
- Output formats: JPEG and WebP (at least one required)
- EXIF strip toggle (default on)
- Per-file processing status + overall progress
- ZIP generation and download in browser
- Privacy page at `/privacy.html`

## Local development

Requirements:
- Node.js 20+
- pnpm

Install and run:

```bash
pnpm install
pnpm dev
```

Open:
- `http://localhost:5173/`

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - type-check and build production bundle
- `pnpm preview` - preview production build locally
- `pnpm lint` - run ESLint

## Quick manual test plan

1. Upload 2-3 JPG/PNG files and process.
2. Confirm ZIP auto-downloads.
3. Switch presets (`Etsy listing`, `Web`, `Custom`) and verify behavior.
4. In `Custom`, test width and quality ranges.
5. Uncheck both output formats and confirm validation error appears.
6. Try `.heic` input and verify the friendly unsupported message.
7. Open `/privacy.html` and verify content.

## Notes

- v1 processing is client-side only.
- ResizePack is not affiliated with Etsy, Inc.
- See `bulk-image-tool-brief.md` for locked product scope and decisions.

## Phase 2 (accounts + billing)

Phase 2 adds Supabase Auth + Stripe billing + a small Fastify API while keeping browser-first image processing.

**Full runbook (services, startup order, Stripe CLI, troubleshooting, maintenance):** see [`OPERATIONS.md`](./OPERATIONS.md).

Quick local start (three terminals):

```bash
pnpm dev                              # http://localhost:5173
pnpm --dir apps/api dev               # http://localhost:8787
stripe listen --forward-to localhost:8787/webhooks/stripe   # PowerShell; copy whsec_ to .env.local, restart API
```

Environment variables:
- Copy `.env.example` to `.env.local` and fill values for Supabase.
- `STRIPE_*` and `SUPABASE_SERVICE_ROLE_KEY` are **server-only** (for `apps/api`).
