// Import Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration (Use exactly as provided by Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyDlfKzASm4tB3S35LdbSwXIp6noJWSP5nk",
  authDomain: "reactblogapp-29546.firebaseapp.com",
  projectId: "reactblogapp-29546",
  storageBucket: "reactblogapp-29546.appspot.com",
  messagingSenderId: "663881917673",
  appId: "1:663881917673:web:8b7b2b72355bfb067d3c78",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Firebase Services (✅ Add these for better usage)
export const auth = getAuth(app); // Firebase Authentication
export const db = getFirestore(app); // Firestore Database
export const storage = getStorage(app); // Firebase Storage

// Export app instance (optional)
export default app;
