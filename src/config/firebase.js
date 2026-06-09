// ── FIREBASE CONFIG ──────────────────────────────────────────
import { initializeApp }  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore }   from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage }     from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";
import { getAuth }        from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID
};

let db, storage, auth;

try {
  if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined') {
    const app = initializeApp(firebaseConfig);
    db      = getFirestore(app);
    storage = getStorage(app);
    auth    = getAuth(app);
  } else {
    console.info('Firebase: config absente, mode fallback SheetDB actif.');
  }
} catch (e) {
  console.warn('Firebase init échouée:', e.message);
}

export { db, storage, auth };

