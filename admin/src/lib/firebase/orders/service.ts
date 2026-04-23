import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config";

export interface OrderData {
  items: any[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  orderType: "collection" | "delivery";
  address?: string;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: any;
}

export const createOrder = async (orderData: Omit<OrderData, "status" | "createdAt">) => {
  return await addDoc(collection(db, "orders"), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const subscribeToOrders = (callback: (orders: any[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(orders);
  });
};
