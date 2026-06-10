> **⚠ SUPERSEDED (2026-06-10):** the live product now uses the **Neobrutalism**
> design system — see [ResizePack-NeoBrutalist.md](./ResizePack-NeoBrutalist.md).
> This file documents the previous "Print Studio" look (kept for reference;
> the Pages & UI inventory section is still accurate).

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

---

# Pages & UI inventory

Everything to rebuild the screens in Figma. Base URL: **`https://www.resizepack.tech`**.

## Pages / routes

| Page | URL | Notes |
|---|---|---|
| Main tool | `https://www.resizepack.tech/` | Hero + tool + SEO + footer (the landing page) |
| Sign in / Sign up | `https://www.resizepack.tech/login` | One page, multiple states (below) |
| Reset password | `https://www.resizepack.tech/reset-password` | Opened from the reset email link |
| Account | `https://www.resizepack.tech/account` | **Protected** — redirects to `/login` if signed out |
| FAQ | `https://www.resizepack.tech/faq` | Q&A + FAQ schema |
| Privacy Policy | `https://www.resizepack.tech/privacy` | Legal layout |
| Terms of Service | `https://www.resizepack.tech/terms` | Legal layout |
| Refund & Cancellation | `https://www.resizepack.tech/refund` | Legal layout |

**Login page states (same URL):** Sign in · Create account · Forgot password
("Reset password" → "Check your email") · Confirm email ("check your email",
auto-advances cross-device) · "You're already signed in".

## Per-page elements

### Main tool — `/`
- **Hero:** brand pill `ResizePack`; account row → **Account** (signed in) or
  **Sign in** (signed out) + **theme toggle**; `h1` "Bulk Resize & Compress
  Images"; subhead + highlights line.
- **CTA row:** **Start optimizing now** (primary, anchors to `#tool`) ·
  **Privacy first** (secondary → `/privacy`).
- **Preset tabs** (see Preset list below) + preset description.
- **Tool card:** plan banner (Free upsell **Upgrade to Pro** / Pro badge);
  **drop zone**; error list; **file list**; **options panel**; **Process and
  download ZIP** (primary) + **Download ZIP again** (secondary, after a run);
  progress summary.
- **SEO section:** `h2` + three `h3` cards + **Questions? Read the FAQ →** link.
- **Footer links:** `not affiliated` note · **FAQ** · **Privacy** · **Terms** · **Refunds**.

### Login — `/login`
- **OAuth:** **Continue with Google** · **Continue with GitHub**; "or use email" divider.
- **Email form:** Email input · Password input + **Show/Hide** toggle.
- **Buttons:** **Sign in** / **Create account** (primary) · **Need an account?
  Sign up** / **Already have an account? Sign in** (secondary) · **Forgot
  password?** (secondary, sign-in only).
- **Forgot flow:** Email input · **Send reset link** · **Back to sign in**.
- **Confirm-email state:** **Back to sign in** + `← Back to tool`.
- **Bottom link:** `← Back to tool`; theme toggle top-corner.

### Reset password — `/reset-password`
- New password + **Show/Hide** toggle · Confirm new password · **Update
  password** (primary). States: verifying / set-new / **Password updated**
  (`Go to sign in →`) / **Link expired** (`Back to sign in →`). `← Back to sign in`.

### Account — `/account`
- Theme toggle; "Signed in as {email}".
- **Plan section:** status badge + detail; **Upgrade with Stripe — €9/mo** /
  **Resume subscription** / **Manage billing** (primary) · **Cancel
  subscription** (underline link).
- **Password section:** **Set or change password** (or **Change password**) →
  reveals New password + Confirm + **Save password** / **Cancel**.
- **Account actions:** **Sign out** (secondary) · **Back to tool** (link).
- **Danger zone:** **Delete my account** → type-`DELETE` confirm input +
  **Permanently delete** / **Cancel**.

### Legal pages — `/privacy`, `/terms`, `/refund`, `/faq`
- Shared **LegalLayout**: eyebrow `ResizePack` · `h1` title · optional "Last
  updated" · prose · footer links (**Privacy Policy · Terms of Service · Refund
  & Cancellation · FAQ**) · `← Back to ResizePack` · theme toggle.

