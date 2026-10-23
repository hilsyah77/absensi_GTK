import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Konfigurasi Firebase resmi MTs Asy-Syafi'iyyah
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAN11faPmEkKnDWqJECxc-lDZ-14JkbIzs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "abseninout-b511a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "abseninout-b511a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "abseninout-b511a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "479969840704",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:479969840704:web:c1936f0b5c2b244b1819a5"
};

// Cek apakah konfigurasi Firebase sudah diisi dengan benar
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== 'PASTE_YOUR_API_KEY_HERE'
);

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase] Berhasil terhubung ke Firebase Project:', firebaseConfig.projectId);
  } catch (err) {
    console.warn('[Firebase] Gagal inisialisasi Firebase, fallback ke LocalStorage mode:', err);
  }
} else {
  console.info('[Firebase] Konfigurasi belum diisi di .env. Menggunakan mode penyimpanan lokal (LocalStorage).');
}

export { app, db, auth };
