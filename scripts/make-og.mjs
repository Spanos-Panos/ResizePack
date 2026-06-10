// One-off generator for the social-share image (public/og.png, 1200x630).
// Run: node scripts/make-og.mjs  (needs @resvg/resvg-js installed).
// Neobrutalism edition: flat colour, black borders, hard offset shadows.
// Uses system fonts (Segoe UI / Consolas on Windows) as Space Grotesk /
// Space Mono stand-ins.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <!-- flat background + black frame -->
  <rect width="1200" height="630" fill="#dfe5f2"/>
  <rect x="20" y="20" width="1160" height="590" rx="16" fill="none" stroke="#000" stroke-width="4"/>

  <!-- brand mark tile (hard shadow) + wordmark -->
  <rect x="78" y="66" width="96" height="96" rx="11" fill="#000"/>
  <g transform="translate(70,58) scale(2)">
    <rect width="48" height="48" rx="6" fill="#221d16" stroke="#000" stroke-width="2"/>
    <rect x="16" y="16" width="16" height="16" rx="2.5" fill="#f1e9da"/>
    <circle cx="27.5" cy="20.5" r="1.9" fill="#c2471a"/>
    <path d="M16.8 31 L22 23.5 L25 27 L27.5 24 L31.2 31 Z" fill="#45614c"/>
    <g stroke="#c2471a" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <path d="M10 15 L10 10 L15 10"/>
      <path d="M38 33 L38 38 L33 38"/>
    </g>
  </g>
  <text x="190" y="125" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="46" letter-spacing="-1" fill="#000">RESIZEPACK</text>

  <!-- headline: second line sits on a flat blue highlight block -->
  <text x="80" y="300" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="72" letter-spacing="-2" fill="#000">BULK RESIZE &amp;</text>
  <rect x="72" y="324" width="706" height="84" fill="#4d8eff" stroke="#000" stroke-width="4"/>
  <text x="88" y="388" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="72" letter-spacing="-2" fill="#000">COMPRESS IMAGES</text>

  <!-- subtext -->
  <text x="82" y="466" font-family="'Segoe UI', Arial, sans-serif" font-weight="600" font-size="28" fill="#000">Drop images. Pick a preset. Download one ZIP.</text>
  <text x="82" y="506" font-family="Consolas, 'Courier New', monospace" font-weight="700" font-size="21" fill="#3d3d3d">ETSY &#183; SHOPIFY &#183; WEB &#183; CUSTOM &#8212; PROCESSED IN YOUR BROWSER</text>

  <!-- domain chip (hard shadow) -->
  <rect x="88" y="540" width="252" height="52" rx="26" fill="#000"/>
  <rect x="80" y="532" width="252" height="52" rx="26" fill="#4d8eff" stroke="#000" stroke-width="4"/>
  <text x="206" y="566" text-anchor="middle" font-family="'Segoe UI', Arial, sans-serif" font-weight="800" font-size="24" fill="#000">resizepack.tech</text>

  <!-- right-side illustration: white photo card, hard shadow, corner handles -->
  <rect x="812" y="192" width="300" height="270" rx="12" fill="#000"/>
  <g>
    <clipPath id="card"><rect x="800" y="180" width="300" height="270" rx="12"/></clipPath>
    <rect x="800" y="180" width="300" height="270" rx="12" fill="#ffffff"/>
    <g clip-path="url(#card)">
      <circle cx="1012" cy="252" r="28" fill="#ffdc58" stroke="#000" stroke-width="4"/>
      <path d="M790 452 L890 318 L948 384 L1008 300 L1110 452 Z" fill="#a3e636" stroke="#000" stroke-width="4"/>
      <path d="M948 452 L1010 372 L1110 452 Z" fill="#4d8eff" stroke="#000" stroke-width="4"/>
    </g>
    <rect x="800" y="180" width="300" height="270" rx="12" fill="none" stroke="#000" stroke-width="4"/>
  </g>
  <g fill="#4d8eff" stroke="#000" stroke-width="3">
    <rect x="789" y="169" width="22" height="22" rx="4"/>
    <rect x="1089" y="169" width="22" height="22" rx="4"/>
    <rect x="789" y="439" width="22" height="22" rx="4"/>
    <rect x="1089" y="439" width="22" height="22" rx="4"/>
  </g>
</svg>`;

const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
  font: { loadSystemFonts: true },
  background: '#dfe5f2',
});
writeFileSync('public/og.png', resvg.render().asPng());
console.log('Wrote public/og.png');
