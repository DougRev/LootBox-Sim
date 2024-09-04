// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB6d-Rni4MumJ9kQkvrb9MFOpikgXxYtsE",
  authDomain: "loot-box-sim.firebaseapp.com",
  projectId: "loot-box-sim",
  storageBucket: "loot-box-sim.appspot.com",
  messagingSenderId: "387837385170",
  appId: "1:387837385170:web:a63ceeaea9a95f9642500b",
  measurementId: "G-K3XN0NDVF7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { auth, db, storage };