import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config";

export interface OpeningTime {
  open: string;
  close: string;
  closed: boolean;
}

export interface StoreSettings {
  isAcceptingOrders: boolean;
  storeName: string;
  storeEmail: string;
  openingHours: {
    mon: OpeningTime;
    tue: OpeningTime;
    wed: OpeningTime;
    thu: OpeningTime;
    fri: OpeningTime;
    sat: OpeningTime;
    sun: OpeningTime;
  };
  minPrepTime: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  isAcceptingOrders: true,
  storeName: "Chao Thai",
  storeEmail: "hello@chaothai.ie",
  openingHours: {
    mon: { open: "12:00", close: "22:00", closed: false },
    tue: { open: "12:00", close: "22:00", closed: false },
    wed: { open: "12:00", close: "22:00", closed: false },
    thu: { open: "12:00", close: "22:00", closed: false },
    fri: { open: "12:00", close: "23:00", closed: false },
    sat: { open: "12:00", close: "23:00", closed: false },
    sun: { open: "12:00", close: "22:00", closed: false },
  },
  minPrepTime: 20,
};

export const listenToStoreSettings = (cb: (settings: StoreSettings) => void) => {
  const ref = doc(db, "settings", "store");
  return onSnapshot(ref, (docSnap) => {
    if (docSnap.exists()) {
      cb({ ...DEFAULT_SETTINGS, ...docSnap.data() } as StoreSettings);
    } else {
      cb(DEFAULT_SETTINGS);
    }
  });
};
