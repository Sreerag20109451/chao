"use client";

import React, { useEffect, useRef, useState } from "react";
import { subscribeToOrders } from "@/lib/firebase/orders/service";
import { Bell, ShoppingBag, Volume2, X } from "lucide-react";

// Generates a short WAV beep as a base64 data URL (no external URL needed)
function makeBeepUrl(freq = 880, durationSec = 0.25, sampleRate = 22050): string {
  const n = Math.floor(sampleRate * durationSec);
  const buf = new ArrayBuffer(44 + n * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => s.split("").forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, "RIFF"); v.setUint32(4, 36 + n * 2, true);
  w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true); v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  w(36, "data"); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, Math.min(t * 40, (durationSec - t) * 40));
    v.setInt16(44 + i * 2, Math.sin(2 * Math.PI * freq * t) * env * 0.8 * 32767, true);
  }
  let b = ""; const u = new Uint8Array(buf);
  for (let i = 0; i < u.length; i++) b += String.fromCharCode(u[i]);
  return "data:audio/wav;base64," + btoa(b);
}

import { useAuth } from "@/lib/authContext";

interface AlertOrder {
  id: string;
  customerName?: string;
  orderType?: string;
  total?: number;
}

export default function GlobalNotification() {
  const { user } = useAuth();
  const initialLoadRef = useRef(true);
  const previousOrdersRef = useRef<Set<string>>(new Set());
  const ringtoneRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [pendingAlerts, setPendingAlerts] = useState<AlertOrder[]>([]);

  // On mount: check if sound was previously enabled
  useEffect(() => {
    const wasEnabled = localStorage.getItem("chao_sound_enabled") === "true";
    if (wasEnabled) {
      setSoundEnabled(true);
    } else {
      // Show modal after a short delay to let the page settle
      const t = setTimeout(() => setShowPermissionModal(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // Build audio element once sound is enabled
  useEffect(() => {
    if (soundEnabled && !audioRef.current) {
      const beepUrl = makeBeepUrl(880, 0.25);
      audioRef.current = new Audio(beepUrl);
      audioRef.current.volume = 1.0;
    }
  }, [soundEnabled]);

  // Subscribe to orders - only if authenticated
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToOrders((orders) => {
      const currentIds = new Set(orders.map((o) => o.id));
      if (initialLoadRef.current) {
        initialLoadRef.current = false;
        previousOrdersRef.current = currentIds;
        return;
      }
      const newPending = orders.filter(
        (o) => !previousOrdersRef.current.has(o.id) && o.status === "pending"
      );
      if (newPending.length > 0) {
        setPendingAlerts((prev) => [...prev, ...newPending]);
        startRingtone();
      }
      previousOrdersRef.current = currentIds;
    });
    return () => unsubscribe();
  }, [soundEnabled, user]);

  const startRingtone = () => {
    if (ringtoneRef.current) return; // already ringing
    const play = () => {
      if (audioRef.current && soundEnabled) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        // Play second beep after 350ms for ring-ring effect
        setTimeout(() => {
          if (audioRef.current) {
            const beep2 = new Audio(audioRef.current.src);
            beep2.volume = 1.0;
            beep2.play().catch(() => {});
          }
        }, 350);
      }
    };
    play();
    ringtoneRef.current = setInterval(play, 2000);
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      clearInterval(ringtoneRef.current);
      ringtoneRef.current = null;
    }
  };

  const handleEnableSound = () => {
    // Must play in this click handler to satisfy browser autoplay policy
    const beepUrl = makeBeepUrl(880, 0.25);
    const testAudio = new Audio(beepUrl);
    testAudio.volume = 1.0;
    testAudio.play().then(() => {
      audioRef.current = testAudio;
      setSoundEnabled(true);
      localStorage.setItem("chao_sound_enabled", "true");
      setShowPermissionModal(false);
    }).catch((err) => {
      console.error("Audio play failed:", err);
      // Try anyway
      setSoundEnabled(true);
      localStorage.setItem("chao_sound_enabled", "true");
      setShowPermissionModal(false);
    });
  };

  const dismissAll = () => {
    stopRingtone();
    setPendingAlerts([]);
  };

  return (
    <>
      {/* ── Sound Permission Modal (first time) ── */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400">
            <div className="bg-brand-violet p-8 text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display font-bold text-xl text-white">Enable Sound Alerts</h2>
              <p className="text-white/70 text-sm font-body mt-2">
                You'll hear a ringtone whenever a new order arrives.
              </p>
            </div>
            <div className="p-6 space-y-3">
              <button
                onClick={handleEnableSound}
                className="w-full flex items-center justify-center gap-2 bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 transition-all active:scale-95"
              >
                <Bell className="w-4 h-4" />
                Enable Sound Notifications
              </button>
              <button
                onClick={() => {
                  setShowPermissionModal(false);
                  localStorage.setItem("chao_sound_enabled", "false");
                }}
                className="w-full text-brand-muted font-body text-sm py-2 hover:text-brand-text transition-colors"
              >
                Skip (no sound)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Order Alert Modal ── */}
      {pendingAlerts.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="bg-brand-violet p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10 animate-ping rounded-t-[2rem]" />
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Bell className="w-10 h-10 text-white animate-bounce" />
              </div>
              <h2 className="font-display font-bold text-2xl text-white relative">
                {pendingAlerts.length === 1 ? "New Order!" : `${pendingAlerts.length} New Orders!`}
              </h2>
              <p className="text-white/70 text-sm font-body mt-1 relative">Incoming — action required</p>
            </div>

            <div className="divide-y divide-brand-lavender-mid max-h-64 overflow-y-auto">
              {pendingAlerts.map((order) => (
                <div key={order.id} className="flex items-center gap-4 p-5">
                  <div className="w-10 h-10 bg-brand-violet/10 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5 text-brand-violet" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-brand-text text-sm">
                      #{order.id.slice(0, 6).toUpperCase()}
                    </p>
                    <p className="font-body text-xs text-brand-muted">
                      {order.customerName || "Guest"} · {(order.orderType || "").toUpperCase()} · £{order.total?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5">
              <button
                onClick={dismissAll}
                className="w-full flex items-center justify-center gap-2 bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
                Acknowledge &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
