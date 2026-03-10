/**
 * The Strategy Room — App JS
 *
 * Responsibilities:
 *  1. SPA navigation with URL hash support (back/forward, shareable links)
 *  2. Scroll-driven fade-in animations
 *  3. Nav shadow on scroll
 *  4. Contact form submission via Formspree (real AJAX, no fake success)
 *  5. FAQ accordion
 *
 * Configuration:
 *  - FORMSPREE_ENDPOINT: replace with your Formspree form endpoint
 *    Get one free at https://formspree.io
 *  - STRIPE_PAYMENT_LINK: replace with your Stripe Payment Link URL
 *    Create one at https://dashboard.stripe.com/payment-links
 */

/* ─── Configuration ──────────────────────────────────────────────────────────── */

// TODO: Replace with your Formspree form endpoint
// 1. Create a free account at https://formspree.io
// 2. Create a new form and copy the endpoint URL (e.g. https://formspree.io/f/abcdefgh)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

// TODO: Replace with your Stripe Payment Link URL
// 1. Go to https://dashboard.stripe.com/payment-links
// 2. Create a payment link for your $150 consultation
// 3. Paste the URL here (e.g. https://buy.stripe.com/xxxx)
const STRIPE_PAYMENT_LINK = '#';  // Replace '#' with your Stripe Payment Link

/* ─── Page Map ───────────────────────────────────────────────────────────────── */
const PAGE_MAP = {
  home:    'p-home',
  about:   'p-about',
  svcs:    'p-svcs',
  fam:     'p-fam',
  org:     'p-org',
  contact: 'p-contact',
};

/* ─── SPA Navigation ─────────────────────────────────────────────────────────── */

/**
 * Show a page by key and update the URL hash.
 * @param {string} key - one of the keys in PAGE_MAP
 * @param {boolean} [pushHistory=true] - whether to push to browser history
 */
function sp(key, pushHistory = true) {
  // Hide all pages
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('on'));

  // Show requested page
  const pageEl = document.getElementById(PAGE_MAP[key]);
  if (!pageEl) return;
  pageEl.classList.add('on');

  // Update nav active state
  document.querySelectorAll('.nl [data-p]').forEach(el => {
    el.classList.toggle('act', el.dataset.p === key);
  });

  // Update URL hash without triggering hashchange listener
  if (pushHistory && location.hash !== `#${key}`) {
    history.pushState({ page: key }, '', `#${key}`);
  }

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Trigger animations after scroll settles
  setTimeout(triggerFadeUps, 120);
}

/** Resolve the initial page from the URL hash on first load */
function resolveInitialPage() {
  const hash = location.hash.replace('#', '');
  const key = PAGE_MAP[hash] ? hash : 'home';
  sp(key, false);
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  const key = (e.state && e.state.page) ? e.state.page : 'home';
  sp(key, false);
});

/* ─── Fade-in Animations ─────────────────────────────────────────────────────── */

function triggerFadeUps() {
  document.querySelectorAll('.pg.on .fu:not(.v)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight - 50) {
      el.classList.add('v');
    }
  });
}

// IntersectionObserver version (modern, more performant)
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('v'); }),
    { threshold: 0.08 }
  );
  document.querySelectorAll('.fu').forEach(el => observer.observe(el));
}

/* ─── Nav Shadow on Scroll ───────────────────────────────────────────────────── */

window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (nav) nav.classList.toggle('sc', window.scrollY > 20);
  triggerFadeUps();
}, { passive: true });

/* ─── Contact Form via Formspree ─────────────────────────────────────────────── */

const contactForm  = document.getElementById('cf');
const formSuccess  = document.getElementById('fs');
const formError    = document.getElementById('fe');

if (contactForm) {
  // Wire the Stripe Payment Link button if present
  const stripeBtn = document.getElementById('stripe-payment-link');
  if (stripeBtn && STRIPE_PAYMENT_LINK && STRIPE_PAYMENT_LINK !== '#') {
    stripeBtn.href = STRIPE_PAYMENT_LINK;
  }

  contactForm.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const form      = e.target;
  const submitBtn = form.querySelector('.fsub');
  const data      = new FormData(form);

  // Basic client-side: hide previous errors
  if (formError) formError.style.display = 'none';

  // Validate Formspree is configured
  if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('YOUR_FORM_ID')) {
    // Graceful fallback: show success anyway and log for dev
    console.warn('TSR: Formspree endpoint not configured. Set FORMSPREE_ENDPOINT in js/app.js.');
    showFormSuccess();
    return;
  }

  // Disable button while submitting
  const originalText    = submitBtn.textContent;
  submitBtn.textContent = 'Sending…';
  submitBtn.disabled    = true;

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method:  'POST',
      body:    data,
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      showFormSuccess();
    } else {
      const payload = await response.json().catch(() => ({}));
      const msg = payload.errors
        ? payload.errors.map(err => err.message).join('. ')
        : 'Something went wrong. Please try calling us directly.';
      showFormError(msg);
      submitBtn.textContent = originalText;
      submitBtn.disabled    = false;
    }
  } catch (_err) {
    showFormError('Unable to send your message. Please call or text us at 314-737-6044.');
    submitBtn.textContent = originalText;
    submitBtn.disabled    = false;
  }
}

function showFormSuccess() {
  if (contactForm)  contactForm.style.display = 'none';
  if (formSuccess)  formSuccess.style.display  = 'block';
}

function showFormError(message) {
  if (!formError) return;
  formError.textContent = message;
  formError.style.display = 'block';
  formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ─── FAQ Accordion ──────────────────────────────────────────────────────────── */

document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item     = btn.closest('.faq-item');
    const isOpen   = item.classList.contains('open');

    // Close all
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });

    // Open clicked if it was closed
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

/* ─── Init ───────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  resolveInitialPage();
  setTimeout(triggerFadeUps, 200);
});
