# The Strategy Room

Professional website for **The Strategy Room** — behavioral health case management, crisis navigation, and consulting services for families and organizations. Based in St. Louis, MO.

**Live site:** [thestrategyroomstl.com](https://thestrategyroomstl.com) *(update with actual domain)*
**Phone:** [314-737-6044](tel:3147376044)
**Deployed via:** GitHub Pages

---

## Project Structure

```
The-Strategy-Room-/
├── index.html          ← Main SPA (all 6 pages)
├── privacy.html        ← Privacy policy (placeholder — needs legal review)
├── terms.html          ← Terms of service (placeholder — needs legal review)
├── disclaimer.html     ← Service disclaimer (placeholder — needs legal review)
├── css/
│   └── styles.css      ← All styles (extracted + expanded for maintainability)
├── js/
│   └── app.js          ← Navigation, form handling, FAQ accordion
├── assets/             ← Images, OG image (currently empty)
└── .github/
    └── workflows/
        ├── deploy.yml
        └── static.yml  ← Deploys to GitHub Pages on push
```

---

## Tech Stack

- **HTML/CSS/JS** — no framework, no build step
- **Hosting:** GitHub Pages (automatic deploy on push to `main`)
- **Forms:** Formspree (requires configuration — see below)
- **Payments:** Stripe Payment Links (requires configuration — see below)
- **Fonts:** Google Fonts — Cormorant Garamond + DM Sans

---

## Required Configuration (Before Going Live)

### 1. Contact Form — Formspree

The contact form is wired to Formspree for real email delivery. To activate:

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form and copy your endpoint URL (looks like `https://formspree.io/f/abcdefgh`)
3. Open `js/app.js` and replace:
   ```js
   const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
   ```
   with your real endpoint.
4. In the Formspree dashboard, configure email notifications to your inbox.
5. Also update the `action` attribute on the `<form>` in `index.html` to match.

**Also update** the `_next` hidden input in the form to your live domain:
```html
<input type="hidden" name="_next" value="https://YOUR-DOMAIN.com/#contact">
```

---

### 2. Consultation Payment — Stripe Payment Link

The payment button uses a Stripe Payment Link (no backend required).

1. Log into [Stripe Dashboard](https://dashboard.stripe.com/payment-links)
2. Create a payment link for your consultation fee (e.g. $150)
3. Copy the link URL (looks like `https://buy.stripe.com/xxxx`)
4. Open `js/app.js` and replace:
   ```js
   const STRIPE_PAYMENT_LINK = '#';
   ```
   with your real Stripe Payment Link URL.

---

### 3. SEO / Domain

Update the following TODO items with your real domain:

| File | Field | Action |
|---|---|---|
| `index.html` | `<link rel="canonical">` | Set to your live URL |
| `index.html` | `og:url` | Set to your live URL |
| `index.html` | `og:image` | Upload `assets/og-image.jpg` (1200×630px) and set URL |
| `index.html` | `twitter:image` | Same as og:image |
| `index.html` | JSON-LD `@id` and `url` | Set to your live URL |

---

### 4. Analytics

Add your Google Analytics 4 (or Plausible) snippet inside the `<head>` of `index.html` where the analytics comment placeholder is. Example for GA4:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

### 5. Legal Pages (Human Review Required)

`privacy.html`, `terms.html`, and `disclaimer.html` are **placeholder documents**. Before launching, have them reviewed by a licensed attorney familiar with Missouri law and your specific business practices. Flag any HIPAA considerations for engagements involving covered entities.

---

## Development

The site has no build step. Edit files directly and push to deploy.

```bash
# Clone the repo
git clone https://github.com/jacattac314/The-Strategy-Room-

# Open locally
open index.html     # or use a local server:
npx serve .         # or: python3 -m http.server 8000
```

### Navigation System

The site is a single-page application (SPA). Navigation is driven by JavaScript in `js/app.js`. Each "page" is a `<div class="pg" id="p-[key]">` element. The `sp(key)` function shows the requested page and updates the URL hash.

URL hash examples:
- `/` or `/#home` → Home
- `/#about` → About
- `/#svcs` → Services
- `/#fam` → For Families
- `/#org` → For Organizations
- `/#contact` → Contact

### Adding a New Page

1. Add a new `<div class="pg" id="p-newpage">` inside `<main>` in `index.html`
2. Add `'newpage': 'p-newpage'` to `PAGE_MAP` in `js/app.js`
3. Add a nav link: `<button class="nl-item" data-p="newpage" onclick="sp('newpage')">New Page</button>`

---

## Deployment

GitHub Pages deploys automatically from `.github/workflows/static.yml` when changes are pushed to the `main` branch.

```bash
git add .
git commit -m "Your change description"
git push origin main
```

The site will be live at your GitHub Pages URL within ~60 seconds.

---

## Agent Roadmap (Future Iterations)

This repo uses an agent-style development model inspired by the Agent-rest pipeline. Future PRs should follow this priority order:

| PR | Agent Owner | Focus |
|---|---|---|
| PR1 (done) | Trust + Lead Capture | Form, payments, disclaimers, SEO basics |
| PR2 | Site Architect | Multi-page conversion, `sitemap.xml`, `robots.txt` |
| PR3 | SEO + Local | Google Business Profile, local citations, schema depth |
| PR4 | Accessibility + QA | WCAG 2.1 AA audit, keyboard nav, color contrast, screen reader testing |
| PR5 | Conversion Polish | Testimonials, founder photo, credential display, A/B CTAs |

---

## Important Notices

- **Not a crisis service.** If you or someone you know is in immediate danger, call **911**. For 24/7 mental health crisis support, call or text **988**.
- **Not a clinical practice.** Services are advisory/consultative, not clinical treatment. See `disclaimer.html`.
- **Legal review required** before launching: privacy.html, terms.html, disclaimer.html.
- **Do not commit** real Stripe keys or API tokens to this repo.

---

*The Strategy Room — St. Louis, MO — Est. 2023*