---

## Component inventory (reusable)

### Buttons — by variant
| Variant | Style | Examples |
|---|---|---|
| **Primary** | `--clay` fill, white text, `--clay-deep` border, hover darken + 1px lift | Process and download ZIP · Start optimizing now · Sign in · Create account · Send reset link · Update password · Save password · Upgrade with Stripe — €9/mo · Resume subscription · Manage billing |
| **Secondary / ghost** | transparent, `--line-ink` border, ink text, hover inverts to ink/paper | Back to sign in · Need an account? Sign up · Forgot password? · Sign out · Set or change password · Download ZIP again · Privacy first |
| **OAuth** | bordered neutral button | Continue with Google · Continue with GitHub |
| **Locked (Pro)** | dashed `--clay-line` border, `--clay-tint` bg, `--clay-deep` text, ` 🔒 Pro` tag | WebP · Crop · Target size · Rename · locked preset tabs |
| **Danger** | `--danger-tint` bg + `--danger-line` border → solid `--danger` on hover | Delete my account · Permanently delete |
| **Inline text** | borderless, in-field | Show / Hide (password) |

### Links / underlines
- **Underlined action links** (`--ink-soft`, clay underline, hover `--clay`):
  Cancel subscription · Cancel (forms).
- **Back links:** `← Back to tool` · `← Back to ResizePack` · `Go to sign in →` ·
  `Back to sign in →`.
- **Footer links:** FAQ · Privacy · Terms · Refunds (main) / Privacy Policy ·
  Terms of Service · Refund & Cancellation · FAQ (legal).
- **In-prose links:** clay text (e.g. the `mailto:` support links on legal pages).
- **SEO link:** `Questions? Read the FAQ →`.

### Theme toggle
- Icon button, **☾** (offer dark) / **☀** (offer light), `aria-pressed`,
  pill-ish; appears top-corner on login/account/legal and in the main hero row.

### Preset tabs (`role="tablist"`)
`Etsy listing` · `Web` · `Shopify` · `Amazon` · `Instagram` · `Custom`.
States: default · **active** (selected) · **locked** (` 🔒 Pro` on Free —
Shopify/Amazon/Instagram/Custom).

### Drop zone
- Dashed bordered area, drag-active + disabled states. Title **"Drop images
  here"** · subtitle "JPEG, PNG, WebP | Max N files | Max N MB each" ·
  **Browse files** button · hidden file input. `aria-label="Drop images here"`.

### File list
- Header "Files (N)" + **Clear all**; "Total input size: …"; rows with name +
  size + **Remove**; empty state "No files added yet."

### Form controls (Options panel + auth)
| Control | Where |
|---|---|
| Text input | Email · Password · New/Confirm password · Custom file name · type-DELETE |
| Number input | Max width (400–4000) · Start numbering at · Max size per image (KB) |
| Range slider | Quality (50–95) |
| Checkbox | JPEG · WebP · Strip EXIF metadata · "Keep each image under a max size" |
| Select | Crop to aspect ratio: No crop · Square 1:1 · Portrait 4:5 · Photo 3:2 · Standard 4:3 · Wide 16:9 |
| File input | (hidden, via Browse files) |

### Badges / pills
- **Brand pill** `ResizePack` (hero).
- **Free upsell** banner ("You're on Free — …") + **Upgrade to Pro** / **Renew Pro**.
- **Pro badge** (sage): "★ Pro active — … all presets, WebP, crop, target size &
  batch rename, up to N files".
- **Pro-until badge** (gold/warning): "★ Pro until {date} …".
- **Account status badge:** Pro (sage) / warning (gold) / muted.

### Notices / states
- **Error list** (clay/danger) · field errors (inline) · **success notices**
  (sage tint, e.g. "✓ Email confirmed", "Password updated") · **info notices**
  (gold tint) · **consent banner** (Accept / Decline + Privacy link).
