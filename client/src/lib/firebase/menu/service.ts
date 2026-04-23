import { collection, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import { MenuItem } from "@/lib/menuData";

export const fetchMenu = async () => {
  const snapshot = await getDocs(collection(db, "menu"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const fetchMenuByCategory = async (category: string) => {
  const q = query(collection(db, "menu"), where("category", "==", category));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const listenToMenu = (callback: (menu: MenuItem[]) => void) => {
  const q = query(collection(db, "menu"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MenuItem[];
    callback(items);
  });
};
