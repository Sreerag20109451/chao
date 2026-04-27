import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import { Deal } from "@/lib/menuData";

export const listenToDeals = (callback: (deals: Deal[]) => void) => {
  const q = query(
    collection(db, "deals"),
    where("isActive", "==", true)
  );
  
  return onSnapshot(q, (snapshot) => {
    const now = new Date();
    const deals = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }) as Deal)
      .filter((deal) => {
        // Client should never receive expired deals.
        // Treat end date as inclusive through end-of-day.
        const start = new Date(deal.startDate);
        const end = new Date(deal.endDate);
        end.setHours(23, 59, 59, 999);
        return now >= start && now <= end;
      });

    callback(deals);
  });
};
