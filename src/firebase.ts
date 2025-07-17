// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFVJWzRpAQWfZu8gHm2gQcLXgt1VvvWbo",
  authDomain: "voucher-wallet2.firebaseapp.com",
  projectId: "voucher-wallet2",
  storageBucket: "voucher-wallet2.firebasestorage.app",
  messagingSenderId: "303182842940",
  appId: "1:303182842940:web:f36f9126596ac1ec08c739",
  measurementId: "G-YD6EVJX32J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };
