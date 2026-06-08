// ── FORMS.JS — Adhésion · Validation · Soumission ────────────

import { db }          from '../config/firebase.js';
import { collection, addDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { navigate }    from './nav.js';

const SHEETDB_URL = (import.meta.env?.VITE_SHEETDB_URL) ||
  'https://sheetdb.io/api/v1/yf325l4woltxi';

function isFirebaseReady() {
  return import.meta.env?.VITE_FIREBASE_API_KEY &&
         import.meta.env.VITE_FIREBASE_API_KEY !== 'votre_api_key';
}

export async function submitAdhesion() {
  const nom    = document.getElementById('nom')?.value?.trim();
  const email  = document.getElementById('email')?.value?.trim();
  const profil = document.getElementById('profil')?.value;
  const tel    = document.getElementById('tel')?.value?.trim();
  const ville  = document.getElementById('ville')?.value?.trim();
  const dob    = document.getElementById('dateNaissance')?.value;
  const msg    = document.getElementById('message')?.value?.trim();
  const rgpd   = document.getElementById('rgpd')?.checked;

  if (!nom || !email || !profil || !rgpd) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }

  const data = {
    dateInscription: new Date().toLocaleDateString('fr-FR'),
    createdAt: serverTimestamp ? serverTimestamp() : new Date(),
    nom, email,
    tel:          tel   || '—',
    ville:        ville || '—',
    dateNaissance: dob  || '—',
    profil,
    message: msg || 'Aucun message',
    statut: 'En attente de paiement'
  };

  const btn = document.querySelector('.form-submit .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Envoi en cours...'; btn.disabled = true; }

  try {
    if (isFirebaseReady()) {
      await addDoc(collection(db, 'adherents'), data);
    } else {
      await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
    }

    document.getElementById('adhesionForm').style.display  = 'none';
    document.getElementById('adhesionSuccess').style.display = 'block';
    
    // Initialisation immédiate du bouton PayPal spécifique
    if (window.initPayPal) window.initPayPal();

  } catch (err) {
    console.error(err);
    alert("Erreur d'envoi. Veuillez réessayer.");
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}
