import { collection, addDoc, serverTimestamp, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../config";

export const placeOrder = async (userId: string, orderData: any) => {
  return await addDoc(collection(db, "orders"), {
    ...orderData,
    userId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const getUserOrders = async (userId: string) => {
  const q = query(
    collection(db, "orders"), 
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
