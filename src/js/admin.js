// ── ADMIN.JS — CMS · Login · Membres · Artistes ──────────────

import { db, storage }   from '../config/firebase.js';
import { artistes }      from '../config/data.js';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL }
  from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const SHEETDB_URL  = import.meta.env?.VITE_SHEETDB_URL  || '';
const ADMIN_EMAIL  = import.meta.env?.VITE_ADMIN_EMAIL  || '';
const ADMIN_HASH   = import.meta.env?.VITE_ADMIN_HASH   || '';

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
    sessionStorage.setItem('amc_admin_session', '1');
    window.navigate?.('admin');
  } else {
    alert('Identifiants incorrects.');
  }
}

export function adminLogout() {
  sessionStorage.removeItem('amc_admin_session');
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

// ── ARTISTES ──────────────────────────────────────────────────
export async function cmsAddArtiste() {
  const name = document.getElementById('cms-art-name')?.value;
  const job  = document.getElementById('cms-art-job')?.value;
  const bio  = document.getElementById('cms-art-bio')?.value;
  const file = document.getElementById('cms-art-img')?.files[0];
  if (!name || !job) return alert('Nom et Discipline requis.');

  const btn = document.querySelector('#tab-artistes .btn-primary');
  const originalText = btn.textContent;
  btn.textContent = 'Envoi...';
  btn.disabled = true;

  try {
    let url = '/AMCC/logo.png';
    if (file) {
      const sRef = ref(storage, `artistes/${Date.now()}_${file.name}`);
      const snap = await uploadBytes(sRef, file);
      url = await getDownloadURL(snap.ref);
    }
    await addDoc(collection(db, 'artistes'), { 
      name, job, bio, imageUrl: url, createdAt: serverTimestamp() 
    });
    alert('Artiste ajouté !');
    document.getElementById('cms-art-name').value = '';
    document.getElementById('cms-art-job').value = '';
    document.getElementById('cms-art-bio').value = '';
    loadArtistes();
  } catch (err) { 
    console.error(err);
    alert('Erreur Firebase.'); 
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

export function loadArtistes() {
  renderArtistesGrid(artistes);
}

export function renderArtistesGrid(list) {
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
             onerror="this.src='/AMCC/logo.png'; this.style.opacity='0.4';">
        <div class="artiste-overlay"></div>
      </div>
      <div class="artiste-body">
        <h3 class="artiste-name">${escHtml(a.nom)}</h3>
        <p class="artiste-discipline">${escHtml(a.discipline)}</p>
        <p class="artiste-bio">${escHtml(a.bio)}</p>
      </div>
    </div>`).join('');
}

export function exportCSV() {
  alert('Export CSV indisponible en mode démo.');
}
