# Branded auth emails (Resend + Supabase)

Supabase's built-in email is rate-limited (~a few/hour) and unbranded — fine for
testing, not for real signups. This sets up reliable, on-brand delivery from
`noreply@resizepack.tech` via **Resend** (free tier: 3,000 emails/mo, 100/day).

No app code is involved — it's Resend + Papaki DNS + Supabase dashboard. SMTP
credentials go straight into the Supabase dashboard; never commit them.

---

## Step 1 — Resend account + domain

1. Create a free account at <https://resend.com>.
2. **Domains → Add Domain** → enter `resizepack.tech`.
3. Resend shows a set of DNS records to add (it uses a `send.` subdomain so it
   does **not** disturb your existing `securemail.pro` email). Typically:
   - **MX** on `send` → `feedback-smtp.<region>.amazonses.com` (priority 10)
   - **TXT** (SPF) on `send` → `v=spf1 include:amazonses.com ~all`
   - **TXT** (DKIM) on `resend._domainkey` → a long `p=...` key
   - **TXT** (DMARC, optional) on `_dmarc` → only if you don't already have one
     (you DO — leave the existing `_dmarc` record alone).
   Use whatever Resend actually shows you on screen.

## Step 2 — Add the records at Papaki

1. Papaki → `resizepack.tech` → **DNS Zone (Ζώνη DNS)**.
2. Add each record from Resend **exactly** as shown (Name + Type + Value).
3. ⚠️ Do **not** touch the existing root `MX` (`mail-gr.securemail.pro`), the
   root SPF (`v=spf1 a mx include:spf.webapps.net ~all`), the `_dmarc` TXT, or
   the Google verification TXT. You're only **adding** Resend's records.
4. Save, then click **Verify** in Resend (DNS can take 15 min – a few hours).

## Step 3 — Get SMTP credentials

In Resend → **SMTP** (or **API Keys** → create one for SMTP). You'll get:
- Host: `smtp.resend.com`
- Port: `465` (SSL) or `587` (STARTTLS)
- Username: `resend`
- Password: your API key (`re_...`) — **treat as a secret; dashboard only.**

## Step 4 — Point Supabase at Resend

Supabase → **Project → Authentication → Emails → SMTP Settings** → **Enable
custom SMTP**:
- Sender email: `noreply@resizepack.tech`
- Sender name: `ResizePack`
- Host / Port / Username / Password: from Step 3
- Save. Send a test if offered.

## Step 5 — Paste the branded templates

Supabase → **Authentication → Emails → Templates**. For **Confirm signup**,
**Reset password**, and **Magic Link**, replace the default HTML with the blocks
below. They keep Supabase's `{{ .ConfirmationURL }}` variable, use a text
wordmark (so they render in every client — no blocked images), and match the
Print Studio palette.

> Subjects: Confirm → `Confirm your ResizePack email` · Reset →
> `Reset your ResizePack password` · Magic Link → `Your ResizePack sign-in link`

### Confirm signup

```html
<div style="background:#f1e9da;padding:32px 0;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center">
    <table width="480" cellpadding="0" cellspacing="0" role="presentation" style="background:#fbf7ee;border:1px solid #ddd1bb;border-radius:14px;overflow:hidden;">
      <tr><td style="height:4px;background:#c2471a;font-size:0;line-height:0;">&nbsp;</td></tr>
      <tr><td style="padding:28px 32px 4px;">
        <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-weight:700;font-size:22px;color:#221d16;">ResizePack</p>
      </td></tr>
      <tr><td style="padding:8px 32px 28px;">
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#221d16;">Confirm your email</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#5a5145;">Thanks for signing up for ResizePack. Confirm your email address to activate your account.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#c2471a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:9px;">Confirm email</a>
        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#5a5145;">If the button doesn't work, copy this link:<br><span style="color:#9b3712;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
        <p style="margin:22px 0 0;font-size:12px;color:#8c8270;border-top:1px solid #e7ddca;padding-top:16px;">If you didn't create a ResizePack account, you can ignore this email.</p>
      </td></tr>
    </table>
  </td></tr></table>
</div>
```

### Reset password

Same block as above with the middle section swapped to:

```html
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#221d16;">Reset your password</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#5a5145;">We received a request to reset your ResizePack password. Click below to choose a new one. This link expires soon.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#c2471a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:9px;">Reset password</a>
        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#5a5145;">If the button doesn't work, copy this link:<br><span style="color:#9b3712;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
        <p style="margin:22px 0 0;font-size:12px;color:#8c8270;border-top:1px solid #e7ddca;padding-top:16px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
```

### Magic Link

Same block with:

```html
        <h1 style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:24px;color:#221d16;">Your sign-in link</h1>
        <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#5a5145;">Click below to sign in to ResizePack.</p>
        <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#c2471a;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:9px;">Sign in</a>
        <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#5a5145;">If the button doesn't work, copy this link:<br><span style="color:#9b3712;word-break:break-all;">{{ .ConfirmationURL }}</span></p>
        <p style="margin:22px 0 0;font-size:12px;color:#8c8270;border-top:1px solid #e7ddca;padding-top:16px;">If you didn't request this, you can ignore this email.</p>
```

## Step 6 — Verify

Trigger a real **signup confirm** and a **password reset** (`/login` → Forgot
password). Both should arrive from `noreply@resizepack.tech`, branded, and land
in the inbox (not spam). If they hit spam, double-check DKIM/SPF verified green
in Resend.
