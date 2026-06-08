// ── NAV.JS — Navigation SPA · Menu mobile · Scroll · Thème ──

import { observeReveal, renderEvents, renderExposants } from './ui.js';
import { adminRefresh, loadArtistes }  from './admin.js';
import { renderGalerie } from './galerie.js';
import { initPayPal }    from './paypal.js';

// ── NAVIGATE (SPA) ────────────────────────────────────────────
// Les pages sont déjà injectées dans le DOM au build — pas de fetch nécessaire.
export function navigate(page) {
  if (page === 'admin' && !sessionStorage.getItem('amc_admin_session')) {
    page = 'admin-login';
  }

  // Masquer toutes les pages, afficher la cible
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (!target) { console.error('Page introuvable dans le DOM:', page); return; }
  target.classList.add('active');

  // Nav active
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    observeReveal();
    try {
      if (page === 'admin')       adminRefresh();
      if (page === 'partenaires') loadArtistes();
      if (page === 'evenements')  renderEvents('tous');
      if (page === 'festival')    renderExposants();
      if (page === 'galerie')     renderGalerie();
      if (['don', 'festival', 'paiement'].includes(page)) initPayPal();
    } catch (err) { console.warn('Init error on page', page, err); }
  }, 100);
}

// ── MOBILE MENU ───────────────────────────────────────────────
export function openMobile() {
  document.getElementById('mobileMenu')?.classList.add('open');
}
export function closeMobile() {
  document.getElementById('mobileMenu')?.classList.remove('open');
}

// ── SCROLL → nav.scrolled ─────────────────────────────────────
export function initNavScroll() {
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('mainNav');
    if (nav) nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ── THÈME CLAIR / SOMBRE ──────────────────────────────────────
export function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('amc_theme', isLight ? 'light' : 'dark');
}

export function applyStoredTheme() {
  if (localStorage.getItem('amc_theme') === 'light') {
    document.body.classList.add('light-theme');
  }
}
