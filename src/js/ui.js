// ── UI.JS — Logo 3D · Liquid bg · Reveal · Counters · Lightbox · Countdown ──

import { evenements, exposants } from '../config/data.js';

// ── RENDER EVENTS ─────────────────────────────────────────────
export function renderEvents(cat = 'tous') {
  const grid = document.getElementById('eventsGrid');
  if (!grid) return;

  // Correction de la logique de filtrage
  // Si cat est 'avenir', on filtre par le tag 'avenir'
  // Sinon, si cat est une année (ex: '2024'), on filtre par l'attribut annee
  const filtered = evenements.filter(e => {
    if (cat === 'tous')   return true;
    if (cat === 'avenir') return e.tag === 'avenir';
    return e.annee === cat; // Filtrage par année exacte
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--text-muted); padding:40px;">Aucun événement pour cette période.</p>';
    return;
  }

  grid.innerHTML = filtered.map(e => `
    <article class="event-card reveal">
      <div class="event-img">
        <img src="${e.img}" alt="${e.titre}" loading="lazy" onerror="this.src='/logo.png';">
        <div class="event-img-overlay"></div>
        <span class="event-tag">${e.tag.toUpperCase()}</span>
      </div>
      <div class="event-body">
        <p class="event-meta">${e.date}</p>
        <h3 class="event-title">${e.titre}</h3>
        <p class="event-desc">${e.desc}</p>
        <button class="event-btn" onclick="navigate('${e.lien || 'evenements'}')">
          ${e.lien ? 'En savoir plus' : 'Détails'} <span>&#8594;</span>
        </button>
      </div>
    </article>
  `).join('');
  
  setTimeout(observeReveal, 100);
}

// ── RENDER EXPOSANTS (Festival) ───────────────────────────────
export function renderExposants() {
  const grid = document.getElementById('exposants-grid');
  if (!grid) return;

  grid.innerHTML = exposants.map(exp => `
    <div class="exposant-card" style="background:rgba(200,169,107,0.04); border:1px solid rgba(200,169,107,0.14); padding:28px; display:flex; flex-direction:column; gap:12px; ${exp.wide ? 'grid-column:span 2' : ''}">
      ${exp.badge ? `<span class="admin-badge active" style="margin-bottom:8px; display:inline-block; align-self:flex-start;">${exp.badge}</span>` : ''}
      <h4 style="font-family:'Cormorant Garamond',serif; font-size:1.3rem; color:var(--gold); margin:0;">${exp.nom}</h4>
      <p style="font-size:0.65rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.1em; margin:0;">${exp.cat}</p>
      <p style="font-size:0.82rem; color:var(--beige); line-height:1.7; margin:0;">${exp.desc}</p>
    </div>
  `).join('');
}

// ── LOGO 3D ───────────────────────────────────────────────────
export function initLogo3D() {
  const wrapper = document.querySelector('.hero-logo-3d-wrapper');
  if (!wrapper) return;
  const img = wrapper.querySelector('img');
  if (!img) return;

  let curX = 0, curY = 0, tgtX = 0, tgtY = 0;

  wrapper.addEventListener('mousemove', (e) => {
    const r = wrapper.getBoundingClientRect();
    tgtX = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -22;
    tgtY = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  22;
  });
  wrapper.addEventListener('mouseleave', () => { tgtX = 0; tgtY = 0; });

  (function tick() {
    curX += (tgtX - curX) * 0.1;
    curY += (tgtY - curY) * 0.1;
    img.style.transform = `perspective(600px) rotateX(${curX}deg) rotateY(${curY}deg)`;
    requestAnimationFrame(tick);
  })();
}

// ── LIQUID GLASS BACKGROUND ───────────────────────────────────
export function initLiquidBg() {
  const orbs = document.querySelectorAll('.liquid-orb');
  if (!orbs.length) return;
  document.addEventListener('mousemove', (e) => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    const my = (e.clientY / window.innerHeight - 0.5) * 2;
    orbs.forEach((orb, i) => {
      const factor = (i + 1) * 8;
      orb.style.transform = `translate(${mx * factor}px, ${my * factor}px)`;
    });
  });
}

// ── REVEAL (Intersection Observer) ───────────────────────────
export function observeReveal() {
  const els = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  els.forEach(el => io.observe(el));
}

// ── COUNTERS ──────────────────────────────────────────────────
export function startCounters() {
  document.querySelectorAll('.counter').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current = 0;
    const step = Math.max(1, Math.floor(target / 60));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current >= 1000 ? (current / 1000).toFixed(1) + 'k+' : current + '+';
      if (current >= target) clearInterval(interval);
    }, 30);
  });
}

// ── LIGHTBOX ─────────────────────────────────────────────────
export function openLightbox(el) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  const cap = document.getElementById('lightboxCaption');
  if (!lb || !img) return;
  const src = el.tagName === 'IMG' ? el : el.querySelector('img');
  img.src = src.src;
  if (cap) cap.textContent = src.alt;
  lb.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

export function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.style.display = 'none';
  document.body.style.overflow = '';
}

// ── FESTIVAL COUNTDOWN ────────────────────────────────────────
export function initFestivalCountdown() {
  const target = new Date('July 11, 2026 10:00:00').getTime();
  const update = () => {
    const diff = target - Date.now();
    if (diff <= 0) return;
    const d = document.getElementById('cd-days');
    const h = document.getElementById('cd-hours');
    const m = document.getElementById('cd-mins');
    const s = document.getElementById('cd-secs');
    if (d) d.textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    if (h) h.textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    if (m) m.textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    if (s) s.textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  };
  setInterval(update, 1000);
  update();
}

// ── FESTIVAL MODAL ────────────────────────────────────────────
export function openFestivalModal() {
  const m = document.getElementById('festivalModal');
  if (m) m.style.display = 'block';
}
export function closeFestivalModal() {
  const m = document.getElementById('festivalModal');
  if (m) m.style.display = 'none';
}


