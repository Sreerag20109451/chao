import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { initializeFirestore, getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

/**
 * Firebase configuration object retrieved from environment variables.
 * All variables must be prefixed with NEXT_PUBLIC_ for Next.js client-side access.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

/**
 * Shared Firebase Application instance.
 * Checks for existing apps to prevent multiple initialization during HMR.
 */
const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

/**
 * Firebase Authentication instance.
 */
const auth: Auth = getAuth(app);

/**
 * Firestore Database instance.
 * Initialized with experimentalForceLongPolling: true to ensure compatibility
 * across various network environments (e.g., behind strict corporate firewalls).
 * Uses the "default" database ID.
 */
let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, "default");
} catch (e) {
  db = getFirestore(app, "default");
}

/**
 * Firebase Storage instance for file uploads.
 */
const storage: FirebaseStorage = getStorage(app);

export { app, auth, db, storage };
