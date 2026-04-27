"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Banknote, Search } from "lucide-react";
import { subscribeToOrders, updateOrderPaymentStatus } from "@/lib/firebase/orders/service";
import { toast } from "sonner";

type PaymentOrder = {
  id: string;
  customerName?: string;
  total?: number;
  paymentMethod?: "card" | "cod" | string;
  paymentStatus?: string;
  stripeSessionId?: string;
  status?: string;
  createdAt?: { seconds?: number };
};

/**
 * Admin payment monitoring screen.
 * This keeps payment method and payment status visible to operations staff
 * without forcing them to inspect raw Firestore documents.
 */
export default function PaymentsPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [search, setSearch] = useState("");
  const [updatingIds, setUpdatingIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((rows) => setOrders(rows as PaymentOrder[]));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const normalizeCardPayments = async () => {
      const cardRowsToNormalize = orders.filter((order) => {
        if (order.paymentMethod !== "card") return false;
        const status = (order.paymentStatus || "").toLowerCase();
        return status !== "completed";
      });

      if (cardRowsToNormalize.length === 0) return;

      for (const order of cardRowsToNormalize) {
        try {
          await updateOrderPaymentStatus(order.id, "completed");
        } catch (error) {
          console.error(`Failed to auto-update card payment ${order.id}:`, error);
        }
      }
    };

    void normalizeCardPayments();
  }, [orders]);

  const markCodAsCompleted = async (orderId: string) => {
    if (updatingIds.includes(orderId)) return;
    setUpdatingIds((prev) => [...prev, orderId]);
    try {
      await updateOrderPaymentStatus(orderId, "completed");
      toast.success("CoD payment marked as completed.");
    } catch (error) {
      console.error("Failed to update CoD payment status:", error);
      toast.error("Could not update CoD payment status.");
    } finally {
      setUpdatingIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const filtered = useMemo(() => {
    const needle = search.toLowerCase().trim();
    if (!needle) return orders;
    return orders.filter((order) =>
      order.id.toLowerCase().includes(needle) ||
      (order.customerName || "").toLowerCase().includes(needle) ||
      (order.paymentMethod || "").toLowerCase().includes(needle) ||
      (order.paymentStatus || "").toLowerCase().includes(needle)
    );
  }, [orders, search]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Payments</h1>
          <p className="text-brand-muted font-body">
            Monitor card and cash-on-delivery order payments in real time.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-brand-lavender-mid shadow-sm">
          <span className="font-display font-bold text-sm text-brand-text">
            {orders.filter((o) => o.paymentMethod === "card").length} Card Orders
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-mid bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order, customer, method, status..."
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-lavender/10">
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Payment Status</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Stripe Session</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-brand-muted font-display font-bold">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-lavender/5 transition-colors">
                    <td className="px-6 py-4 font-display font-bold text-brand-violet">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 text-sm font-body text-brand-text">
                      {order.customerName || "Guest"}
                    </td>
                    <td className="px-6 py-4 text-sm font-display font-bold text-brand-text">
                      €{(order.total || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                        {order.paymentMethod === "card" ? (
                          <><CreditCard className="w-3.5 h-3.5 text-brand-violet" /> Card</>
                        ) : (
                          <><Banknote className="w-3.5 h-3.5 text-amber-600" /> CoD</>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-text">
                          {order.paymentStatus || "unknown"}
                        </span>
                        {order.paymentMethod === "cod" &&
                          (order.paymentStatus || "").toLowerCase() !== "completed" && (
                            <button
                              type="button"
                              disabled={updatingIds.includes(order.id)}
                              onClick={() => void markCodAsCompleted(order.id)}
                              className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                            >
                              Complete
                            </button>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-brand-text">
                      {order.status || "pending"}
                    </td>
                    <td className="px-6 py-4 text-[10px] font-mono text-brand-muted">
                      {order.stripeSessionId ? `${order.stripeSessionId.slice(0, 14)}...` : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
