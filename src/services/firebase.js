import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAY7UxtQFWb5QMLd8HrUu-pE3eRu81PxzA",
  authDomain: "sales-helper-36e60.firebaseapp.com",
  projectId: "sales-helper-36e60",
  storageBucket: "sales-helper-36e60.firebasestorage.app",
  messagingSenderId: "382292177538",
  appId: "1:382292177538:web:cc15144f925fe8d551fa9b",
  measurementId: "G-NWJSGJZVBJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
