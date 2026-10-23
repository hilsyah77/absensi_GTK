import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim();
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  console.log('Mencoba menulis dokumen uji...');
  await setDoc(doc(db, '_connection_test', 'ping'), { timestamp: new Date().toISOString() });
  console.log('SUCCESS: Dokumen berhasil ditulis ke Firestore!');
  process.exit(0);
} catch (error) {
  console.error('HASIL UJI:', error);
  process.exit(1);
}
