// ── PAYPAL.JS — Boutons PayPal don · adhésion · festival ─────

import { navigate } from './nav.js';

export function initPayPal() {
  if (!window.paypal) { console.warn('PayPal SDK non chargé.'); return; }

  // DON
  const donBox = document.getElementById('paypal-button-container-don');
  if (donBox && !donBox.firstChild) {
    window.paypal.Buttons({
      style: { shape: 'rect', color: 'gold', layout: 'vertical' },
      createOrder: (data, actions) => {
        const raw = document.getElementById('customMontant')?.value;
        const custom = parseFloat(raw);
        const val = Number.isFinite(custom) && custom > 0 ? custom.toFixed(2) : (Number(window.selectedMontant) || 50).toFixed(2);
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: 'EUR', value: val.toString() } }]
        });
      },
      onApprove: (data, actions) =>
        actions.order.capture().then(() => { alert('Merci pour votre don !'); navigate('accueil'); })
    }).render('#paypal-button-container-don');
  }

  // ADHÉSION
  const adhBox = document.getElementById('paypal-button-container-adhesion');
  if (adhBox && !adhBox.firstChild) {
    window.paypal.Buttons({
      style: { shape: 'rect', color: 'gold', layout: 'vertical' },
      createOrder: (data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { currency_code: 'EUR', value: '30.00' } }]
        }),
      onApprove: (data, actions) =>
        actions.order.capture().then(() => { alert('Adhésion confirmée !'); navigate('accueil'); })
    }).render('#paypal-button-container-adhesion');
  }

  // FESTIVAL
  const festBox = document.getElementById('paypal-button-container-festival');
  if (festBox && !festBox.firstChild) {
    window.paypal.Buttons({
      style: { shape: 'rect', color: 'gold', layout: 'vertical' },
      createOrder: (data, actions) => {
        const val = document.getElementById('fest-pass')?.value || '0';
        if (val === '0') { alert('Réservation gratuite.'); return; }
        return actions.order.create({
          purchase_units: [{ amount: { currency_code: 'EUR', value: val } }]
        });
      },
      onApprove: (data, actions) =>
        actions.order.capture().then(() => { alert('Réservation confirmée !'); navigate('accueil'); })
    }).render('#paypal-button-container-festival');
  }
}

