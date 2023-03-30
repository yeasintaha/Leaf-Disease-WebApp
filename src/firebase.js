import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBu1Mk9-5CfJuRzAEFFE_Hm36QuvIgr89U",
  authDomain: "leaf-app-8225f.firebaseapp.com",
  projectId: "leaf-app-8225f",
  storageBucket: "leaf-app-8225f.appspot.com",
  messagingSenderId: "586005323174",
  appId: "1:586005323174:web:afa609abc6ed645ee44367",
};

// Initialize Firebase
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db_firestore = getFirestore(app);
const db_realtime = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db_firestore, db_realtime, storage, app, auth };
