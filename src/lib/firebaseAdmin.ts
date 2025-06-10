// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert, getApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

// Firebase Admin configuration
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    // For development, we'll use the same project but with admin privileges
    // In production, you should use a proper service account key
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

// Initialize Firebase Admin (only once)
let adminApp
let adminDatabase

try {
  // Check if admin app is already initialized
  if (getApps().length === 0) {
    // For development without service account, we'll use a simpler approach
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      console.warn('Firebase Admin credentials not found. Using client SDK fallback.')
      // We'll export null and handle this in the API routes
      adminApp = null
      adminDatabase = null
    } else {
      adminApp = initializeApp(firebaseAdminConfig, 'admin')
      adminDatabase = getDatabase(adminApp)
    }
  } else {
    adminApp = getApp('admin')
    adminDatabase = getDatabase(adminApp)
  }
} catch (error) {
  console.warn('Firebase Admin initialization failed, falling back to client SDK:', error.message)
  adminApp = null
  adminDatabase = null
}

export { adminDatabase }
export default adminApp