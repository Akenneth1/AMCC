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
         renderArtistesGrid, deleteArtiste, loadArtistesAdmin } from './admin.js';
import { initPayPal }       from './paypal.js';
import { filterGalerie, renderGalerie, renderGalerieHome } from './galerie.js';
import { artistes, evenements } from '../config/data.js';

// ── FILTRAGE ÉVÉNEMENTS ───────────────────────────────────────
function filterEvents(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (typeof renderEvents === 'function') renderEvents(cat);
}

function getArtisteCategory(artiste) {
  if (artiste.cat) return artiste.cat;
  const discipline = String(artiste.discipline || '').toLowerCase();
  if (/\b(chanteur|chanteuse|chant|musicien|interpr[eè]te|afropop|afro-soul|bikutsi|lyrique)\b/.test(discipline)) return 'chanteurs';
  if (/\b(mode|styliste|fashion|designer|créateur|créatrice)\b/.test(discipline)) return 'mode';
  return 'autres';
}

function renderArtistes(cat = 'tous') {
  const grid = document.getElementById('artistes-grid');
  if (!grid) return;

  const filtered = artistes.filter(a => {
    if (cat === 'tous') return true;
    return getArtisteCategory(a) === cat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">Aucun artiste dans cette catégorie pour le moment.</p>';
    return;
  }

  grid.innerHTML = filtered.map(a => `
    <div class="artiste-card reveal visible">
      <div class="artiste-img">
        <img src="${a.img}" alt="${a.nom}" loading="lazy" onerror="this.src='./logo.png';">
        <div class="artiste-overlay"></div>
      </div>
      <div class="artiste-body">
        <h3 class="artiste-name">${a.nom}</h3>
        <p class="artiste-discipline">${a.discipline}</p>
        <p class="artiste-bio">${a.bio}</p>
      </div>
    </div>`).join('');

  setTimeout(observeReveal, 100);
}

function filterArtistes(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderArtistes(cat);
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
window.filterArtistes    = filterArtistes;
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
window.loadArtistesAdmin = loadArtistesAdmin;

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

  // Artistes accueil — rend directement dans #artistes-grid-home
  const section  = document.getElementById('section-artistes-home');
  const gridHome = document.getElementById('artistes-grid-home');
  if (artistes.length === 0) {
    if (section) section.style.display = 'none';
  } else if (gridHome) {
    gridHome.innerHTML = artistes.slice(0, 3).map(a => `
      <div class="artiste-card reveal visible">
        <div class="artiste-img">
          <img src="${a.img}" alt="${a.nom}" loading="lazy" onerror="this.src='/logo.png';">
          <div class="artiste-overlay"></div>
        </div>
        <div class="artiste-body">
          <h3 class="artiste-name">${a.nom}</h3>
          <p class="artiste-discipline">${a.discipline}</p>
          <p class="artiste-bio">${a.bio}</p>
        </div>
      </div>`).join('');
  }

  const artistesGrid = document.getElementById('artistes-grid');
  if (artistesGrid) renderArtistes('tous');

  // Initialise PayPal dès que le SDK est disponible (max 10s)
  let paypalAttempts = 0;
  const paypalInterval = setInterval(() => {
    if (window.paypal) { clearInterval(paypalInterval); initPayPal(); return; }
    if (++paypalAttempts > 100) clearInterval(paypalInterval);
  }, 100);
});

