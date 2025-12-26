// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);