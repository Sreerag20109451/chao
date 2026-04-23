import React, { useState, useEffect } from "react";
import { ShoppingBag, Clock, CheckCircle2, XCircle, Search, FileText, ChevronDown } from "lucide-react";
import { subscribeToOrders } from "@/lib/firebase/orders/service";
import { doc, updateDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Invoice, { InvoiceData } from "../Invoice";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "delivered", "cancelled"] as const;
type OrderStatus = typeof STATUS_OPTIONS[number];

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending:   "bg-amber-50   text-amber-600  border-amber-200",
  preparing: "bg-brand-violet/10 text-brand-violet border-brand-violet/20",
  ready:     "bg-blue-50    text-blue-600   border-blue-200",
  delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
  cancelled: "bg-red-50     text-red-500    border-red-200",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState<any | null>(null);
  const [activeDriver, setActiveDriver] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Subscribe to live orders
  useEffect(() => {
    const unsubscribe = subscribeToOrders((newOrders) => setOrders(newOrders));
    return () => unsubscribe();
  }, []);

  // Fetch today's active driver once
  useEffect(() => {
    getDocs(query(collection(db, "drivers"), where("isWorkingToday", "==", true)))
      .then(snap => {
        if (!snap.empty) setActiveDriver(snap.docs[0].data().name);
      })
      .catch(console.error);
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (e) {
      console.error("Failed to update status:", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter(o =>
    !search ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.customerName || "").toLowerCase().includes(search.toLowerCase())
  );

  const buildInvoiceData = (order: any): InvoiceData => ({
    orderId: order.id,
    customerName: order.customerName || "Guest",
    customerPhone: order.customerPhone || undefined,
    address: order.address || undefined,
    orderType: order.orderType || "collection",
    items: (order.items || []).map((i: any) => ({
      name: i.name,
      quantity: i.quantity,
      price: i.basePrice || 0,
      selectedProtein: i.selectedProtein || undefined,
      selectedSide: i.selectedSide || undefined,
    })),
    subtotal: order.subtotal || 0,
    deliveryCharge: order.deliveryCharge || 0,
    total: order.total || 0,
    date: order.createdAt
      ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
      : new Date().toLocaleDateString(),
    time: order.createdAt
      ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    driverName: order.orderType === "delivery" ? (activeDriver || undefined) : undefined,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Active Orders</h1>
          <p className="text-brand-muted font-body">Track and manage incoming restaurant orders.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-brand-lavender-mid shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
          <span className="font-display font-bold text-sm text-brand-text">
            {orders.filter(o => o.status === "pending").length} Live Orders
          </span>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        {/* Search bar */}
        <div className="p-6 border-b border-brand-lavender-mid flex items-center gap-4 bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by ID or customer…"
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-lavender/10">
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-4 text-brand-muted">
                      <ShoppingBag className="w-10 h-10 opacity-30" />
                      <p className="font-display font-bold">No orders yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <tr key={order.id} className="hover:bg-brand-lavender/5 transition-colors">
                    {/* ID */}
                    <td className="px-6 py-4 font-display font-bold text-brand-violet">
                      #{order.id.slice(0, 6)}
                      {order.source === "pos" && (
                        <span className="ml-1 text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-bold uppercase">POS</span>
                      )}
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <p className="font-display font-bold text-brand-text">{order.customerName || "Guest"}</p>
                      <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{order.orderType}</p>
                    </td>

                    {/* Items */}
                    <td className="px-6 py-4 font-body text-sm text-brand-muted">
                      {order.items?.length || 0} items
                    </td>

                    {/* Total */}
                    <td className="px-6 py-4 font-display font-bold text-brand-text text-lg">
                      £{order.total?.toFixed(2) || "0.00"}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-6 py-4">
                      <div className="relative inline-block">
                        <select
                          value={order.status || "pending"}
                          disabled={updatingId === order.id}
                          onChange={e => updateStatus(order.id, e.target.value as OrderStatus)}
                          className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider border cursor-pointer focus:outline-none transition-all ${STATUS_STYLES[order.status as OrderStatus] || STATUS_STYLES.pending} disabled:opacity-60`}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </td>

                    {/* Time */}
                    <td className="px-6 py-4 text-xs font-body text-brand-muted">
                      {order.createdAt
                        ? new Date(order.createdAt.seconds * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "Just now"}
                    </td>

                    {/* Invoice button */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setInvoiceOrder(order)}
                        className="inline-flex items-center gap-1.5 text-brand-violet hover:text-brand-violet-dark font-display font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {invoiceOrder && (
        <Invoice
          data={buildInvoiceData(invoiceOrder)}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
}
