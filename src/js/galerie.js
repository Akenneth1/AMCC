// ── GALERIE.JS — Rendu · Filtrage ────────────────────────────

import { galerieImages } from '../config/data.js';
import { openLightbox }  from './ui.js';

// ── RENDER GALERIE FULL ───────────────────────────────────────
export function renderGalerie() {
  const grid = document.getElementById('galerieGrid');
  if (!grid) return;

  grid.innerHTML = galerieImages.map(img => `
    <div class="galerie-full-item" data-cat="${img.cat}"
         onclick="openLightbox(this)">
      <img src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.src='/amc2/logo.png'; this.style.opacity='0.5';">
      <div class="galerie-full-overlay">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="1.5">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>
    </div>`).join('');
}

// ── FILTER ───────────────────────────────────────────────────
export function filterGalerie(cat, btn) {
  // Gestion des classes active
  document.querySelectorAll('.galerie-cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Filtrage visuel
  document.querySelectorAll('.galerie-full-item').forEach(item => {
    item.style.opacity   = '0';
    item.style.transform = 'scale(0.95)';

    setTimeout(() => {
      // On accepte 'festivals' (HTML) pour 'defiles' ou on harmonise
      // Ici on reste simple : correspondance exacte ou tous
      const itemCat = item.dataset.cat;
      const show = (cat === 'tous') || 
                   (cat === itemCat) || 
                   (cat === 'festivals' && itemCat === 'defiles') ||
                   (cat === 'backstage' && itemCat === 'backstages');
      
      item.style.display = show ? 'block' : 'none';
      if (show) {
        setTimeout(() => {
          item.style.opacity    = '1';
          item.style.transform  = 'scale(1)';
          item.style.transition = 'opacity .3s, transform .3s';
        }, 20);
      }
    }, 150);
  });
}

// ── GALERIE MOSAÏQUE ACCUEIL (statique, 8 images) ────────────
export function renderGalerieHome() {
  const grid = document.querySelector('.galerie-grid');
  if (!grid) return;

  const selection = [
    ...galerieImages.filter(i => i.cat === 'defiles').slice(0, 3),
    ...galerieImages.filter(i => i.cat === 'expositions').slice(0, 2),
    ...galerieImages.filter(i => i.cat === 'concerts').slice(0, 2),
    ...galerieImages.filter(i => i.cat === 'backstages').slice(0, 1),
  ];

  const layouts = ['tall', '', 'wide', '', '', 'tall', '', ''];

  grid.innerHTML = selection.map((img, i) => `
    <div class="galerie-item ${layouts[i] || ''}" onclick="openLightbox(this)">
      <img src="${img.src}" alt="${img.alt}" loading="lazy" onerror="this.src='/amc2/logo.png';">
      <div class="galerie-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="white" stroke-width="1.5">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
        </svg>
      </div>
    </div>`).join('');
}
