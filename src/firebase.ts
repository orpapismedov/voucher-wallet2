import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyDFVJWzRpAQWfZu8gHm2gQcLXgt1VvvWbo",
  authDomain: "voucher-wallet2.firebaseapp.com",
  projectId: "voucher-wallet2",
  storageBucket: "voucher-wallet2.firebasestorage.app",
  messagingSenderId: "303182842940",
  appId: "1:303182842940:web:432b82ec6d1a4a9108c739",
  measurementId: "G-K9MMRSWFF1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);
export { analytics };
export default app;