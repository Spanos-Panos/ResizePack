# ResizePack — Roadmap (v2 "Pro Max" → v3)

> Captured 2026-06-10. The big base + Pro-features batch is **done and live**
> (3 Pro tools, set/change password, GA4, promo codes, custom domain + email,
> dark mode, reset password, FAQ, security/UX audit).
>
> **How we'll work these:** Panos is first building a full **Figma project**
> (custom prototype, colour palette, fonts — see [STYLE-GUIDE.md](./STYLE-GUIDE.md)).
> When ready, he'll say "do item X" and we fix them **one at a time**, with a
> build/lint gate and live verification per item. Nothing here is started yet.

---

## v2 — "Pro Max" (design-led pass)

- [ ] **1. Custom email icon / style** — branded styling + icon for the
  transactional emails (confirm signup, reset password, magic link) sent via
  Resend. Templates partly drafted in `EMAIL-SETUP.md`; finalise the look to
  match the Figma. *(Related: v3 #1 custom PFP for emails.)*

- [ ] **2. Competitive analysis + improve (sit between the two)**
  - Big reference: <https://bulkresizephotos.com/en>
  - Mid reference: <https://www.resizepal.com/en>
  - **Analyse** both (features, flow, layout, speed, copy, monetisation), write
    up where ResizePack should land **between** them, then implement the gaps
    that make sense for us. Deliverable: a short comparison + an action list,
    then the changes.

- [ ] **3. Mobile rework** — informed by #2. Proper mobile-first pass of the
  tool flow (drop zone, options panel, results), not just responsive patches.

## v3 — polish & trust

- [ ] **1. Custom PFP for emails** — sender avatar / brand image in email
  clients (BIMI-style or template header). Pairs with v2 #1.

- [ ] **2. Reset-password edge cases** — define + handle:
  - user lands on `/reset-password` **without** clicking a real reset link;
  - link opened on a **different device / browser** than requested;
  - a **logged-in (different) user** opens someone else's reset link;
  - expired / reused / tampered token.
  Make each path safe and clearly messaged (current page handles expired/invalid
  + the happy path; harden the rest).

- [ ] **3. Lifecycle / transactional emails** — "thanks for subscribing",
  payment receipt, **cancellation** confirmation, **refund** confirmation,
  card-failed / dunning. Decide Stripe-native emails vs. our own via Resend.

- [ ] **4. Fix `mailto:{email}` on Privacy** — the support-email `mailto:` link
  on the Privacy page (and check Terms/Refund) isn't working; repair it.

- [ ] **5. Page-transition UX** — scroll-to-top on route change + a visual
  transition/notice for sign-up / sign-in (and other route changes).

- [ ] **6. UI/UX frontend pass + mobile polish** — broader visual refinement
  on top of the Figma direction.

- [ ] **7. Custom error pages** — branded **404** (and a generic error
  boundary) instead of falling through to the SPA root.

- [ ] **8. Micro-animations** — tasteful motion on buttons, cards, the upload
  flow, and state changes (respecting `prefers-reduced-motion`).

---

## Notes / dependencies
- Items lean on the **Figma** direction; lock palette/fonts/components there
  first (style guide already mirrors the live tokens).
- v2 #3 (mobile) depends on v2 #2 (analysis).
- v3 #1 (email PFP) pairs with v2 #1 (email style).
- v3 #4 (`mailto:` bug) is a quick win and can jump the queue any time.
- After this list: **promotion** (screenshots → demo video → social profiles
  under `resizepack@gmail.com` → schedule → post). Explicitly last.
