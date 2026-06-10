# ResizePack — Brand & Style Guide

The single source of truth for Figma. Everything here mirrors the **live**
tokens in [`src/index.css`](../src/index.css) — keep them in sync. Design
system name: **"Print Studio"** — warm paper + ink, a characterful serif over a
clean grotesque, with terracotta as the one action colour.

---

## Logo / avatar

The mark is a paper **photo card** (a sage mountain + a clay sun) framed by two
**clay resize brackets**, on an espresso ground.

| Asset | File | Use |
|---|---|---|
| Avatar (vector) | [`avatar.svg`](./avatar.svg) | Figma, scaling, app icon |
| Avatar 1024 | `avatar-1024.png` | High-res / store icons |
| Avatar 512 | `avatar-512.png` | Social profile pictures |
| Avatar 400 | `avatar-400.png` | Smaller social / favicons |
| Favicon | [`../public/favicon.svg`](../public/favicon.svg) | Browser tab |
| OG / share image | [`../public/og.png`](../public/og.png) | Link previews (1200×630) |

Regenerate the PNGs after editing `avatar.svg`: `node brand/make-avatar.mjs`.

**Clearspace & crops:** the mark is centred and safe for **circular crops**
(all platforms). Don't add text inside the avatar — too small to read; use the
wordmark lockup (below) where space allows.

**Wordmark:** "ResizePack" set in **Fraunces 600–700**. Mark + wordmark lockup
is used in the OG image and email headers.

---

## Colour — Light (`:root`)

### Surfaces
| Token | Hex | Role |
|---|---|---|
| `--paper` | `#f1e9da` | App background |
| `--paper-2` | `#ece2cf` | Muted background fill |
| `--surface` | `#fbf7ee` | Cards / panels |
| `--surface-raised` | `#fffdf8` | Raised cards, inputs |

### Ink / text
| Token | Hex | Role |
|---|---|---|
| `--ink` | `#221d16` | Primary text, headings |
| `--ink-soft` | `#5a5145` | Secondary text |
| `--ink-faint` | `#6e6553` | Muted labels (AA: 4.8:1 on paper) |

### Lines
| Token | Hex | Role |
|---|---|---|
| `--line` | `#ddd1bb` | Default borders |
| `--line-soft` | `#e7ddca` | Subtle dividers |
| `--line-ink` | `#221d16` | Strong/ink borders |

### Accents
| Token | Hex | Role |
|---|---|---|
| `--clay` | `#c2471a` | **The action colour** — CTAs, links, focus |
| `--clay-deep` | `#9b3712` | Hover / pressed clay |
| `--clay-tint` | `#f6e1d4` | Clay backgrounds |
| `--clay-line` | `#e3a988` | Clay borders |
| `--gold` | `#9a6b16` | Pro / premium |
| `--gold-tint` | `#f3e6c6` | Pro badge bg |
| `--gold-line` | `#d9b878` | Pro badge border |
| `--sage` | `#45614c` | Success |
| `--sage-tint` | `#e2ebe1` | Success bg |
| `--sage-line` | `#a9c0ac` | Success border |
| `--danger` | `#b03527` | Errors / destructive |
| `--danger-tint` | `#f6ddd8` | Danger bg |
| `--danger-line` | `#e2a89f` | Danger border |

---

## Colour — Dark (`:root[data-theme="dark"]`)

Warm **espresso** inversion. Same semantic tokens, retuned. Accents are
brightened for legibility on dark surfaces (≥ WCAG AA).

### Surfaces
| Token | Hex |
|---|---|
| `--paper` | `#18140f` |
| `--paper-2` | `#211b15` |
| `--surface` | `#221c16` |
| `--surface-raised` | `#2b241c` |

### Ink / text
| Token | Hex |
|---|---|
| `--ink` | `#f1e9da` |
| `--ink-soft` | `#c9c0b1` |
| `--ink-faint` | `#9d9485` |

### Lines
| Token | Hex |
|---|---|
| `--line` | `#3a322a` |
| `--line-soft` | `#2c2620` |
| `--line-ink` | `#f1e9da` |

### Accents
| Token | Hex |
|---|---|
| `--clay` / `--clay-deep` | `#d9602f` / `#b8481f` |
| `--clay-tint` / `--clay-line` | `#3a241a` / `#6f3c23` |
| `--gold` / `--gold-tint` / `--gold-line` | `#c89b3f` / `#322a17` / `#5e4b25` |
| `--sage` / `--sage-tint` / `--sage-line` | `#82a78a` / `#1f2a22` / `#3b5042` |
| `--danger` / `--danger-tint` / `--danger-line` | `#e06a5c` / `#341c19` / `#6f342d` |

**Mobile address-bar (`theme-color`):** light `#f1e9da` · dark `#18140f`.

---

## Typography

| Role | Family | Weights | Token |
|---|---|---|---|
| Display / headings | **Fraunces** (serif) | 400–700 (+ italic) | `--font-display` |
| Body / UI | **Hanken Grotesk** (sans) | 400, 500, 600, 700 | `--font-body` |
| Mono / numerics / labels | **DM Mono** | 400, 500 | `--font-mono` |

- Fallbacks: display → `Georgia, "Times New Roman", serif`; body →
  `system-ui, -apple-system, "Segoe UI", sans-serif`; mono →
  `ui-monospace, "SFMono-Regular", monospace`.
- Headings: weight **600**, `letter-spacing: -0.01em`.
- Body line-height: **1.55**.
- Eyebrow / section labels: DM Mono, uppercase, `letter-spacing: 0.14em`,
  `--ink-faint`, ~0.74rem.
- Google Fonts: `Fraunces` (opsz 9..144), `Hanken Grotesk`, `DM Mono`,
  loaded with `display=swap`.

---

## Shape, depth & motion

| Token | Value | Use |
|---|---|---|
| `--radius` | `14px` | Cards, panels |
| `--radius-sm` | `9px` | Inputs, buttons, small chips |
| `--radius-pill` | `999px` | Pills, badges |
| `--shadow` | `0 22px 48px -28px rgba(34,29,22,0.5)` | Card elevation |
| `--shadow-sm` | `0 8px 20px -12px rgba(34,29,22,0.38)` | Subtle lift |

- **Avatar/app-icon corner radius:** `208 / 1024` ≈ **20%** of the square.
- **Texture:** body has two soft radial washes (clay top-right `~0.08`, sage
  top-left `~0.07`) over paper, plus a fine fractal-noise **film grain**
  (`opacity 0.5` light / `0.32` dark, `mix-blend: multiply`).
- **Focus ring:** `2px solid --clay`, `outline-offset: 2px`.
- **Selection:** background `--clay`, text `--paper`.
- **Entrance animation** `rp-rise`: fade + 14px rise, `0.55s cubic-bezier(0.22, 1, 0.36, 1)`.
- **Always** respect `prefers-reduced-motion: reduce` (durations collapse to ~0).

---

## Voice & usage notes
- **Terracotta is the only "money" colour** — reserve `--clay` for the primary
  action / links / focus. Don't dilute it across decorative elements.
- **Gold = Pro.** Use gold tints/borders only for premium/Pro signifiers.
- Keep the **warmth**: never pure white (`--surface-raised` is `#fffdf8`) or
  pure black (dark base is `#18140f`).
- Privacy is a core selling point — "processed entirely in your browser,
  never uploaded" is a recurring message; keep that tone in copy.
