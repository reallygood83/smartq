// SmartQ - Firebase Configuration
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
};

// Initialize Firebase only if config is valid and app doesn't exist
let app;
let auth;
let database;
let storage;

// Check if all required config values are present
const isConfigValid = firebaseConfig.apiKey && 
                     firebaseConfig.authDomain && 
                     firebaseConfig.projectId;

if (isConfigValid) {
  try {
    // Initialize Firebase only if not already initialized
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    database = getDatabase(app);
    storage = getStorage(app);
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
} else {
  console.warn('Firebase configuration is incomplete. Please set all environment variables.');
}

export { auth, database, storage };
export default app;