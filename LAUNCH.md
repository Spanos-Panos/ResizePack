# Launch Validation Checklist (v1)

This follows `bulk-image-tool-brief.md` §17 and keeps everything free.

## 1) Google Search Console setup (free)

1. Open Google Search Console and add property:
   - Preferred: `https://www.resizepack.tech/`
2. Verify ownership (URL prefix flow is simplest on Vercel).
3. Submit sitemap:
   - `https://www.resizepack.tech/sitemap.xml`
4. Check indexing status after a few days.

## 2) Optional GA4 setup (free)

If you want GA4:

1. Create a GA4 property.
2. Copy measurement ID (`G-XXXXXXXXXX`).
3. In Vercel project settings -> Environment Variables:
   - `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
4. Redeploy.
5. Open site and verify real-time event/page view in GA.

If env var is not set, ResizePack runs with no GA tracking.

## 3) Basic production validation

Run one real flow on production:

1. Upload multiple files.
2. Process and confirm ZIP download.
3. Confirm `/privacy.html` loads.
4. Confirm disclaimer visible in footer.

## 4) First traffic signal

Post once (no spam) with honest context:

- What tool does
- Why it is free
- Link to live app
- Ask for feedback on quality defaults

Suggested communities from brief:
- `r/Etsy`
- `r/webdev`
- `r/Entrepreneur`

## 5) Feedback loop

Collect feedback on:

- quality too aggressive / too soft
- wanted format defaults
- file limit pain points

Use feedback to tune preset defaults in small updates.
