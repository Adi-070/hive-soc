// lib/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDvqxr0h94Tol3zzVfd0nKqVDiagLyVjoA",
    authDomain: "dev1-9bf73.firebaseapp.com",
    projectId: "dev1-9bf73",
    storageBucket: "dev1-9bf73.appspot.com",
    messagingSenderId: "439495078382",
    appId: "1:439495078382:web:e10e67f97a7bf84e565eff",
    measurementId: "G-DHPVJ6VT6H"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
