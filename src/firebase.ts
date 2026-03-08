import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCuBPcZnxwTWlAr3_HCnGitvoZ6iLGaZUs",
  authDomain: "hack-odesy26.firebaseapp.com",
  databaseURL: "https://hack-odesy26-default-rtdb.firebaseio.com",
  projectId: "hack-odesy26",
  storageBucket: "hack-odesy26.firebasestorage.app",
  messagingSenderId: "734053969718",
  appId: "1:734053969718:web:4fb4c49153f5eb1d0c0d97",
  measurementId: "G-BDPE6P6FY3"
};

import { getStorage } from 'firebase/storage';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);

// Configure persistence and add required scopes
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting persistence:", error);
});

googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
