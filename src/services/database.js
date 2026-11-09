import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

import { auth, db } from "./firebase";

function getUserCollection(name) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  return collection(db, "users", user.uid, name);
}

export async function addSale(data) {
  return addDoc(getUserCollection("sales"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getSales() {
  const q = query(
    getUserCollection("sales"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

export async function addProduct(data) {
  return addDoc(getUserCollection("products"), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getProducts() {
  const q = query(
    getUserCollection("products"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
