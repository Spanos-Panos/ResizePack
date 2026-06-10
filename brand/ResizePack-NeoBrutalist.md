# ResizePack — Brand & Style Guide (Neobrutalism)

The single source of truth. Everything here mirrors the live one-pager
[`ResizePack Style Guide (Neobrutalism).html`](<./ResizePack Style Guide (Neobrutalism).html>)
— keep them in sync. Design system: **Neobrutalism** — flat saturated colour,
2px black borders, hard offset shadows, zero blur, mechanical motion.
Component patterns follow the **neobrutalism.dev shadcn registry**
(`pnpm dlx shadcn@latest add https://neobrutalism.dev/r/<component>.json`).

---

## Logo / avatar

The mark is unchanged: a paper **photo card** (sage mountain + clay sun) framed
by two **clay resize brackets** on an espresso ground.

| Asset | File | Use |
|---|---|---|
| Avatar (vector) | `assets/avatar.svg` | Figma, scaling, app icon |
| Avatar 1024 / 512 / 400 | `assets/avatar-*.png` | Store icons / social / favicons |
| Favicon | `assets/favicon.svg` | Browser tab |

**Framing in the neobrutal UI:** the avatar always sits in a **square tile,
8px radius, 2px black border, hard shadow** (no circular crop in-product;
circular crops remain fine for social platforms).

**Wordmark:** "ResizePack" set in **Space Grotesk 700, uppercase,
letter-spacing -0.03em**.

> ⚠ The mark's internal colours are still the old warm palette (clay/sage on
> espresso). It reads fine inside a black-border tile, but a redraw in
> blue/yellow/black is a pending decision.

---

## Colour — Light (`:root`)

Solid fills only — **no gradients, no washes, no grain, no transparency.**

### Core
| Token | Hex | Role |
|---|---|---|
| `--background` | `#dfe5f2` | App background |
| `--secondary-background` | `#ffffff` | Cards, panels, inputs |
| `--foreground` | `#000000` | Text |
| `--foreground-soft` | `#3d3d3d` | Secondary text |
| `--border` | `#000000` | **Every** border and shadow |
| `--main` | `#4d8eff` | **The action colour** — CTAs, links, active states |
| `--main-foreground` | `#000000` | Text on `--main` |

### Semantic
| Token | Hex | Role |
|---|---|---|
| `--pro` | `#ffdc58` | Pro / premium signifiers (was gold) |
| `--success` | `#a3e636` | Success, done states (was sage) |
| `--danger` | `#ff6b6b` | Errors, destructive (was danger red) |

Tints don't exist — semantic colours are used **at full strength** as fills
with black text and black borders.

---

## Colour — Dark (`:root[data-theme="dark"]`)

Same accents, dark canvas. **Borders and shadows stay pure black.**

| Token | Hex |
|---|---|
| `--background` | `#1d1f27` |
| `--secondary-background` | `#212121` |
| `--foreground` | `#e6e6e6` |
| `--main` / `--pro` / `--success` / `--danger` | unchanged |
| `--border` | `#000000` |

---

## Typography

| Role | Family | Weights | Token |
|---|---|---|---|
| Display / headings | **Space Grotesk** | 400–700 | `--font-display` |
| Body / UI | **DM Sans** | 400, 500, 700, 800 | `--font-body` |
| Mono / numerics / labels | **Space Mono** | 400, 700 | `--font-mono` |

- Fallbacks: display & body → `system-ui, sans-serif`; mono → `ui-monospace, monospace`.
- Headings: weight **700**, **UPPERCASE**, `letter-spacing: -0.02em` (h1 `-0.03em`).
- Body: base weight **500** (regular 400 only for long prose), line-height **1.5**.
- Buttons / labels: weight **700**.
- Eyebrow / section labels: Space Mono **700**, uppercase, `letter-spacing: .08–.1em`,
  set as a **black block with background-colour text** (inverted chip).
- Highlight emphasis: wrap display words in a flat `--main` (or `--success`)
  background span — never italics for emphasis.
