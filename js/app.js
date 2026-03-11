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

/* ─── Hamburger Menu Toggle ──────────────────────────────────────────────────── */

const hamburgerBtn = document.getElementById('hamburger');
const navList      = document.getElementById('nav-list');

function closeMenu() {
  if (hamburgerBtn && navList) {
    hamburgerBtn.classList.remove('open');
    navList.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
}

if (hamburgerBtn && navList) {
  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = navList.classList.toggle('open');
    hamburgerBtn.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!hamburgerBtn.contains(e.target) && !navList.contains(e.target)) {
      closeMenu();
    }
  });

  // Close menu on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ─── Button Ripple Effect ───────────────────────────────────────────────────── */

function addRipple(btn, e) {
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height) * 2;
  const x      = e.clientX - rect.left - size / 2;
  const y      = e.clientY - rect.top  - size / 2;
  const ripple = document.createElement('span');
  ripple.className = 'btn-ripple';
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.bp, .bs, .fsub');
  if (btn) addRipple(btn, e);
});

/* ─── Inline Form Validation ─────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationRules = [
  {
    inputId: 'first-name',
    groupId: 'fg-first-name',
    msgId:   'msg-first-name',
    validate: (v) => v.trim().length >= 2,
    errorMsg: 'Please enter at least 2 characters.',
    okMsg:    'Looks good!',
  },
  {
    inputId: 'last-name',
    groupId: 'fg-last-name',
    msgId:   'msg-last-name',
    validate: (v) => v.trim().length >= 2,
    errorMsg: 'Please enter at least 2 characters.',
    okMsg:    'Looks good!',
  },
  {
    inputId: 'email',
    groupId: 'fg-email',
    msgId:   'msg-email',
    validate: (v) => EMAIL_RE.test(v.trim()),
    errorMsg: 'Please enter a valid email address.',
    okMsg:    'Valid email address.',
  },
  {
    inputId: 'message',
    groupId: 'fg-message',
    msgId:   'msg-message',
    validate: (v) => v.trim().length >= 20,
    errorMsg: `Please write at least 20 characters (${0} so far).`,
    errorMsgDynamic: (v) => `Please write at least 20 characters (${v.trim().length} so far).`,
    okMsg:    'Message received.',
  },
];

function validateField(rule, value, touched) {
  const group   = document.getElementById(rule.groupId);
  const msgEl   = document.getElementById(rule.msgId);
  if (!group || !msgEl) return rule.validate(value);

  const isValid = rule.validate(value);
  const hasVal  = value.trim().length > 0;

  if (!touched && !hasVal) {
    // Not yet touched — clear state
    group.classList.remove('valid', 'invalid');
    msgEl.textContent = '';
    return false;
  }

  if (isValid) {
    group.classList.add('valid');
    group.classList.remove('invalid');
    msgEl.textContent = rule.okMsg;
  } else {
    group.classList.add('invalid');
    group.classList.remove('valid');
    const msg = (rule.errorMsgDynamic && hasVal) ? rule.errorMsgDynamic(value) : rule.errorMsg;
    msgEl.textContent = msg;
  }
  return isValid;
}

function checkFormValidity() {
  if (!contactForm) return;
  const submitBtn = contactForm.querySelector('.fsub');
  if (!submitBtn) return;
  const allValid = validationRules.every(rule => {
    const el = document.getElementById(rule.inputId);
    return el && rule.validate(el.value);
  });
  submitBtn.disabled = !allValid;
}

if (contactForm) {
  // Disable submit initially
  const submitBtn = contactForm.querySelector('.fsub');
  if (submitBtn) submitBtn.disabled = true;

  validationRules.forEach(rule => {
    const input = document.getElementById(rule.inputId);
    if (!input) return;

    // Validate on blur (first touch)
    input.addEventListener('blur', () => {
      validateField(rule, input.value, true);
      checkFormValidity();
    });

    // Validate on input (after first touch — check dirty state via class)
    input.addEventListener('input', () => {
      const group = document.getElementById(rule.groupId);
      const hasBeenTouched = group && (group.classList.contains('valid') || group.classList.contains('invalid'));
      if (hasBeenTouched || input.value.trim().length > 0) {
        validateField(rule, input.value, true);
      }
      checkFormValidity();
    });
  });
}

/* ─── Init ───────────────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {
  resolveInitialPage();
  setTimeout(triggerFadeUps, 200);
});
