import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCsR5BxwJ3FzWQB_NEz8_z8m2rZ32VsOVg',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'shibir-library-uiu.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'shibir-library-uiu',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'shibir-library-uiu.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '219650076171',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:219650076171:web:08f363d4f48df69613610e',
};

// Initialize Firebase only once
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const isFirebaseConfigured = true;