- Google Fonts: `Space Grotesk`, `DM Sans`, `Space Mono`, `display=swap`.

---

## Shape, depth & motion

| Token | Value | Use |
|---|---|---|
| `--radius` | `8px` | Everything (cards, buttons, inputs) |
| `--bw` | `2px` | Border width — every element |
| `--shadow` | `4px 4px 0px 0px #000` | Default elevation |
| `--shadow-lg` | `8px 8px 0px 0px #000` | Hero mark, dialogs, toasts |

- Pills (badges, preset tabs, switch, progress): `border-radius: 999px` — still
  2px black border.
- **Shadows are never blurred.** Hard offsets only, always pure black.
- **The press interaction** (signature motion): on hover, interactive elements
  `translate(4px, 4px)` and drop their shadow — they physically push into it.
  `transition: transform .1s, box-shadow .1s`. Reverse variant does the opposite
  (gains shadow, lifts `-4px,-4px`).
- **Focus ring:** `2px solid #000`, `outline-offset: 2px`.
- **Selection:** background `--main`, black text.
- No fades, no eased entrances, no film grain. Motion is mechanical and instant.
- **Always** respect `prefers-reduced-motion: reduce`.

---

## Voice & usage notes

- **Blue is the only "money" colour** — reserve `--main` for the primary
  action, links and active states. One blue CTA per view.
- **Yellow = Pro.** Locked presets, Pro badges and upsells are always `--pro` —
  never use yellow for general emphasis.
- **Borders on everything.** Every surface, control and chip gets a 2px black
  border. If it doesn't have a border, it isn't a component.
- Copy stays plain, confident, second-person. Privacy is the pitch:
  *"processed entirely in your browser, never uploaded"* is the recurring line.
- No emoji as decoration; functional glyphs (★ Pro, ☾/☀ theme, ✓) are allowed.

---

# Pages & UI inventory

Base URL: **`https://www.resizepack.tech`**.

## Pages / routes

| Page | URL | Notes |
|---|---|---|
| Main tool | `/` | Hero + tool + SEO + footer (landing page) |
| Sign in / Sign up | `/login` | One page, multiple states (below) |
| Reset password | `/reset-password` | Opened from the reset email link |
| Account | `/account` | **Protected** — redirects to `/login` if signed out |
| FAQ | `/faq` | **Accordion** Q&A + FAQ schema |
| Privacy Policy | `/privacy` | Legal layout |
| Terms of Service | `/terms` | Legal layout |
| Refund & Cancellation | `/refund` | Legal layout |

**Login page states (same URL):** Sign in · Create account · Forgot password
("Reset password" → "Check your email") · Confirm email (auto-advances
cross-device) · "You're already signed in".

## Per-page elements

### Main tool — `/`
- **Hero:** brand badge `ResizePack` (ink pill); account row → **Account** /
  **Sign in** + **theme toggle**; `h1` "Bulk Resize & Compress Images"
  (Space Grotesk 700 uppercase); subhead + highlights line.
- **CTA row:** **Start optimizing now** (primary `--main`) · **Privacy first**
  (neutral white).
- **Preset tabs** (pill buttons, locked = yellow) + preset description.
- **Tool card** (white panel, border + shadow): plan banner (Free upsell
  **Upgrade to Pro** in yellow / Pro badge); **drop zone** (blue, dashed black
  border); error alert; **file queue data table**; **options panel**;
  **Process and download ZIP** (primary) + **Download ZIP again** (neutral);
  **progress bar** (bordered, blue fill).
- **SEO section** + **Questions? Read the FAQ →**; footer links.

### Login — `/login`
- **Card layout** (the neobrutal login card): title + description; OAuth
  **Continue with Google / GitHub** (neutral buttons); "or use email" divider;
  Email + Password (+ **Show/Hide** inline); **Sign in / Create account**
  (primary, full-width); secondary swaps + **Forgot password?**; `← Back to tool`.

### Reset password — `/reset-password`
- Same card: New password + Confirm + **Update password** (primary). States:
  verifying / set-new / **Password updated** / **Link expired**.
