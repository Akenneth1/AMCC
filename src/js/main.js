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
         renderArtistesGrid, deleteArtiste } from './admin.js';
import { initPayPal }       from './paypal.js';
import { filterGalerie, renderGalerie, renderGalerieHome } from './galerie.js';
import { artistes, evenements } from '../config/data.js';

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
window.deleteArtiste     = deleteArtiste;

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyStoredTheme();
  initNavScroll();
  initLiquidBg();

  navigate('accueil');
  initLogo3D();
  observeReveal();
  renderGalerieHome();
  initFestivalCountdown();

  // Événements accueil — 3 premiers depuis data.js (synchro automatique)
  const accueilGrid = document.getElementById('accueil-events-grid');
  if (accueilGrid) {
    const preview = evenements.slice(0, 3);
    accueilGrid.innerHTML = preview.map(e => `
      <article class="event-card reveal">
        <div class="event-img">
          <img src="${e.img}" alt="${e.titre}" loading="lazy" onerror="this.src='./logo.png';">
          <div class="event-img-overlay"></div>
          <span class="event-tag">${e.tag.toUpperCase()}</span>
        </div>
        <div class="event-body">
          <p class="event-meta">${e.date}</p>
          <h3 class="event-title">${e.titre}</h3>
          <p class="event-desc">${e.desc}</p>
          <button class="event-btn" onclick="navigate('${e.lien || 'evenements'}')">
            En savoir plus <span>&#8594;</span>
          </button>
        </div>
      </article>`).join('');
    observeReveal();
  }

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

  // Initialise PayPal dès que le SDK est disponible (max 10s)
  let paypalAttempts = 0;
  const paypalInterval = setInterval(() => {
    if (window.paypal) { clearInterval(paypalInterval); initPayPal(); return; }
    if (++paypalAttempts > 100) clearInterval(paypalInterval);
  }, 100);
});

