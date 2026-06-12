// ── FORMS.JS — Adhésion · Validation · Soumission ────────────

import { db }          from '../config/firebase.js';
import { collection, addDoc, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { navigate }    from './nav.js';

const SHEETDB_URL = import.meta.env?.VITE_SHEETDB_URL
  || (location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      ? 'https://sheetdb.io/api/v1/yf325l4woltxi'
      : './api/sheetdb.php');

function isFirebaseReady() {
  return import.meta.env?.VITE_FIREBASE_API_KEY &&
         import.meta.env.VITE_FIREBASE_API_KEY !== 'votre_api_key';
}

export async function submitContact() {
  const nom     = document.getElementById('c-nom')?.value?.trim();
  const email   = document.getElementById('c-email')?.value?.trim();
  const message = document.getElementById('c-message')?.value?.trim();

  if (!nom || !email || !message) {
    alert('Merci de remplir tous les champs.');
    return;
  }

  const btn = document.querySelector('#contact-form .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Envoi en cours...'; btn.disabled = true; }

  try {
    const res = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [{
        Nom: nom,
        Email: email,
        Message: message,
        Type: 'contact',
        'Date d\'inscription': new Date().toLocaleDateString('fr-FR')
      }]})
    });
    if (!res.ok) throw new Error(`Erreur ${res.status}`);
    document.getElementById('contact-form').style.display = 'none';
    document.getElementById('contact-success').style.display = 'block';
  } catch (err) {
    console.error(err);
    alert("Erreur d'envoi. Veuillez réessayer ou nous contacter par email.");
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

export async function submitAdhesion() {
  const nom           = document.getElementById('nom')?.value?.trim();
  const email         = document.getElementById('email')?.value?.trim();
  const profil        = document.getElementById('profil')?.value;
  const modePaiement  = document.getElementById('modePaiement')?.value || 'paypal';
  const tel           = document.getElementById('tel')?.value?.trim();
  const ville         = document.getElementById('ville')?.value?.trim();
  const dob           = document.getElementById('dateNaissance')?.value;
  const msg           = document.getElementById('message')?.value?.trim();
  const rgpd          = document.getElementById('rgpd')?.checked;

  if (!nom || !email || !profil || !rgpd) {
    alert('Merci de remplir tous les champs obligatoires.');
    return;
  }

  const isPayingMember = profil === 'membre';
  const isFreeProfile  = profil === 'benevole' || profil === 'artiste';

  const data = {
    dateInscription: new Date().toLocaleDateString('fr-FR'),
    createdAt: serverTimestamp ? serverTimestamp() : new Date(),
    nom, email,
    tel:           tel   || '—',
    ville:         ville || '—',
    dateNaissance: dob  || '—',
    profil,
    paiement:      isPayingMember ? modePaiement : 'gratuit',
    message:       msg || 'Aucun message',
    statut:        isPayingMember ? 'En attente de paiement' : 'Inscription gratuite'
  };

  const btn = document.querySelector('.form-submit .btn-primary');
  const originalText = btn?.textContent;
  if (btn) { btn.textContent = 'Envoi en cours...'; btn.disabled = true; }

  try {
    const sheetRow = {
      Nom: nom,
      Email: email,
      Téléphone: tel || '—',
      Ville: ville || '—',
      'Date de naissance': dob || '—',
      Profil: profil,
      Paiement: isPayingMember ? modePaiement : 'gratuit',
      Statut: isPayingMember ? 'En attente de paiement' : 'Inscription gratuite',
      Message: msg || 'Aucun message',
      'Date d\'inscription': new Date().toLocaleDateString('fr-FR'),
      Type: 'adhesion'
    };

    if (isFirebaseReady()) {
      await addDoc(collection(db, 'adherents'), data);
      await fetch('./api/sendmail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...data, type: 'adhesion' } })
      });
    } else {
      const res = await fetch(SHEETDB_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [sheetRow] })
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);
    }

    document.getElementById('adhesionForm').style.display  = 'none';
    document.getElementById('adhesionSuccess').style.display = 'block';

    const successMessage = document.getElementById('adhesionSuccessMessage');
    const cashNote = document.getElementById('cash-payment-note');
    const payPalContainer = document.getElementById('paypal-button-container-adhesion');

    if (isPayingMember) {
      successMessage.textContent = 'Votre demande est enregistrée. Pour finaliser votre adhésion de 30 €, procédez au paiement ci-dessous ou choisissez le règlement en espèces.';
      if (cashNote) cashNote.style.display = 'block';
      if (payPalContainer) payPalContainer.style.display = modePaiement === 'paypal' ? 'block' : 'none';
      if (modePaiement === 'paypal' && window.initPayPal) window.initPayPal();
    } else if (isFreeProfile) {
      successMessage.textContent = `Votre inscription en tant que ${profil} est bien enregistrée. Vous rejoignez AMC gratuitement, nous vous contacterons bientôt.`;
      if (cashNote) cashNote.style.display = 'none';
      if (payPalContainer) payPalContainer.style.display = 'none';
    } else {
      successMessage.textContent = 'Votre demande est enregistrée. Nous vous contacterons bientôt pour la suite.';
      if (cashNote) cashNote.style.display = 'none';
      if (payPalContainer) payPalContainer.style.display = 'none';
    }

  } catch (err) {
    console.error(err);
    alert("Erreur d'envoi. Veuillez réessayer.");
  } finally {
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

