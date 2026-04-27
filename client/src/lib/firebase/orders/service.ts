import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  limit,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config";

// Recursively replace undefined values with null and sanitize objects/arrays
const sanitizeForFirestore = (value: any): any => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) {
      out[k] = sanitizeForFirestore(value[k]);
    }
    return out;
  }
  return value;
};

export const placeOrder = async (userId: string, orderData: any) => {
  // IMPORTANT:
  // Keep Firestore sentinel values (like serverTimestamp) out of the sanitizer.
  // The sanitizer recursively transforms objects and would strip sentinel metadata.
  const payload = sanitizeForFirestore({
    ...orderData,
    userId,
    status: "pending",
  });
  // Assign server timestamp after sanitization so Firestore stores a real Timestamp.
  payload.createdAt = serverTimestamp();
  const orderRef = await addDoc(collection(db, "orders"), payload);

  // Notification writes require /users/{auth.uid} permissions.
  // Only attempt this for UID-shaped identifiers to avoid permission errors
  // when legacy callers pass email/guest values.
  const isUid = typeof userId === "string" && !userId.includes("@") && userId !== "guest";
  if (isUid) {
    await createClientNotification(userId, {
      orderId: orderRef.id,
      title: "Order placed successfully",
      message: `We received your order #${orderRef.id.slice(0, 8).toUpperCase()}.`,
      type: "success",
    });
  }

  return orderRef;
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

export const subscribeToUserOrders = (
  userId: string,
  userEmail: string | undefined,
  callback: (orders: any[]) => void
) => {
  if (!userId && !userEmail) return () => {};

  const orderMap = new Map<string, any>();

  const emit = () => {
    const merged = Array.from(orderMap.values()).sort((a, b) => {
      const aSec = a?.createdAt?.seconds || 0;
      const bSec = b?.createdAt?.seconds || 0;
      return bSec - aSec;
    });
    callback(merged);
  };

  const unsubscribers: Array<() => void> = [];

  if (userId) {
    const uidQuery = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    unsubscribers.push(
      onSnapshot(uidQuery, (snapshot) => {
        snapshot.docs.forEach((orderDoc) => {
          orderMap.set(orderDoc.id, { id: orderDoc.id, ...orderDoc.data() });
        });
        emit();
      })
    );
  }

  if (userEmail && userEmail !== userId) {
    const emailQuery = query(
      collection(db, "orders"),
      where("userId", "==", userEmail),
      orderBy("createdAt", "desc")
    );

    unsubscribers.push(
      onSnapshot(emailQuery, (snapshot) => {
        snapshot.docs.forEach((orderDoc) => {
          orderMap.set(orderDoc.id, { id: orderDoc.id, ...orderDoc.data() });
        });
        emit();
      })
    );
  }

  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
};

export interface ClientNotificationInput {
  orderId: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
}

export const createClientNotification = async (
  userId: string,
  notification: ClientNotificationInput
) => {
  if (!userId) return;

  await addDoc(collection(db, "users", userId, "notifications"), {
    ...notification,
    type: notification.type || "info",
    read: false,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "users", userId), {
    notificationsUpdatedAt: serverTimestamp(),
  });
};

export const subscribeToClientNotifications = (
  userId: string,
  callback: (notifications: any[]) => void
) => {
  if (!userId) return () => {};

  const notificationsQuery = query(
    collection(db, "users", userId, "notifications"),
    orderBy("createdAt", "desc"),
    limit(20)
  );

  return onSnapshot(notificationsQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  await updateDoc(doc(db, "users", userId, "notifications", notificationId), {
    read: true,
  });
};

export const markAllNotificationsAsRead = async (userId: string, notificationIds: string[]) => {
  await Promise.all(notificationIds.map((id) => markNotificationAsRead(userId, id)));
};

export const clearAllNotifications = async (userId: string) => {
  const snapshot = await getDocs(collection(db, "users", userId, "notifications"));
  await Promise.all(snapshot.docs.map((notificationDoc) => deleteDoc(notificationDoc.ref)));
};
