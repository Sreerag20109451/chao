import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  getDocs,
  where,
  limit,
} from "firebase/firestore";
import { db } from "../config";
import type { AdminOrder, FirestoreTimestampLike, OrderItem, OrderStatus } from "@/models/order";

export interface OrderData {
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  orderType: "collection" | "delivery";
  address?: string;
  status: OrderStatus;
  createdAt: FirestoreTimestampLike | Date | string | number | null;
  userId?: string;
  id?: string;
}

export const createOrder = async (orderData: Omit<OrderData, "status" | "createdAt">) => {
  return await addDoc(collection(db, "orders"), {
    ...orderData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
};

export const subscribeToOrders = (callback: (orders: AdminOrder[]) => void) => {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AdminOrder[];
    callback(orders);
  });
};

const resolveClientUid = async (order: Pick<OrderData, "userId">) => {
  const rawUserId = order?.userId;
  if (!rawUserId || typeof rawUserId !== "string") return null;

  const directDoc = await getDoc(doc(db, "users", rawUserId));
  if (directDoc.exists()) return directDoc.id;

  const emailLookup = query(
    collection(db, "users"),
    where("email", "==", rawUserId),
    limit(1)
  );
  const emailResult = await getDocs(emailLookup);
  if (!emailResult.empty) return emailResult.docs[0].id;

  return null;
};

const createClientNotification = async (
  order: Pick<OrderData, "id" | "userId"> & { id: string },
  status: OrderData["status"],
  etaMinutes?: number
) => {
  const uid = await resolveClientUid(order);
  if (!uid) return;

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const isRejected = status === "cancelled";

  await addDoc(collection(db, "users", uid, "notifications"), {
    orderId: order.id,
    title: isRejected ? "Order rejected" : `Order ${statusText}`,
    message: isRejected
      ? `Your order #${order.id.slice(0, 8).toUpperCase()} was rejected by the restaurant.`
      : status === "preparing" && etaMinutes
      ? `Your order #${order.id.slice(0, 8).toUpperCase()} is being prepared. ETA: ${etaMinutes} minutes.`
      : `Your order #${order.id.slice(0, 8).toUpperCase()} is now ${status}.`,
    type: isRejected ? "error" : "info",
    etaMinutes: etaMinutes || null,
    read: false,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", uid), {
    notificationsUpdatedAt: serverTimestamp(),
  });
};

export const updateOrderStatusWithNotification = async (
  order: Pick<OrderData, "id" | "userId"> & { id: string },
  status: OrderData["status"],
  etaMinutes?: number
) => {
  // Always prioritize operational status updates in the orders collection.
  // Notification writes are best-effort and should not block Accept/Reject.
  await updateDoc(doc(db, "orders", order.id), {
    status,
    ...(status === "preparing" && etaMinutes ? { requestedPickupTime: etaMinutes } : {}),
  });

  try {
    await createClientNotification(order, status, etaMinutes);
  } catch (notificationError) {
    // Do not throw here: admin order flow must continue even if notification
    // permissions or lookup fail for a particular user record.
    console.error("Order status updated, but notification failed:", notificationError);
  }
};

export const updateOrderPaymentStatus = async (orderId: string, paymentStatus: string) => {
  await updateDoc(doc(db, "orders", orderId), {
    paymentStatus,
  });
};
