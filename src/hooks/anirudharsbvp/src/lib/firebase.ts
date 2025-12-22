import { initializeApp, getApps } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDY1SOu2tyhljg-eTet0pr1F6bTAuXjPY4",
  authDomain: "hridayarakshak-3be91.firebaseapp.com",
  projectId: "hridayarakshak-3be91",
  storageBucket: "hridayarakshak-3be91.firebasestorage.app",
  messagingSenderId: "174989708196",
  appId: "1:174989708196:web:17ea6f5bb93efbe78d8f31",
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Auth instance
export const auth = getAuth(app);

// Google provider
const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};