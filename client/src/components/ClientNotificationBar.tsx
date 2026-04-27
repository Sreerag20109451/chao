"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  clearAllNotifications,
  markAllNotificationsAsRead,
  subscribeToClientNotifications,
} from "@/lib/firebase/orders/service";

interface ClientNotification {
  id: string;
  title: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
  read?: boolean;
  createdAt?: { seconds?: number };
}

interface ClientNotificationBarProps {
  scrolled?: boolean;
}

export default function ClientNotificationBar({ scrolled = false }: ClientNotificationBarProps) {
  const [uid, setUid] = useState<string | null>(auth.currentUser?.uid || null);
  const [notifications, setNotifications] = useState<ClientNotification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let stopNotifications = () => {};

    const stopAuth = onAuthStateChanged(auth, (firebaseUser) => {
      stopNotifications();
      if (!firebaseUser) {
        setUid(null);
        setNotifications([]);
        return;
      }

      setUid(firebaseUser.uid);
      stopNotifications = subscribeToClientNotifications(firebaseUser.uid, (items) =>
        setNotifications(items as ClientNotification[])
      );
    });

    return () => {
      stopNotifications();
      stopAuth();
    };
  }, []);

  const unread = useMemo(() => notifications.filter((item) => !item.read), [notifications]);

  const markUnreadAsRead = async () => {
    if (!uid || unread.length === 0) return;
    await markAllNotificationsAsRead(
      uid,
      unread.map((item) => item.id)
    );
  };

  const handleClearAll = async () => {
    if (!uid || notifications.length === 0) return;
    await clearAllNotifications(uid);
  };

  if (!uid) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`relative inline-flex items-center justify-center p-2 rounded-full border transition-colors ${
          scrolled
            ? "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
            : "bg-white border-brand-lavender-mid text-brand-text hover:text-brand-violet"
        }`}
        aria-label="Open notifications"
      >
        <Bell className="w-4 h-4" />
        {unread.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-h-[32rem] overflow-y-auto rounded-2xl border border-brand-lavender-mid bg-white shadow-xl z-50">
          <div className="p-4 border-b border-brand-lavender-mid flex items-center justify-between gap-2">
            <p className="text-base font-display font-bold text-brand-text">Notifications</p>
            <div className="flex items-center gap-2">
              <button
                onClick={markUnreadAsRead}
                className="text-[11px] font-display font-bold uppercase text-brand-violet hover:text-brand-violet-dark inline-flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark read
              </button>
              <button
                onClick={handleClearAll}
                className="text-[11px] font-display font-bold uppercase text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="p-5 text-base text-brand-muted font-body">No notifications yet.</p>
          ) : (
            <div className="divide-y divide-brand-lavender-mid">
              {notifications.map((item) => (
                <div key={item.id} className={`p-4 ${item.read ? "bg-white" : "bg-brand-lavender/20"}`}>
                  <p className="font-display text-base font-bold text-brand-text">{item.title}</p>
                  <p className="mt-1.5 text-sm font-body text-brand-muted">{item.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-wide text-brand-muted">
                    {item.createdAt?.seconds
                      ? new Date(item.createdAt.seconds * 1000).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
