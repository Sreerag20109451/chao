import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../config";
import type { FirestoreTimestampLike } from "@/models/order";

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: "active" | "inactive";
  isWorkingToday: boolean;
  createdAt?: FirestoreTimestampLike | Date | string | number | null;
}

const DRIVERS_COLLECTION = "drivers";

export const getDrivers = async (): Promise<Driver[]> => {
  const q = query(collection(db, DRIVERS_COLLECTION), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Driver[];
};

export const addDriver = async (driver: Omit<Driver, "id">) => {
  console.log("Firestore: Attempting to add driver document...", driver);
  try {
    const docRef = await addDoc(collection(db, DRIVERS_COLLECTION), {
      ...driver,
      createdAt: serverTimestamp(),
    });
    console.log("Firestore: Driver added successfully with ID:", docRef.id);
    return docRef;
  } catch (error) {
    console.error("Firestore: Error in addDriver service:", error);
    throw error;
  }
};

export const updateDriver = async (id: string, updates: Partial<Driver>) => {
  const driverRef = doc(db, DRIVERS_COLLECTION, id);
  return await updateDoc(driverRef, updates);
};

export const deleteDriver = async (id: string) => {
  const driverRef = doc(db, DRIVERS_COLLECTION, id);
  return await deleteDoc(driverRef);
};

export const setPrimaryDriver = async (driverId: string) => {
  // First, set all drivers to not working today
  const allDrivers = await getDrivers();
  for (const driver of allDrivers) {
    if (driver.isWorkingToday) {
      await updateDriver(driver.id, { isWorkingToday: false });
    }
  }
  
  // Then set the selected one
  return await updateDriver(driverId, { isWorkingToday: true });
};
