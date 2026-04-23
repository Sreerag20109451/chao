import { useState, useEffect } from 'react';
import { listenToStoreSettings, StoreSettings } from '@/lib/firebase/settings/service';

const DAY_KEYS: (keyof StoreSettings['openingHours'])[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const parseTime = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h + m / 60;
};

export const useStoreStatus = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    const unsub = listenToStoreSettings((s) => setSettings(s));
    return () => unsub();
  }, []);

  const isOpenNow = (): boolean => {
    if (!settings) return true; // optimistic while loading
    return settings.isAcceptingOrders;
  };

  return { 
    isOpen: isOpenNow(), 
    isAcceptingOrders: settings?.isAcceptingOrders ?? true, 
    isLoaded: settings !== null,
    settings,
  };
};
