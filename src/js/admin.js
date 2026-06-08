// ── ADMIN.JS — CMS · Login · Membres · Artistes ──────────────

import { db, storage }   from '../config/firebase.js';
import {
  collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL }
  from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

const SHEETDB_URL  = import.meta.env?.VITE_SHEETDB_URL || 'https://sheetdb.io/api/v1/yf325l4woltxi';
const ADMIN_EMAIL  = import.meta.env?.VITE_ADMIN_EMAIL  || 'artmodeculture@gmail.com';
const ADMIN_HASH   = import.meta.env?.VITE_ADMIN_HASH   || '43151764bcdfc907da60f13d47fc166768829be22a13bacbc51c46256f61a78b';

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

export async function loadArtistes() {
  const container = document.getElementById('cms-artistes-list');
  if (!container) return;
  container.innerHTML = '<p style="text-align:center;">Chargement...</p>';
  try {
    const q    = query(collection(db, 'artistes'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    if (snap.empty) {
      container.innerHTML = '<p style="color:var(--muted);text-align:center;">Aucun artiste enregistré.</p>';
      return;
    }
    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:20px;">
        ${snap.docs.map(d => {
          const art = d.data();
          return `<div class="artiste-card" style="border:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2); padding:10px;">
            <img src="${art.imageUrl}" style="width:100%; height:150px; object-fit:cover; margin-bottom:10px;">
            <h4 style="font-size:0.9rem;">${escHtml(art.name)}</h4>
            <p style="font-size:0.7rem; color:var(--gold);">${escHtml(art.job)}</p>
          </div>`;
        }).join('')}
      </div>`;
  } catch { container.innerHTML = '<p>Erreur chargement.</p>'; }
}

export function exportCSV() {
  alert('Export CSV indisponible en mode démo.');
}
