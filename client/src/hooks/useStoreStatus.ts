import { useState, useEffect, useMemo } from 'react';
import { listenToStoreSettings, StoreSettings } from '@/lib/firebase/settings/service';

const DAY_KEYS: (keyof StoreSettings['openingHours'])[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const parseTime = (t: string): number => {
  if (!t) return 0;
  // Handle various formats (HH:mm, H:mm)
  const parts = t.split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  return h + m / 60;
};

export const useStoreStatus = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  // Track "now" in a way that triggers re-renders
  const [now, setNow] = useState(new Date());

  const forceStoreOpenForE2E =
    typeof window !== 'undefined' &&
    Boolean((window as typeof window & { Cypress?: unknown }).Cypress) &&
    window.localStorage.getItem('E2E_FORCE_STORE_OPEN') === 'true';

  useEffect(() => {
    console.log("Auth/Store: Subscribing to live store settings...");
    const unsub = listenToStoreSettings((s) => {
      console.log("Auth/Store: Settings updated from database", s);
      setSettings(s);
    });
    
    // Check every 30 seconds to keep the "closed/open" status fresh
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const isOpen = useMemo((): boolean => {
    if (forceStoreOpenForE2E) {
      return true;
    }

    if (!settings) {
      console.log("Auth/Store: No settings loaded yet, returning true (optimistic)");
      return true; 
    }
    
    // 1. Check for manual Admin override (isAcceptingOrders)
    if (settings.isAcceptingOrders === false) {
      console.log("Auth/Store: CLOSED - Manual override by Admin (isAcceptingOrders = false)");
      return false;
    }
    
    // 2. Check current time against opening hours
    const dayKey = DAY_KEYS[now.getDay()];
    const hours = settings.openingHours?.[dayKey];
    
    if (!hours) {
      console.warn(`Auth/Store: Missing opening hours for ${dayKey}`);
      return true;
    }

    if (hours.closed) {
      console.log(`Auth/Store: CLOSED - Store is marked as closed for ${dayKey}`);
      return false;
    }
    
    const currentTime = now.getHours() + now.getMinutes() / 60;
    const openTime = parseTime(hours.open);
    let closeTime = parseTime(hours.close);
    
    // Handle midnight/early morning closing (e.g. 00:00 or 01:00)
    if (closeTime === 0 || closeTime <= openTime) {
      closeTime = 24;
    }

    const isWithinHours = currentTime >= openTime && currentTime < closeTime;
    
    console.log(`Auth/Store: Checking ${dayKey} Status:`, {
      currentTime: currentTime.toFixed(2),
      openRange: `${hours.open} - ${hours.close}`,
      isWithinHours
    });

    return isWithinHours;
  }, [forceStoreOpenForE2E, settings, now]);

  return { 
    isOpen, 
    isAcceptingOrders: forceStoreOpenForE2E ? true : settings?.isAcceptingOrders ?? true,
    isLoaded: forceStoreOpenForE2E ? true : settings !== null,
    settings,
  };
};
