
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBe9Z0bJYuAWMtZYNjWGPZ7Y7yufuKElzg",
  authDomain: "grantswipe-34926.firebaseapp.com",
  projectId: "grantswipe-34926",
  storageBucket: "grantswipe-34926.firebasestorage.app",
  messagingSenderId: "1094697064805",
  appId: "1:1094697064805:web:c76299a3a8e719d4cd698c",
  measurementId: "G-XND53WDFNR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Enable network persistence for Firestore
import { enableNetwork } from "firebase/firestore";
enableNetwork(db).catch((error) => {
  console.warn("Failed to enable Firestore network:", error);
});

export default app;
