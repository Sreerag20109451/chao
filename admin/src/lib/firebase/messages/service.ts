import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../config";

export interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt?: { seconds?: number; nanoseconds?: number } | null;
}

export const subscribeToMessages = (
  callback: (messages: AdminMessage[]) => void,
  onError?: (error: Error) => void
) => {
  const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<AdminMessage, "id">) })));
    },
    (error) => {
      console.error("Failed to subscribe to admin messages:", error);
      onError?.(error);
    }
  );
};

export const setMessageReadState = async (messageId: string, read: boolean) => {
  await updateDoc(doc(db, "messages", messageId), { read });
};

export const setAllMessagesReadState = async (messageIds: string[], read: boolean) => {
  if (messageIds.length === 0) return;
  const batch = writeBatch(db);
  messageIds.forEach((id) => {
    batch.update(doc(db, "messages", id), { read });
  });
  await batch.commit();
};

