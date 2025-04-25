import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: "AIzaSyCDP_N9fYjlJnshuc4jckOP5IMo0HSrbmo",
  authDomain: "pafmain-a0be6.firebaseapp.com",
  projectId: "pafmain-a0be6",
  storageBucket: "pafmain-a0be6.appspot.com",
  messagingSenderId: "136832715572",
  appId: "1:136832715572:web:ac62d5fc2f9bb35cfff361"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
