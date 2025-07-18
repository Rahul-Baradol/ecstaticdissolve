import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "your-placeholder-api-key",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-placeholder-auth-domain",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-placeholder-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-placeholder-storage-bucket",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "your-placeholder-sender-id",
  appId: process.env.FIREBASE_APP_ID || "your-placeholder-app-id",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
