// One-off generator for the social-share image (public/og.png, 1200x630).
// Run: node scripts/make-og.mjs  (needs @resvg/resvg-js installed).
// Uses system fonts (Georgia / Segoe UI on Windows) as Fraunces/Hanken stand-ins.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="clayWash" cx="88%" cy="-8%" r="70%">
      <stop offset="0%" stop-color="#c2471a" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#c2471a" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="sageWash" cx="-6%" cy="8%" r="60%">
      <stop offset="0%" stop-color="#45614c" stop-opacity="0.09"/>
      <stop offset="55%" stop-color="#45614c" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="card"><rect x="800" y="180" width="300" height="270" rx="18"/></clipPath>
  </defs>

  <!-- paper base + warm washes -->
  <rect width="1200" height="630" fill="#f1e9da"/>
  <rect width="1200" height="630" fill="url(#clayWash)"/>
  <rect width="1200" height="630" fill="url(#sageWash)"/>
  <!-- thin ink frame -->
  <rect x="24" y="24" width="1152" height="582" rx="24" fill="none" stroke="#221d16" stroke-opacity="0.85" stroke-width="2"/>

  <!-- brand mark (the favicon, scaled 2x) + wordmark -->
  <g transform="translate(72,60) scale(2)">
    <rect width="48" height="48" rx="11" fill="#221d16"/>
    <rect x="16" y="16" width="16" height="16" rx="2.5" fill="#f1e9da"/>
    <circle cx="27.5" cy="20.5" r="1.9" fill="#c2471a"/>
    <path d="M16.8 31 L22 23.5 L25 27 L27.5 24 L31.2 31 Z" fill="#45614c"/>
    <g stroke="#c2471a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M10 15 L10 10 L15 10"/>
      <path d="M38 33 L38 38 L33 38"/>
    </g>
  </g>
  <text x="190" y="132" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="54" fill="#221d16">ResizePack</text>

  <!-- headline -->
  <text x="80" y="305" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="74" fill="#221d16">Bulk Resize &amp;</text>
  <text x="80" y="398" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="74" fill="#221d16">Compress Images</text>
  <rect x="82" y="425" width="120" height="7" rx="3.5" fill="#c2471a"/>

  <!-- subtext -->
  <text x="82" y="486" font-family="'Segoe UI', Arial, sans-serif" font-weight="500" font-size="29" fill="#5a5145">Drop images. Pick a preset. Download one ZIP.</text>
  <text x="82" y="526" font-family="'Segoe UI', Arial, sans-serif" font-weight="400" font-size="26" fill="#5a5145">Etsy · Shopify · Web · Custom — processed in your browser.</text>

  <!-- domain pill -->
  <rect x="80" y="552" width="246" height="48" rx="24" fill="#c2471a"/>
  <text x="203" y="583" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="25" fill="#f1e9da">resizepack.tech</text>

  <!-- right-side illustration: a photo being resized -->
  <g clip-path="url(#card)">
    <rect x="800" y="180" width="300" height="270" rx="18" fill="#fffdf8"/>
    <circle cx="1012" cy="252" r="28" fill="#c2471a"/>
    <path d="M790 452 L890 318 L948 384 L1008 300 L1110 452 Z" fill="#45614c"/>
    <path d="M948 452 L1010 372 L1110 452 Z" fill="#9b3712" fill-opacity="0.55"/>
  </g>
  <rect x="800" y="180" width="300" height="270" rx="18" fill="none" stroke="#ddd1bb" stroke-width="2"/>
  <!-- clay resize handles on the card corners -->
  <g fill="#c2471a">
    <rect x="791" y="171" width="18" height="18" rx="4"/>
    <rect x="1091" y="171" width="18" height="18" rx="4"/>
    <rect x="791" y="441" width="18" height="18" rx="4"/>
    <rect x="1091" y="441" width="18" height="18" rx="4"/>
  </g>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
  background: '#f1e9da',
});
writeFileSync('public/og.png', resvg.render().asPng());
console.log('Wrote public/og.png');
