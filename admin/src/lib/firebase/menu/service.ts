import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config";
import { MenuItem } from "../../menuData";

const MENU_COLLECTION = "menu";

export const getMenuItems = async (): Promise<MenuItem[]> => {
  const q = query(collection(db, MENU_COLLECTION), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as MenuItem[];
};

export const listenToMenu = (callback: (items: MenuItem[]) => void) => {
  const q = query(collection(db, MENU_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as MenuItem[];
    callback(items);
  });
};

export const addMenuItem = async (item: Omit<MenuItem, "id">) => {
  return await addDoc(collection(db, MENU_COLLECTION), {
    ...item,
    createdAt: serverTimestamp(),
  });
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
  const itemRef = doc(db, MENU_COLLECTION, id);
  return await updateDoc(itemRef, updates);
};

export const deleteMenuItem = async (id: string) => {
  const itemRef = doc(db, MENU_COLLECTION, id);
  return await deleteDoc(itemRef);
};
