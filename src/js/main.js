// ── MAIN.JS — Point d'entrée ─────────────────────────────────

import { navigate, openMobile, closeMobile, initNavScroll,
         toggleTheme, applyStoredTheme } from './nav.js';
import { renderEvents, renderExposants,
         initLogo3D, initLiquidBg, observeReveal, startCounters,
         openLightbox, closeLightbox,
         initFestivalCountdown, openFestivalModal, closeFestivalModal } from './ui.js';
import { submitAdhesion, submitContact } from './forms.js';
import { adminLogin, adminLogout, adminRefresh, deleteMember,
         switchAdminTab, cmsAddArtiste, cmsUpdateHome, exportCSV,
         renderArtistesGrid } from './admin.js';
import { initPayPal }       from './paypal.js';
import { filterGalerie, renderGalerie, renderGalerieHome } from './galerie.js';
import { artistes } from '../config/data.js';

// ── FILTRAGE ÉVÉNEMENTS ───────────────────────────────────────
function filterEvents(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (typeof renderEvents === 'function') renderEvents(cat);
}

// ── MONTANT DON ───────────────────────────────────────────────
window.selectedMontant = 50;
function selectMontant(btn, val) {
  document.querySelectorAll('.montant-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  window.selectedMontant = val;
}

// ── EXPOSITION GLOBALE ────────────────────────────────────────
window.navigate          = navigate;
window.openMobile        = openMobile;
window.closeMobile       = closeMobile;
window.toggleTheme       = toggleTheme;
window.openLightbox      = openLightbox;
window.closeLightbox     = closeLightbox;
window.openFestivalModal = openFestivalModal;
window.closeFestivalModal= closeFestivalModal;
window.filterGalerie     = filterGalerie;
window.filterEvents      = filterEvents;
window.selectMontant     = selectMontant;
window.submitAdhesion    = submitAdhesion;
window.submitContact     = submitContact;
window.adminLogin        = adminLogin;
window.adminLogout       = adminLogout;
window.adminRefresh      = adminRefresh;
window.deleteMember      = deleteMember;
window.switchAdminTab    = switchAdminTab;
window.cmsAddArtiste     = cmsAddArtiste;
window.cmsUpdateHome     = cmsUpdateHome;
window.exportCSV         = exportCSV;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  initNavScroll();
  initLiquidBg();

  // Les pages sont déjà dans le DOM — on active juste l'accueil
  navigate('accueil');
  initLogo3D();
  observeReveal();
  renderGalerieHome();
  initFestivalCountdown();

  // Counters (déclenché quand visible)
  const counterSection = document.querySelector('.chiffres-section');
  if (counterSection) {
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { startCounters(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(counterSection);
  }

  // Artistes accueil — masque la section si aucun artiste configuré
  const section = document.getElementById('section-artistes-home');
  const gridHome = document.getElementById('artistes-grid-home');
  if (artistes.length === 0) {
    if (section) section.style.display = 'none';
  } else {
    const preview = artistes.slice(0, 3);
    if (gridHome) renderArtistesGrid(preview);
  }

  setTimeout(initPayPal, 2000);
});
