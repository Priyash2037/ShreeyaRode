/**
 * SHREEYA RODE — PORTFOLIO SCRIPT
 */

// --- THEME TOGGLE ---
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

// --- FADE-IN ON LOAD ---
window.addEventListener('DOMContentLoaded', () => {
  const heroElements = document.querySelectorAll('.fade-in-up');
  requestAnimationFrame(() => {
    heroElements.forEach(el => el.classList.add('is-visible'));
  });

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// --- SCROLL REVEAL ---
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- STICKY NAV & ACTIVE LINKS ---
const navHeader = document.getElementById('nav-header');
const navLinks  = document.querySelectorAll('.nav-link[data-section]');

window.addEventListener('scroll', () => {
  if (navHeader) {
    navHeader.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  updateActiveLink();
}, { passive: true });

function updateActiveLink() {
  const scrollY = window.scrollY;
  navLinks.forEach(link => {
    const sectionId = link.getAttribute('data-section');
    const section = document.getElementById(sectionId);
    if (!section) return;

    const buffer = 100;
    if (scrollY >= section.offsetTop - buffer && scrollY < section.offsetTop + section.offsetHeight - buffer) {
      link.classList.add('is-active');
    } else {
      link.classList.remove('is-active');
    }
  });
}
updateActiveLink();

// --- MOBILE MENU ---
const hamburger = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobile-drawer');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');

function toggleMenu() {
  const isOpen = hamburger.classList.contains('is-open');
  if (isOpen) {
    hamburger.classList.remove('is-open');
    mobileDrawer.classList.remove('is-open');
    document.body.style.overflow = '';
  } else {
    hamburger.classList.add('is-open');
    mobileDrawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
}

if (hamburger) {
  hamburger.addEventListener('click', toggleMenu);
}
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (hamburger.classList.contains('is-open')) toggleMenu();
  });
});

// --- SMOOTH SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;
    
    e.preventDefault();
    const navHeight = 70;
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - navHeight,
      behavior: 'smooth',
    });
  });
});

// --- CONTACT FORM ---
const contactForm = document.getElementById('contact-form');
const submitBtn = document.getElementById('contact-submit');
const formStatus = document.getElementById('form-status');
const btnLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formStatus.className = 'form-status';
    formStatus.textContent = '';

    const name = contactForm.querySelector('#contact-name').value.trim();
    const email = contactForm.querySelector('#contact-email').value.trim();
    const message = contactForm.querySelector('#contact-message').value.trim();

    if (!name || !email || !message) {
      showStatus('error', 'Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('error', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          access_key: "YOUR_WEB3FORMS_ACCESS_KEY_HERE",
          name: name,
          email: email,
          subject: contactForm.querySelector('#contact-subject').value.trim() || 'New Contact from Portfolio',
          message: message,
        })
      });

      const result = await response.json();
      if (response.status === 200) {
        showStatus('success', 'Message sent! I will get back to you soon.');
        contactForm.reset();
      } else {
        showStatus('error', result.message || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      showStatus('error', 'Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });
}

function setLoading(loading) {
  if (!submitBtn) return;
  submitBtn.disabled = loading;
  if (btnLabel) btnLabel.textContent = loading ? 'Sending...' : 'Send Message';
}

function showStatus(type, message) {
  formStatus.className = `form-status ${type}`;
  formStatus.textContent = message;
}
