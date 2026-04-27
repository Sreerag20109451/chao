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
  writeBatch,
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
  console.log(`Updating menu item ${id}:`, updates);
  const itemRef = doc(db, MENU_COLLECTION, id);
  try {
    const res = await updateDoc(itemRef, updates);
    console.log(`Successfully updated menu item ${id}`);
    return res;
  } catch (error) {
    console.error(`Failed to update menu item ${id}:`, error);
    throw error;
  }
};

export const deleteMenuItem = async (id: string) => {
  const itemRef = doc(db, MENU_COLLECTION, id);
  return await deleteDoc(itemRef);
};

export const deleteAllMenuItems = async () => {
  const snapshot = await getDocs(collection(db, MENU_COLLECTION));
  const batches = [];

  for (let i = 0; i < snapshot.docs.length; i += 450) {
    const batch = writeBatch(db);
    snapshot.docs.slice(i, i + 450).forEach((menuDoc) => {
      batch.delete(menuDoc.ref);
    });
    batches.push(batch.commit());
  }

  await Promise.all(batches);
  return snapshot.docs.length;
};
