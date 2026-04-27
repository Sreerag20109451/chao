"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, MailOpen, Search } from "lucide-react";
import {
  type AdminMessage,
  setAllMessagesReadState,
  setMessageReadState,
  subscribeToMessages,
} from "@/lib/firebase/messages/service";
import { toast } from "sonner";

const toDate = (value: AdminMessage["createdAt"]) => {
  if (!value?.seconds) return null;
  return new Date(value.seconds * 1000);
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [search, setSearch] = useState("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      (rows) => {
        setMessages(rows);
        setLoadError(null);
      },
      (error) => {
        const message = String(error?.message || "");
        setLoadError(
          message.toLowerCase().includes("permission")
            ? "Messages could not be loaded due to Firestore permissions. Make sure the latest rules are deployed and you're signed in as an admin."
            : "Messages could not be loaded right now."
        );
      }
    );
    return () => unsubscribe();
  }, []);

  const unreadCount = useMemo(() => messages.filter((msg) => !msg.read).length, [messages]);
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return messages;
    return messages.filter((msg) =>
      msg.name.toLowerCase().includes(needle) ||
      msg.email.toLowerCase().includes(needle) ||
      msg.message.toLowerCase().includes(needle)
    );
  }, [messages, search]);

  const applyBulkState = async (read: boolean) => {
    const ids = messages.map((msg) => msg.id);
    if (ids.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await setAllMessagesReadState(ids, read);
      toast.success(read ? "Marked all as read." : "Marked all as unread.");
    } catch (error) {
      console.error("Bulk message update failed:", error);
      toast.error("Could not update all messages.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Messages</h1>
          <p className="text-brand-muted font-body">Manage customer contact submissions.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-brand-lavender-mid shadow-sm">
          <span className="font-display font-bold text-sm text-brand-text">{unreadCount} Unread</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        {loadError && (
          <div className="mx-6 mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-body text-amber-800">
            {loadError}
          </div>
        )}
        <div className="p-6 border-b border-brand-lavender-mid bg-white/50 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages by name, email, or text..."
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => applyBulkState(true)}
              className="px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
            >
              Read all
            </button>
            <button
              type="button"
              disabled={isBulkUpdating}
              onClick={() => applyBulkState(false)}
              className="px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider bg-amber-100 text-amber-700 hover:bg-amber-200 disabled:opacity-50"
            >
              Unread all
            </button>
          </div>
        </div>

        <div className="divide-y divide-brand-lavender-mid">
          {filtered.length === 0 ? (
            <div className="px-6 py-16 text-center text-brand-muted font-display font-bold">No messages found.</div>
          ) : (
            filtered.map((msg) => {
              const created = toDate(msg.createdAt);
              return (
                <div key={msg.id} className={`px-6 py-5 ${msg.read ? "bg-white" : "bg-brand-lavender/10"}`}>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-brand-text">{msg.name}</p>
                        <span className="text-xs text-brand-muted">{msg.email}</span>
                      </div>
                      <p className="font-body text-sm text-brand-text whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-[11px] text-brand-muted">
                        {created
                          ? `${created.toLocaleDateString("en-IE")} ${created.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : "Just now"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void setMessageReadState(msg.id, !msg.read)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-colors ${
                        msg.read
                          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      {msg.read ? <Mail className="w-3.5 h-3.5" /> : <MailOpen className="w-3.5 h-3.5" />}
                      {msg.read ? "Mark unread" : "Mark read"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

