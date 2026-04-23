import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config";

export interface OpeningTime {
  open: string;
  close: string;
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
