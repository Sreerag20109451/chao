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
import { Deal } from "../../menuData";

const DEALS_COLLECTION = "deals";

export const getDeals = async (): Promise<Deal[]> => {
  const q = query(collection(db, DEALS_COLLECTION), orderBy("startDate", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Deal[];
};

export const listenToDealsAdmin = (callback: (deals: Deal[]) => void) => {
  const q = query(collection(db, DEALS_COLLECTION), orderBy("startDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const deals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Deal[];
    callback(deals);
  });
};

export const addDeal = async (deal: Omit<Deal, "id">) => {
  return await addDoc(collection(db, DEALS_COLLECTION), {
    ...deal,
    createdAt: serverTimestamp(),
  });
};

export const updateDeal = async (id: string, updates: Partial<Deal>) => {
  const dealRef = doc(db, DEALS_COLLECTION, id);
  return await updateDoc(dealRef, updates);
};

export const deleteDeal = async (id: string) => {
  const dealRef = doc(db, DEALS_COLLECTION, id);
  return await deleteDoc(dealRef);
};
