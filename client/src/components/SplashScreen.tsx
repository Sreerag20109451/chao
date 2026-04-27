"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

const SPLASH_TEXT = "Fresh Thai. Fast Delivery. Pure Flavor.";
const TYPE_SPEED_MS = 60;
const HOLD_AFTER_TYPE_MS = 900;

export default function SplashScreen() {
  const [typedCount, setTypedCount] = useState(0);
  const [visible, setVisible] = useState(true);

  const typedText = useMemo(() => SPLASH_TEXT.slice(0, typedCount), [typedCount]);

  useEffect(() => {
    let hideTimeout: number | undefined;

    const interval = window.setInterval(() => {
      setTypedCount((prev) => {
        if (prev >= SPLASH_TEXT.length) {
          window.clearInterval(interval);
          hideTimeout = window.setTimeout(() => {
            setVisible(false);
          }, HOLD_AFTER_TYPE_MS);
          return prev;
        }
        return prev + 1;
      });
    }, TYPE_SPEED_MS);

    return () => {
      window.clearInterval(interval);
      if (hideTimeout) window.clearTimeout(hideTimeout);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-8 px-6 text-center">
        <div className="relative w-40 h-40 overflow-hidden rounded-2xl">
          <Image src="/pnglogo.png" alt="Chao Logo" fill sizes="160px" className="object-cover" priority />
        </div>
        <p className="font-display text-lg sm:text-2xl font-bold tracking-wide text-white min-h-8">
          {typedText}
          <span className="typewriter-caret" aria-hidden="true">|</span>
        </p>
      </div>
    </div>
  );
}

