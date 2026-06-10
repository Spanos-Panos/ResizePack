// Visual-check utility: screenshots a route in light + dark mode using the
// system-installed Edge (playwright-core, no browser download).
// Run: node scripts/screenshot.mjs [path] [outPrefix]
//   e.g. node scripts/screenshot.mjs /login login
// Writes shots/<outPrefix>-light.png and shots/<outPrefix>-dark.png.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const route = process.argv[2] ?? '/';
const prefix = process.argv[3] ?? 'home';
const base = process.env.SCREENSHOT_BASE ?? 'http://localhost:5173';

mkdirSync('shots', { recursive: true });

const browser = await chromium.launch({ channel: 'msedge', headless: true });
for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({
    colorScheme: scheme,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: `shots/${prefix}-${scheme}.png`, fullPage: true });
  await context.close();
  console.log(`shots/${prefix}-${scheme}.png`);
}
await browser.close();
