// Renders brand/avatar.svg to PNGs for social profile pictures.
// Run from the repo root: node brand/make-avatar.mjs  (needs @resvg/resvg-js).
// Transparent background so circular crops look clean on any platform.
import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'node:fs';

const svg = readFileSync(new URL('./avatar.svg', import.meta.url), 'utf8');

for (const size of [1024, 512, 400]) {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: size } });
  const out = new URL(`./avatar-${size}.png`, import.meta.url);
  writeFileSync(out, resvg.render().asPng());
  console.log(`Wrote brand/avatar-${size}.png`);
}
