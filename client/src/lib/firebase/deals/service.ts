import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import { Deal } from "@/lib/menuData";

export const listenToDeals = (callback: (deals: Deal[]) => void) => {
  const q = query(
    collection(db, "deals"),
    where("isActive", "==", true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const deals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Deal[];
    callback(deals);
  });
};
