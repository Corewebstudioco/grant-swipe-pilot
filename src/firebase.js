
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe9Z0bJYuAWMtZYNjWGPZ7Y7yufuKElzg",
  authDomain: "grantswipe-34926.firebaseapp.com",
  projectId: "grantswipe-34926",
  storageBucket: "grantswipe-34926.firebasestorage.app",
  messagingSenderId: "1094697064805",
  appId: "1:1094697064805:web:c76299a3a8e719d4cd698c",
  measurementId: "G-XND53WDFNR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
