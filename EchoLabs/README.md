# EchoLabs — marketing site

Fast, fully static, no-build marketing site (vanilla HTML/CSS/JS). Host it on Netlify,
Vercel, GitHub Pages, or Lovable — just upload the folder.

## Pages
| File | Page |
|---|---|
| `index.html` | Home — hero, services, how we work, why EchoLabs, work preview, for creators, CTA |
| `work.html` | Work — intro, selected campaigns, **"Our Work" deck mockup**, (optional videos), CTA |
| `creators.html` | Creator Network — why join, who we look for, **Join form**, FAQ |
| `contact.html` | Contact — **Book-a-call panel**, **Project Inquiry form**, email, WhatsApp, socials |
| `privacy.html` / `terms.html` | Legal |

Shared files: `styles.css`, `app.js`, and **`config.js`** (the one website file you edit).

---

## 1. Fill in `config.js`
- **`CALENDLY_URL`** — your Calendly link. Every "Book a discovery call" button **redirects**
  here in a new tab (no Calendly UI is embedded on the site).
- **`FORM_ENDPOINT`** — the Apps Script URL from §2 (forms fall back to email until set).
- **`EMAIL`** — already `office@echolabs.net.in`.
- **`WHATSAPP`** — `number` (full international, digits only — `91` = India) and the
  pre-filled `message`. Drives the floating WhatsApp button + the Contact-page WhatsApp link.
- **`SOCIAL`** — your LinkedIn and Instagram URLs (icons stay disabled until you add them).
- **`VIDEOS`** — optional Work-page videos; leave empty to hide that section.

> The Calendly link is **also** set once inside `apps-script.gs` (for the thank-you email).

---

## 2. Connect the forms to your Google Sheets — in detail

A plain static website **cannot write to Google Sheets directly**. Google requires an
authenticated, server-side call, and a static page has no server and no credentials. The
standard, free bridge is a **Google Apps Script Web App**: a tiny script that lives inside
your Google account, is allowed to edit your sheets, and exposes one URL the website can POST
to. Here is exactly what happens and what you do.

### What happens at runtime
1. A visitor submits the Join form or the Project Inquiry form.
2. `app.js` validates the fields, then sends a `POST` (URL-encoded form data) to your
   `FORM_ENDPOINT` using `fetch(..., { mode: 'no-cors' })`.
   - *Why `no-cors`:* Apps Script doesn't return CORS headers, so the browser can't read the
     reply. `no-cors` lets the request through anyway; the row is still written. The site then
     shows a success message optimistically. (If the network call throws — e.g. you're
     offline — it falls back to opening the visitor's email client to `office@echolabs.net.in`,
     so a lead is never lost.)
3. The Apps Script `doPost` runs: it reads the fields, decides which sheet, appends a row, and
   sends the thank-you email.

### Step-by-step setup (~5 minutes)
1. **Sign in to the `office@echolabs.net.in` Google account.** This matters — the thank-you
   email is sent *from whichever account owns the script* (see §3).
2. Go to **[script.google.com](https://script.google.com) → New project**.
3. Delete the starter code, **paste all of `apps-script.gs`**, and click **Save** (disk icon).
4. *(Optional sanity check)* In the toolbar choose the function `doGet` and press **Run**.
   Approve the permission prompts the first time (Google will warn it's an unverified app —
   choose *Advanced → Go to project → Allow*). This grants the script access to your Sheets
   and Gmail.
5. Click **Deploy → New deployment**.
   - Click the **gear → Web app**.
   - **Description:** anything (e.g. "EchoLabs leads v1").
   - **Execute as:** **Me** (`office@echolabs.net.in`).
   - **Who has access:** **Anyone**.  ← required so the website (an anonymous visitor) can post.
   - **Deploy**, approve access if asked, then **copy the Web app URL** (ends in `/exec`).
6. Open that URL in a browser. You should see `{"status":"EchoLabs lead endpoint is live"}`.
7. Paste the URL into **`config.js → FORM_ENDPOINT`** and re-upload the site. Done.

> **Whenever you EDIT `apps-script.gs` later**, you must **Deploy → Manage deployments → Edit
> (pencil) → Version: New version → Deploy**. Editing the code alone does **not** update the
> live `/exec` URL. (The URL itself stays the same, so you don't need to touch `config.js` again.)

### Which sheet gets what
Routing is by the **"Creator or Brand?"** field on each form:

| Submission | Sheet | ID (in `apps-script.gs`) |
|---|---|---|
| **Brand** (either form) | "Leads from brands" | `17IAYzZJnjB4TEWMoTJAOrkEYSZHOoTFBFEpfMylYv9M` |
| **Creator** (either form) | "Leads or Inquiries" | `1FcjNPJu12mSf71xqQ29HiHRqyenzhyMR3q-sGiagCg4` |

Columns written (a header row is added automatically on the first submission):
`Timestamp · Type · Name · Company · Phone · Email · Message · Source`

The script must be able to edit both sheets — since you deploy it from
`office@echolabs.net.in`, make sure that account **owns or has edit access** to both
spreadsheets.

---

## 3. The automated thank-you email
After each capture, the script emails the lead a friendly, on-brand thank-you that includes a
**"Book a discovery call"** button linking to your Calendly.

- **Set the Calendly link** at the top of `apps-script.gs` (`CALENDLY_URL`).
- **Sender address:** Apps Script's `MailApp` sends **from the Google account that owns the
  script.** Deploy the script while signed in to **`office@echolabs.net.in`** and the email
  comes from that address automatically. (If you ever must run it from another account, add
  `office@echolabs.net.in` as a verified *Settings → Accounts → Send mail as* alias there, then
  switch `MailApp` to `GmailApp.sendEmail(..., { from: 'office@echolabs.net.in' })`.)
- **Quota:** Gmail allows ~100 emails/day (consumer) or ~1,500/day (Workspace) — ample for leads.
- Email failures never block the sheet write (they're caught and logged).

---

## 4. The "Our Work" deck (mockup)
`work.html` contains a built-in slide carousel (the "Our Work" deck) — a placeholder you can
replace with real case studies. Each slide is a plain `<article class="deck__slide">` inside
`<div class="deck__track">`; edit the copy/metrics directly, add or remove slides freely (the
dots, counter, arrows, keyboard and swipe controls all adapt automatically).

---

## 5. Run it locally
```
python -m http.server 8000
```
then open `http://localhost:8000`.

---

## Notes
- **Book a call → Calendly:** all booking CTAs redirect to `CALENDLY_URL` in a new tab; no
  Calendly UI is embedded on the site.
- **WhatsApp:** floating button on every page + a Contact-page option, both opening
  `wa.me/919829041767` with your pre-filled message.
- **Mobile-friendly & accessible:** responsive across breakpoints, full-screen mobile menu,
  visible focus rings, keyboard-operable nav/forms/deck, and `prefers-reduced-motion` support.
  The signature Echo Cursor is auto-disabled on touch devices.
- The legal pages are **starting templates, not legal advice** — have counsel review them.
- All sample work figures are placeholders for layout; swap in real numbers anytime.
