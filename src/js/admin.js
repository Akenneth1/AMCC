// ── ADMIN.JS — CMS · Login · Membres · Artistes ──────────────

import { db }         from '../config/firebase.js';
import { artistes }   from '../config/data.js';
import * as XLSX from 'xlsx';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// URL de l'API PHP artistes (même domaine OVH)
const API_ARTISTES = './api/artistes.php';
const API_GALERIE  = './api/galerie.php';
const API_PARTENAIRES = './api/partenaires.php';

const SHEETDB_URL = import.meta.env?.VITE_SHEETDB_URL
  || (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'https://sheetdb.io/api/v1/yf325l4woltxi'
      : './api/sheetdb.php');
const ADMIN_EMAIL = import.meta.env?.VITE_ADMIN_EMAIL  || 'contact@artmodeetculture.com';
const ADMIN_HASH  = import.meta.env?.VITE_ADMIN_HASH   || '6e2ae6d2dd300f8b08027a1ef2bfdfe324286ce12380abf13db7a183746d4d2d';

function isFirebaseReady() {
  return import.meta.env?.VITE_FIREBASE_API_KEY &&
         import.meta.env.VITE_FIREBASE_API_KEY !== 'votre_api_key';
}

async function hashString(str) {
  if (!str) return '';
  const data = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function escHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function normalizeMember(item) {
  if (!item || typeof item !== 'object') return {};
  return {
    id: item.id || item._id || item.email || item.Email || '',
    nom: item.nom || item.Nom || '',
    email: item.email || item.Email || '',
    tel: item.tel || item.telephone || item.Telephone || item['Téléphone'] || '',
    ville: item.ville || item.Ville || '',
    dateNaissance: item.dateNaissance || item['Date de naissance'] || item['Date de naissance'] || item.date_naissance || '',
    profil: item.profil || item.Profil || '',
    paiement: item.paiement || item.Paiement || '',
    statut: item.statut || item.Statut || '',
    message: item.message || item.Message || '',
    dateInscription: item.dateInscription || item['Date d\'inscription'] || item['Date d’inscription'] || item.date_inscription || '',
    type: item.type || item.Type || ''
  };
}

// ── LOGIN ─────────────────────────────────────────────────────
export async function adminLogin() {
  const email   = document.getElementById('adminEmail')?.value?.trim();
  const pwd     = document.getElementById('adminPassword')?.value;
  const pwdHash = await hashString(pwd);

  if (email === ADMIN_EMAIL && pwdHash === ADMIN_HASH) {
    const sessionToken = await hashString(ADMIN_HASH + Date.now().toString().slice(0, -3));
    sessionStorage.setItem('amc_admin_session', sessionToken);
    sessionStorage.setItem('amc_admin_ts', Date.now().toString());
    window.navigate?.('admin');
  } else {
    alert('Identifiants incorrects.');
  }
}

export function adminLogout() {
  sessionStorage.removeItem('amc_admin_session');
  sessionStorage.removeItem('amc_admin_ts');
  window.navigate?.('accueil');
}

// ── MEMBRES ───────────────────────────────────────────────────
export async function adminRefresh() {
  const tbody = document.getElementById('adminTableBody');
  if (!tbody) return;
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Chargement...</td></tr>';

  try {
    let list = [];
    if (isFirebaseReady()) {
      const q    = query(collection(db, 'adherents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    } else {
      const res = await fetch(SHEETDB_URL);
      list = await res.json();
      if (list && list.data) list = list.data;
      if (Array.isArray(list)) list = list.reverse();
    }

    list = list.map(normalizeMember);
    const statEl = document.getElementById('admin-stat-total');
    if (statEl) statEl.textContent = list.length;

    tbody.innerHTML = list.map(a => `
      <tr>
        <td>${escHtml(a.nom)}</td>
        <td>${escHtml(a.profil)}</td>
        <td><span class="admin-badge ${a.statut === 'En attente de paiement' ? 'pending' : 'active'}">${escHtml(a.statut)}</span></td>
        <td style="text-align:right;">
          <button onclick='deleteMember(${JSON.stringify(a.id)})'
            style="background:none;border:none;color:#e55;cursor:pointer;font-size:1.2rem;">🗑️</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4">Erreur BDD</td></tr>';
  }
}

export async function deleteMember(id) {
  if (!id) return alert('Impossible de supprimer : identifiant introuvable.');
  if (!confirm('Supprimer ce membre ?')) return;

  const tryDelete = async (path) => {
    const url = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
      ? `${SHEETDB_URL}/${path}`
      : `${SHEETDB_URL}?path=${path}`;
    const res = await fetch(url, { method: 'DELETE' });
    return res.ok ? res : null;
  };

  try {
    if (isFirebaseReady()) {
      await deleteDoc(doc(db, 'adherents', id));
    } else {
      const encodedId = encodeURIComponent(id);
      const paths = [`email/${encodedId}`, `Email/${encodedId}`];
      let response = null;

      for (const path of paths) {
        response = await tryDelete(path);
        if (response) break;
      }

      if (!response) {
        throw new Error('Suppression impossible. Vérifiez le champ de tri du membre.');
      }
    }

    adminRefresh();
  } catch (err) {
    console.error(err);
    alert(err.message || 'Erreur de suppression.');
  }
}

export function switchAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-cms-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-cms-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  btn?.classList.add('active');
  
  if (tabId === 'members')  adminRefresh();
  if (tabId === 'artistes') loadArtistesAdmin();
  if (tabId === 'partenaires') loadPartenairesAdmin();
  if (tabId === 'galerie')  loadGalerieAdmin();
  if (tabId === 'home')     loadHomeCMS();
}

export function loadHomeCMS() {
  const title = document.getElementById('cms-home-title');
  const sub   = document.getElementById('cms-home-sub');
  if (title) title.value = localStorage.getItem('amc_home_title') || 'Art Mode & Culture';
  if (sub)   sub.value   = localStorage.getItem('amc_home_sub')   || 'L\'art, la mode et la culture au cœur de Lille.';
}

export function cmsUpdateHome() {
  const title = document.getElementById('cms-home-title')?.value;
  const sub   = document.getElementById('cms-home-sub')?.value;
  localStorage.setItem('amc_home_title', title);
  localStorage.setItem('amc_home_sub', sub);
  alert('Accueil mis à jour (Rafraîchir pour voir les changements).');
}

// ── ARTISTES (API PHP OVH) ────────────────────────────────────
export async function cmsAddArtiste() {
  const name = document.getElementById('cms-art-name')?.value?.trim();
  const job  = document.getElementById('cms-art-job')?.value?.trim();
  const bio  = document.getElementById('cms-art-bio')?.value?.trim();
  const file = document.getElementById('cms-art-img')?.files[0];
  if (!name || !job) return alert('Nom et Discipline requis.');

  const btn = document.querySelector('#tab-artistes .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Envoi...'; btn.disabled = true; }

  try {
    const form = new FormData();
    form.append('nom', name);
    form.append('discipline', job);
    form.append('bio', bio || '');
    if (file) form.append('image', file);

    const res = await fetch(API_ARTISTES, {
      method: 'POST',
      headers: { 'X-Admin-Token': ADMIN_HASH },
      body: form
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur ${res.status}`);
    }

    alert('Artiste ajouté avec succès !');
    document.getElementById('cms-art-name').value = '';
    document.getElementById('cms-art-job').value  = '';
    document.getElementById('cms-art-bio').value  = '';
    if (document.getElementById('cms-art-img')) document.getElementById('cms-art-img').value = '';
    loadArtistesAdmin();
  } catch (err) {
    console.error(err);
    alert('Erreur : ' + err.message);
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

export async function deleteArtiste(id) {
  if (!confirm('Supprimer cet artiste ?')) return;
  try {
    const res = await fetch(`${API_ARTISTES}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': ADMIN_HASH }
    });
    if (!res.ok) throw new Error('Erreur serveur');
    loadArtistesAdmin();
  } catch (err) { alert('Erreur suppression : ' + err.message); }
}

export async function cmsAddPartenaireLogo() {
  const nom = document.getElementById('cms-partner-name')?.value?.trim();
  const url = document.getElementById('cms-partner-url')?.value?.trim() || '';
  const file = document.getElementById('cms-partner-logo')?.files[0];
  if (!nom || !file) return alert('Nom de l\'entreprise et logo requis.');

  const btn = document.querySelector('#tab-partenaires .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Upload...'; btn.disabled = true; }

  try {
    const form = new FormData();
    form.append('nom', nom);
    form.append('url', url);
    form.append('logo', file);

    const res = await fetch(API_PARTENAIRES, {
      method: 'POST',
      headers: { 'X-Admin-Token': ADMIN_HASH },
      body: form
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur ${res.status}`);
    }

    alert('Logo partenaire ajouté !');
    document.getElementById('cms-partner-name').value = '';
    document.getElementById('cms-partner-url').value = '';
    document.getElementById('cms-partner-logo').value = '';
    loadPartenairesAdmin();
  } catch (err) {
    console.error(err);
    alert('Erreur : ' + err.message);
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

export async function deletePartenaireLogo(id) {
  if (!confirm('Supprimer ce logo partenaire ?')) return;
  try {
    const res = await fetch(`${API_PARTENAIRES}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': ADMIN_HASH }
    });
    if (!res.ok) throw new Error('Erreur serveur');
    loadPartenairesAdmin();
  } catch (err) { alert('Erreur suppression : ' + err.message); }
}

export async function cmsAddGalerieItem() {
  const file = document.getElementById('cms-gal-img')?.files[0];
  const posterFile = document.getElementById('cms-gal-poster')?.files[0];
  const alt  = document.getElementById('cms-gal-alt')?.value?.trim() || '';
  const cat  = document.getElementById('cms-gal-cat')?.value || 'public';
  if (!file) return alert('Choisissez un fichier image ou vidéo pour la galerie.');

  const btn = document.querySelector('#tab-galerie .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Upload...'; btn.disabled = true; }

  try {
    const form = new FormData();
    form.append('media', file);
    if (posterFile) form.append('poster', posterFile);
    form.append('categorie', cat);
    form.append('alt', alt);

    const res = await fetch(API_GALERIE, {
      method: 'POST',
      headers: { 'X-Admin-Token': ADMIN_HASH },
      body: form
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Erreur serveur ${res.status}`);
    }

    alert('Élément ajouté à la galerie !');
    document.getElementById('cms-gal-img').value = '';
    document.getElementById('cms-gal-poster').value = '';
    document.getElementById('cms-gal-alt').value = '';
    document.getElementById('cms-gal-cat').value = 'public';
    loadGalerieAdmin();
  } catch (err) {
    console.error(err);
    alert('Erreur : ' + err.message);
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

export async function deleteGalerieItem(id) {
  if (!confirm('Supprimer cet élément de la galerie ?')) return;
  try {
    const res = await fetch(`${API_GALERIE}?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Token': ADMIN_HASH }
    });
    if (!res.ok) throw new Error('Erreur serveur');
    loadGalerieAdmin();
  } catch (err) { alert('Erreur suppression : ' + err.message); }
}

async function fetchAllArtistes() {
  try {
    const res     = await fetch(API_ARTISTES);
    const dynamic = res.ok ? await res.json() : [];
    return [
      ...artistes,
      ...dynamic.filter(d => !artistes.find(s => s.nom === d.nom))
    ];
  } catch {
    return [...artistes];
  }
}

// Page publique partenaires — sans bouton supprimer
let currentArtistes = [];
let currentArtisteCat = 'tous';

function slugifyCategory(value) {
  return String(value || '')
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s*·\s*/g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function getArtisteCategory(artiste) {
  if (artiste.cat) return artiste.cat;
  const discipline = String(artiste.discipline || '').toLowerCase();
  if (/\b(chanteur|chanteuse|chant|chanson|interpr[eè]te|lyrique|afropop|afro-soul|bikutsi|soul)\b/.test(discipline)) {
    return 'chanteurs';
  }
  if (/\b(mode|styliste|fashion|designer|mannequin|haut-de-gamme|créateur|créatrice)\b/.test(discipline)) {
    return 'mode';
  }
  const parts = String(artiste.discipline || '').split('·').map(p => p.trim()).filter(Boolean);
  return slugifyCategory(parts[0] || discipline || 'autres') || 'autres';
}

function formatCategoryLabel(cat) {
  if (!cat || cat === 'tous') return 'Tous';
  if (cat === 'chanteurs') return 'Chanteurs/Chanteuses';
  if (cat === 'mode') return 'Mode';
  return cat.split(/[-\s]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function buildArtisteFilterButtons(selectedCat = 'tous') {
  const bar = document.getElementById('artistes-filter-bar');
  if (!bar) return;

  const categories = new Map();
  categories.set('tous', 'Tous');

  currentArtistes.forEach(a => {
    const cat = getArtisteCategory(a);
    if (!categories.has(cat)) categories.set(cat, formatCategoryLabel(cat));
  });

  const ordered = Array.from(categories.entries()).sort((a, b) => {
    if (a[0] === 'tous') return -1;
    if (b[0] === 'tous') return 1;
    if (a[0] === 'chanteurs') return b[0] === 'chanteurs' ? 0 : -1;
    if (a[0] === 'mode') return b[0] === 'mode' ? 0 : -1;
    if (b[0] === 'chanteurs' || b[0] === 'mode') return 1;
    return a[1].localeCompare(b[1], 'fr', { sensitivity: 'base' });
  });

  bar.innerHTML = ordered.map(([key, label]) => `
    <button class="filter-btn${key === selectedCat ? ' active' : ''}" role="tab" onclick="filterArtistes('${key}', this)">${label}</button>
  `).join('');
}

export function filterArtistes(cat, btn) {
  if (!currentArtistes.length) return;
  currentArtisteCat = cat;
  document.querySelectorAll('#artistes-filter-bar .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const filtered = currentArtistes.filter(a => cat === 'tous' || getArtisteCategory(a) === cat);
  renderArtistesGrid(filtered, false);
}

export async function loadArtistes() {
  const grid = document.getElementById('artistes-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:40px 0;">Chargement...</p>';
  currentArtistes = await fetchAllArtistes();
  currentArtisteCat = 'tous';
  buildArtisteFilterButtons(currentArtisteCat);
  renderArtistesGrid(currentArtistes, false);
}

export async function loadArtistesAdmin() {
  const list = document.getElementById('cms-artistes-list');
  if (!list) return;
  list.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px 0;">Chargement...</p>';
  const all = await fetchAllArtistes();
  if (all.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--muted);">Aucun artiste enregistré.</p>';
    return;
  }
  list.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:16px; margin-top:16px;">
      ${all.map(a => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(200,169,107,0.15); padding:16px;">
          <img src="${a.img}" alt="${escHtml(a.nom)}"
               style="width:100%; height:140px; object-fit:cover; margin-bottom:10px;"
               onerror="this.src='/logo.png'; this.style.opacity='0.4';">
          <p style="font-family:'Cormorant Garamond',serif; font-size:1rem; color:var(--gold); margin:0 0 4px;">${escHtml(a.nom)}</p>
          <p style="font-size:0.72rem; color:var(--muted); margin:0 0 10px;">${escHtml(a.discipline)}</p>
          ${a.id ? `<button onclick="deleteArtiste('${escHtml(a.id)}')"
            style="width:100%;background:none;border:1px solid #e55;color:#e55;padding:6px;cursor:pointer;font-size:0.72rem;">
            Supprimer</button>` : '<p style="font-size:0.68rem;color:var(--muted);">Artiste statique</p>'}
        </div>`).join('')}
    </div>`;
}

// Panel admin — avec bouton supprimer
export async function loadGalerieAdmin() {
  const list = document.getElementById('cms-galerie-list');
  if (!list) return;
  list.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px 0;">Chargement...</p>';
  const all = await fetchAllGalerieItems();
  if (all.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--muted);">Aucun élément de galerie enregistré.</p>';
    return;
  }
  list.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:16px; margin-top:16px;">
      ${all.map(a => {
        const preview = (a.type === 'video' ? (a.poster || '/logo.png') : a.src) || '/logo.png';
        const badge = a.type === 'video' ? '<span style="position:absolute; top:12px; left:12px; background:rgba(0,0,0,0.7); color:#fff; padding:4px 8px; border-radius:999px; font-size:0.7rem;">Vidéo</span>' : '';
        return `
        <div style="position:relative; background:rgba(255,255,255,0.03); border:1px solid rgba(200,169,107,0.15); padding:16px;">
          ${badge}
          <img src="${preview}" alt="${escHtml(a.alt)}"
               style="width:100%; height:140px; object-fit:cover; margin-bottom:10px;"
               onerror="this.src='/logo.png'; this.style.opacity='0.4';">
          <p style="font-family:'Cormorant Garamond',serif; font-size:1rem; color:var(--gold); margin:0 0 4px;">${escHtml(a.categorie)}</p>
          <p style="font-size:0.72rem; color:var(--muted); margin:0 0 10px;">${escHtml(a.alt)}</p>
          ${a.id ? `<button onclick="deleteGalerieItem('${escHtml(a.id)}')"
            style="width:100%;background:none;border:1px solid #e55;color:#e55;padding:6px;cursor:pointer;font-size:0.72rem;">
            Supprimer</button>` : ''}
        </div>`;
      }).join('')}
    </div>`;
}

function normalizePartenaireLogo(item) {
  return {
    id: item.id || '',
    nom: item.nom || item.name || '',
    url: item.url || item.lien || '',
    logo: item.logo || item.src || item.img || '',
    createdAt: item.createdAt || ''
  };
}

function isHttpUrl(url) {
  return /^https?:\/\//i.test(String(url || '').trim());
}

async function fetchAllPartenaireLogos() {
  try {
    const res = await fetch(API_PARTENAIRES);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizePartenaireLogo) : [];
  } catch {
    return [];
  }
}

export async function loadPartenairesAdmin() {
  const list = document.getElementById('cms-partenaires-list');
  if (!list) return;
  list.innerHTML = '<p style="text-align:center; color:var(--muted); padding:20px 0;">Chargement...</p>';
  const all = await fetchAllPartenaireLogos();
  if (all.length === 0) {
    list.innerHTML = '<p style="text-align:center; color:var(--muted);">Aucun logo partenaire enregistré.</p>';
    return;
  }

  list.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px,1fr)); gap:16px; margin-top:16px;">
      ${all.map(p => `
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(200,169,107,0.15); padding:16px;">
          <div style="height:120px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.04); margin-bottom:10px;">
            <img src="${escHtml(p.logo)}" alt="${escHtml(p.nom)}"
                 style="max-width:86%; max-height:86%; object-fit:contain;"
                 onerror="this.src='/logo.png'; this.style.opacity='0.4';">
          </div>
          <p style="font-family:'Cormorant Garamond',serif; font-size:1rem; color:var(--gold); margin:0 0 4px;">${escHtml(p.nom)}</p>
          <p style="font-size:0.72rem; color:var(--muted); margin:0 0 10px; overflow-wrap:anywhere;">${escHtml(p.url)}</p>
          ${p.id ? `<button onclick="deletePartenaireLogo('${escHtml(p.id)}')"
            style="width:100%;background:none;border:1px solid #e55;color:#e55;padding:6px;cursor:pointer;font-size:0.72rem;">
            Supprimer</button>` : ''}
        </div>`).join('')}
    </div>`;
}

function renderPartenaireLogoItem(partenaire) {
  const logo = escHtml(partenaire.logo || '/logo.png');
  const nom = escHtml(partenaire.nom || 'Partenaire AMC');
  const content = `
    <span class="partenaire-logo-card">
      <img src="${logo}" alt="${nom}" loading="lazy" onerror="this.src='/logo.png'; this.style.opacity='0.45';">
      <span>${nom}</span>
    </span>`;

  if (!isHttpUrl(partenaire.url)) return content;
  return `<a class="partenaire-logo-link" href="${escHtml(partenaire.url)}" target="_blank" rel="noopener">${content}</a>`;
}

export async function loadPartenaireLogos() {
  const track = document.getElementById('partenaires-logo-track');
  if (!track) return;
  track.innerHTML = '<div class="partenaires-logo-row"><span class="partenaires-empty">Chargement des partenaires...</span></div>';

  const logos = await fetchAllPartenaireLogos();
  if (!logos.length) {
    track.classList.add('is-static');
    track.innerHTML = '<div class="partenaires-logo-row"><span class="partenaires-empty">Les logos des entreprises partenaires seront bientôt ajoutés ici.</span></div>';
    return;
  }

  const row = logos.map(renderPartenaireLogoItem).join('');
  track.classList.toggle('is-static', logos.length < 2);
  track.innerHTML = `
    <div class="partenaires-logo-row">${row}</div>
    ${logos.length > 1 ? `<div class="partenaires-logo-row" aria-hidden="true">${row}</div>` : ''}`;
}

async function fetchAllGalerieItems() {
  try {
    const res = await fetch(API_GALERIE);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export function renderArtistesGrid(list, showDelete = false) {
  const grid = document.getElementById('artistes-grid');
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:80px 0;">Les collaborateurs seront bientôt présentés ici.</p>';
    return;
  }
  grid.innerHTML = list.map(a => `
    <div class="artiste-card reveal visible">
      <div class="artiste-img">
        <img src="${a.img}" alt="${escHtml(a.nom)}" loading="lazy"
             onerror="this.src='/logo.png'; this.style.opacity='0.4';">
        <div class="artiste-overlay"></div>
      </div>
      <div class="artiste-body">
        <h3 class="artiste-name">${escHtml(a.nom)}</h3>
        <p class="artiste-discipline">${escHtml(a.discipline)}</p>
        <p class="artiste-bio">${escHtml(a.bio)}</p>
        ${showDelete && a.id ? `<button onclick="deleteArtiste('${escHtml(a.id)}')"
          style="margin-top:12px;background:none;border:1px solid #e55;color:#e55;padding:6px 14px;cursor:pointer;font-size:0.75rem;">
          Supprimer</button>` : ''}
      </div>
    </div>`).join('');
}

export async function exportCSV() {
  try {
    let list = [];
    if (isFirebaseReady()) {
      const q = query(collection(db, 'adherents'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
    } else {
      const res = await fetch(SHEETDB_URL);
      if (!res.ok) throw new Error('Impossible de récupérer les données.');
      list = await res.json();
      if (list && list.data) list = list.data;
      if (!Array.isArray(list)) throw new Error('Format de données inattendu.');
      list = list.reverse();
    }

    list = list.map(normalizeMember);
    const rows = list.filter(item => item.profil || item.type === 'adhesion');
    if (!rows.length) {
      return alert('Aucun adhérent trouvé pour l\'export.');
    }

    const headers = [
      'Nom', 'Email', 'Téléphone', 'Ville', 'Date de naissance', 'Profil',
      'Paiement', 'Statut', 'Message', 'Date d\'inscription'
    ];

    const worksheetData = rows.map(item => ({
      Nom: item.nom,
      Email: item.email,
      Téléphone: item.tel || item.telephone,
      Ville: item.ville,
      'Date de naissance': item.dateNaissance || item.date_naissance,
      Profil: item.profil,
      Paiement: item.paiement,
      Statut: item.statut,
      Message: item.message || item.motif || '',
      'Date d\'inscription': item.dateInscription || item.date_inscription || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Adhérents');
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'adherents_amc.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert('Erreur lors de l\'export. Vérifiez que SheetDB est accessible.');
  }
}


