import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config";

export interface OpeningTime {
  open: string;
  close: string;
  closed: boolean;
}

export interface MeatOption {
  price: number;
  available: boolean;
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
  meatOptions: Record<string, MeatOption>;
}

const DEFAULT_SETTINGS: StoreSettings = {
  isAcceptingOrders: true,
  storeName: "Chao Thai",
  storeEmail: "chao.waterford@gmail.com",
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
  meatOptions: {
    "Tofu": { price: 0, available: true },
    "Paneer": { price: 0, available: true },
    "Chicken": { price: 0, available: true },
    "Duck": { price: 1, available: true },
    "Lamb": { price: 2, available: true },
    "Prawn": { price: 1, available: true },
    "Beef": { price: 1, available: true },
  },
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
