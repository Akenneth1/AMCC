// ── ADMIN.JS — CMS · Login · Membres · Artistes ──────────────

import { db }         from '../config/firebase.js';
import { artistes }   from '../config/data.js';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// URL de l'API PHP artistes (même domaine OVH)
const API_ARTISTES = './api/artistes.php';

const SHEETDB_URL = import.meta.env?.VITE_SHEETDB_URL || 'https://sheetdb.io/api/v1/yf325l4woltxi';
const ADMIN_EMAIL = import.meta.env?.VITE_ADMIN_EMAIL  || 'artmodeculture@gmail.com';
const ADMIN_HASH  = import.meta.env?.VITE_ADMIN_HASH   || '43151764bcdfc907da60f13d47fc166768829be22a13bacbc51c46256f61a78b';

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
      if (Array.isArray(list)) list = list.reverse();
    }

    const statEl = document.getElementById('admin-stat-total');
    if (statEl) statEl.textContent = list.length;

    tbody.innerHTML = list.map(a => `
      <tr>
        <td>${escHtml(a.nom)}</td>
        <td>${escHtml(a.profil)}</td>
        <td><span class="admin-badge ${a.statut === 'En attente de paiement' ? 'pending' : 'active'}">${escHtml(a.statut)}</span></td>
        <td style="text-align:right;">
          <button onclick="deleteMember('${escHtml(a.id || a.email)}')"
            style="background:none;border:none;color:#e55;cursor:pointer;font-size:1.2rem;">🗑️</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4">Erreur BDD</td></tr>';
  }
}

export async function deleteMember(id) {
  if (!confirm('Supprimer ce membre ?')) return;
  try {
    if (isFirebaseReady()) {
      await deleteDoc(doc(db, 'adherents', id));
    } else {
      await fetch(`${SHEETDB_URL}/email/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }
    adminRefresh();
  } catch { alert('Erreur.'); }
}

export function switchAdminTab(tabId, btn) {
  document.querySelectorAll('.admin-cms-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.admin-cms-btn').forEach(b => b.classList.remove('active'));
  const target = document.getElementById('tab-' + tabId);
  if (target) target.classList.add('active');
  btn?.classList.add('active');
  
  if (tabId === 'members')  adminRefresh();
  if (tabId === 'artistes') loadArtistes();
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
    loadArtistes();
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
    loadArtistes();
  } catch (err) { alert('Erreur suppression : ' + err.message); }
}

export async function loadArtistes() {
  const grid = document.getElementById('artistes-grid');
  if (!grid) return;
  grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:40px 0;">Chargement...</p>';
  try {
    const res  = await fetch(API_ARTISTES);
    const dynamic = res.ok ? await res.json() : [];
    // Fusion : artistes data.js + artistes ajoutés via CMS
    const all = [
      ...artistes,
      ...dynamic.filter(d => !artistes.find(s => s.nom === d.nom))
    ];
    renderArtistesGrid(all, true);
  } catch {
    renderArtistesGrid(artistes, false);
  }
}

export function renderArtistesGrid(list, showDelete = false) {
  const grid = document.getElementById('artistes-grid');
  if (!grid) return;
  if (!list || list.length === 0) {
    grid.innerHTML = '<p style="text-align:center; color:var(--muted); padding:80px 0;">Les artistes seront bientôt présentés ici.</p>';
    return;
  }
  grid.innerHTML = list.map(a => `
    <div class="artiste-card reveal">
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

export function exportCSV() {
  alert('Export CSV indisponible en mode démo.');
}


