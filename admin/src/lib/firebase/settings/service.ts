import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../config";

export interface OpeningTime {
  open: string;   // e.g. "16:00"
  close: string;  // e.g. "22:30"
  closed: boolean;
}

export interface StoreSettings {
  isAcceptingOrders: boolean;
  openingHours: {
    mon: OpeningTime;
    tue: OpeningTime;
    wed: OpeningTime;
    thu: OpeningTime;
    fri: OpeningTime;
    sat: OpeningTime;
    sun: OpeningTime;
  };
}

const DEFAULT_SETTINGS: StoreSettings = {
  isAcceptingOrders: true,
  openingHours: {
    mon: { open: "00:00", close: "00:00", closed: true },
    tue: { open: "16:00", close: "22:30", closed: false },
    wed: { open: "16:00", close: "22:30", closed: false },
    thu: { open: "16:00", close: "22:30", closed: false },
    fri: { open: "16:00", close: "23:00", closed: false },
    sat: { open: "13:00", close: "23:00", closed: false },
    sun: { open: "13:00", close: "22:00", closed: false },
  },
};

export const initStoreSettings = async () => {
  const ref = doc(db, "settings", "store");
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, DEFAULT_SETTINGS);
  }
};

export const toggleStoreStatus = async (status: boolean) => {
  console.log(`Setting store status to: ${status}`);
  const ref = doc(db, "settings", "store");
  try {
    await setDoc(ref, { isAcceptingOrders: status }, { merge: true });
    console.log(`Successfully set store status to: ${status}`);
  } catch (error) {
    console.error(`Failed to set store status to: ${status}:`, error);
    throw error;
  }
};

export const updateOpeningHours = async (hours: StoreSettings['openingHours']) => {
  const ref = doc(db, "settings", "store");
  await setDoc(ref, { openingHours: hours }, { merge: true });
};

export const listenToStoreSettings = (cb: (settings: StoreSettings) => void) => {
  const ref = doc(db, "settings", "store");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      cb({ ...DEFAULT_SETTINGS, ...docSnap.data() } as StoreSettings);
    } else {
      // Init with defaults on first access
      setDoc(ref, DEFAULT_SETTINGS);
      cb(DEFAULT_SETTINGS);
    }
  });
};
