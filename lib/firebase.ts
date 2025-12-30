// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4Zl7TM6k6hWVbWpzd0AQvvybohTMvrzU",
  authDomain: "foundersfirstdata.firebaseapp.com",
  projectId: "foundersfirstdata",
  storageBucket: "foundersfirstdata.firebasestorage.app",
  messagingSenderId: "803184180442",
  appId: "1:803184180442:web:202142d155f3c1c42339e3",
  measurementId: "G-7S8EMX4N9T"
};

// Initialize Firebase app (avoid double initialization during SSR/HMR)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize analytics only in the browser (window exists).
// Use dynamic import so the analytics module is not loaded during SSR.
let analytics: unknown;
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics }) => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - analytics has no specific type here
        analytics = getAnalytics(app);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Firebase analytics not initialized:", err);
      }
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("Failed to load firebase/analytics module:", err);
    });
}

export const db = getFirestore(app);