import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../config";

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

const normalize = (value: string) => value.trim();

/**
 * Persists a public contact message for admin follow-up.
 */
export const createContactMessage = async (payload: ContactMessageInput) => {
  const name = normalize(payload.name);
  const email = normalize(payload.email);
  const message = normalize(payload.message);

  if (!name || !email || !message) {
    throw new Error("All fields are required.");
  }

  await addDoc(collection(db, "messages"), {
    name,
    email,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
};

