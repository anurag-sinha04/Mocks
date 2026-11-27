/* ==========================================================================
   CLAT MOCK-1 — Firebase Configuration  (js/firebase-config.js)
   FIX 1: firebaseConfig is now EXPORTED (app.js imports it).
   FIX 2: isFirebaseConfigured() no longer compares your keys to themselves.
   ========================================================================== */

export const firebaseConfig = {
  apiKey: "AIzaSyAvs2FCJnxhC1SvGuWNVsuvUOZ_JNZlfkY",
  authDomain: "mock-613d2.firebaseapp.com",
  projectId: "mock-613d2",
  storageBucket: "mock-613d2.firebasestorage.app",
  messagingSenderId: "663624280684",
  appId: "1:663624280684:web:dcf7efa9a84f0d66ca8649",
  measurementId: "G-RH9YW7SFB0"
};

// Firestore collection: one document per candidate, document ID = mobile number
export const COLLECTION_NAME = "clat_mock_1_attempts";

export function isFirebaseConfigured() {
  const key = String(firebaseConfig.apiKey || "");
  const pid = String(firebaseConfig.projectId || "");
  return key.length > 20 && !key.startsWith("YOUR_") && pid.length > 0 && !pid.startsWith("YOUR_");
}