- **Confirm-email code** uses the **Input OTP** component (6 slots, 3+3).

### Account — `/account`
- "Signed in as {email}"; **Tabs** (Account / Password) for settings.
- **Plan section:** status badge; **Upgrade with Stripe — €9/mo** (primary) ·
  **Cancel subscription** (underline link).
- **Billing history:** invoice **table** (Paid `--success` / Pending `--pro` /
  Unpaid `--danger` badges).
- **Danger zone:** **Delete my account** (danger) → **alert dialog**
  ("Are you absolutely sure?") + type-`DELETE` confirm.

### Legal pages & FAQ
- Shared LegalLayout: eyebrow chip · `h1` · prose · footer links ·
  `← Back to ResizePack` · theme toggle.
- **FAQ uses the Accordion** — blue triggers, white content panels.

---

## Component inventory (neobrutalism.dev registry)

All ported components keep the registry's anatomy; install with
`pnpm dlx shadcn@latest add https://neobrutalism.dev/r/<name>.json`.

### Buttons — by variant
| Variant | Style | Examples |
|---|---|---|
| **Primary (default)** | `--main` fill, black text/border, shadow, push-in hover | Process and download ZIP · Start optimizing now · Sign in · Login |
| **Neutral** | white fill, same border/shadow/hover | Login with Google · Privacy first · Cancel · Browse files |
| **Pro** | `--pro` fill | Upgrade to Pro · locked-feature CTAs |
| **Danger** | `--danger` fill | Delete my account · Permanently delete |
| **noShadow** | no shadow, no hover motion | table pagination, compact rows |
| **Reverse** | no shadow → gains shadow on hover (lifts -4px) | playful secondary CTAs |
| **Disabled** | opacity .5, motion off | any |

### The rest
| Component | Registry name | ResizePack use |
|---|---|---|
| Accordion | `accordion` | FAQ — blue trigger, white body, chevron rotates |
| Alert | `alert` | success (lime) / info (blue) / destructive (red) notices |
| Alert dialog | `alert-dialog` | Delete-account confirm, destructive confirms |
| Card | `card` | Login card, tool card, settings cards |
| Checkbox | `checkbox` | JPEG · WebP · Strip EXIF · max-size toggle |
| Combobox | `combobox` (popover+command) | Preset picker with search |
| Context menu | `context-menu` | Right-click a file row: Download ⌘D · Rename · Export-as radio · Remove |
| Data table | `data-table` | File queue: select column, status badges, filter input, Columns menu, pagination |
| Form | `form` | Auth + options validation (inline messages) |
| Input OTP | `input-otp` | Email confirmation code (3 + separator + 3) |
| Label | `label` | All form labels — DM Sans 700, 14px |
| Progress | `progress` | Processing bar — pill, blue fill, black divider edge |
| Slider | `slider` | Quality 50–95 — round blue thumb, 2px border, mini shadow |
| Sonner (toast) | `sonner` | "Pack exported" + Undo |
| Switch | `switch` | Keep originals · per-image max size |
| Table | `table` | Billing history (header row = blue) |
| Tabs | `tabs` | Account / Password settings; preset pills are a styled tablist |
| Badge | — | ink (brand) · main (active) · pro · success · danger · neutral (Free) |
| Drop zone | custom | blue fill, **dashed** 2px black border, shadow |
| Theme toggle | custom | bordered icon button ☾ / ☀, `aria-pressed` |

---

## Responsive rules

- Single column under **760px**: control grids, notes and cards stack;
  swatch grid 4 → 2 → 1 (420px); hero stacks with a 96px mark.
- Type scales fluidly: h1 `clamp(38px, 7.5vw, 60px)`, h2 `clamp(27px, 5.5vw, 38px)`.
- Tables never squash: wrappers scroll horizontally (`overflow-x: auto`).
- Page padding `clamp(18px, 4.5vw, 40px)`; dialogs cap at `100vw - 48px`.
- Hit targets stay ≥ 44px on touch sizes.
