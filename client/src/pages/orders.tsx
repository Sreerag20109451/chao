import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { auth, subscribeToUserOrders } from "@/lib/firebase";
import { 
  ShoppingBag, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Bike,
  Store,
  Calendar
} from "lucide-react";

type TimestampLike = {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
};

type ClientOrderItem = {
  quantity: number;
  name: string;
  selectedProtein?: string;
  selectedSide?: string;
  selectedSpice?: string;
};

type ClientOrder = {
  id: string;
  status: string;
  orderType: "delivery" | "collection";
  paymentMethod?: "card" | "cod" | string;
  total: number;
  createdAt?: TimestampLike | Date | string | number | null;
  date?: string;
  items: ClientOrderItem[];
};

export default function OrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [liveOrders, setLiveOrders] = useState<ClientOrder[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);

  // Support Firestore Timestamp, legacy timestamp-like objects, ISO strings, and Date.
  const parseOrderDate = (value: ClientOrder["createdAt"]): Date | null => {
    if (!value) return null;
    if (typeof value?.toDate === "function") {
      const dt = value.toDate();
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (typeof value?.seconds === "number") {
      const dt = new Date(value.seconds * 1000 + Math.floor((value.nanoseconds || 0) / 1_000_000));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (typeof value?._seconds === "number") {
      const dt = new Date(value._seconds * 1000 + Math.floor((value._nanoseconds || 0) / 1_000_000));
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value === "string" || typeof value === "number") {
      const dt = new Date(value);
      return Number.isNaN(dt.getTime()) ? null : dt;
    }
    return null;
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const uid = auth.currentUser?.uid || "";
    const email = user.email;

    return subscribeToUserOrders(uid, email, (orders: ClientOrder[]) => {
      setLiveOrders(orders);
    });
  }, [user]);
  const formatOrderDateTime = (order: ClientOrder) => {
    const validDate = parseOrderDate(order.createdAt);
    const fallback = order.date || "Unknown date";

    return {
      date: validDate ? validDate.toLocaleDateString("en-IE") : fallback,
      time: validDate
        ? validDate.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })
        : "",
    };
  };

  // Toggle detail visibility for an order without mutating the order payload.
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderIds((current) =>
      current.includes(orderId)
        ? current.filter((id) => id !== orderId)
        : [...current, orderId]
    );
  };

  if (!user) return null;
  const ordersToRender: ClientOrder[] = liveOrders.length > 0 ? liveOrders : (user.orders as ClientOrder[]);

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-10">
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-violet transition-colors font-display font-bold text-sm uppercase tracking-wider mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight">
            Order <span className="text-brand-violet">History.</span>
          </h1>
        </header>

        <div className="space-y-6">
          {ordersToRender.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 p-12 text-center shadow-xl">
              <div className="w-20 h-20 bg-brand-lavender rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-brand-lavender-mid" />
              </div>
              <h2 className="font-display font-bold text-brand-text text-2xl mb-2">No orders yet</h2>
              <p className="font-body text-brand-muted mb-8">Hungry? Start exploring our menu!</p>
              <Link href="/menu" className="inline-flex items-center justify-center bg-brand-violet text-white font-display font-bold rounded-2xl px-8 py-4 shadow-violet-glow">Explore Menu</Link>
            </div>
          ) : (
            ordersToRender.map((order) => (
              <div key={order.id} className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-lg overflow-hidden group">
                {(() => {
                  const { date, time } = formatOrderDateTime(order);
                  return (
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-lavender-mid/50">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      {order.status === "delivered" ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                      ) : order.status === "cancelled" ? (
                        <XCircle className="w-7 h-7 text-red-500" />
                      ) : (
                        <Clock className="w-7 h-7 text-brand-violet animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-brand-text text-lg">Order #{order.id.slice(0, 8)}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          order.status === "delivered" 
                            ? "bg-emerald-100 text-emerald-700" 
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : order.status === "ready"
                            ? "bg-blue-100 text-blue-700 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                            : "bg-brand-violet/10 text-brand-violet"
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-body text-brand-muted">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {date}{time ? `, ${time}` : ""}
                        </span>
                        <span className="flex items-center gap-1 capitalize">{order.orderType === "delivery" ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}{order.orderType}</span>
                        <span className="flex items-center gap-1 capitalize">
                          Payment: {order.paymentMethod === "card" ? "Card" : order.paymentMethod === "cod" ? "Cash on Delivery" : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <span className="font-display font-bold text-brand-text text-2xl">€{order.total.toFixed(2)}</span>
                    <button
                      type="button"
                      onClick={() => toggleOrderDetails(order.id)}
                      className="text-brand-violet font-display font-bold text-xs uppercase flex items-center gap-1 group"
                    >
                      {expandedOrderIds.includes(order.id) ? "Hide Details" : "View Details"}
                      <ChevronRight className={`w-4 h-4 transition-transform ${expandedOrderIds.includes(order.id) ? "rotate-90" : "group-hover:translate-x-1"}`} />
                    </button>
                  </div>
                </div>
                  );
                })()}
                {expandedOrderIds.includes(order.id) && (
                  <div className="p-6 bg-brand-lavender/10 animate-in fade-in duration-200">
                    <div className="mb-4 grid gap-2 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Order Type</p>
                        <p className="font-body text-sm text-brand-text capitalize">{order.orderType}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Status</p>
                        <p className="font-body text-sm text-brand-text capitalize">{order.status}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Payment Type</p>
                        <p className="font-body text-sm text-brand-text capitalize">
                          {order.paymentMethod === "card" ? "Card" : order.paymentMethod === "cod" ? "Cash on Delivery" : "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Keep line-items in a dedicated section so details remain scannable. */}
                    <div className="flex flex-wrap gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-brand-lavender-mid flex flex-col gap-0.5 shadow-sm min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="bg-brand-violet text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">{item.quantity}</span>
                            <span className="font-body text-sm text-brand-text truncate">{item.name}</span>
                          </div>
                          {(item.selectedProtein || item.selectedSide || item.selectedSpice) && (
                            <span className="text-[10px] text-brand-muted pl-7 truncate">
                              {[item.selectedProtein, item.selectedSide, item.selectedSpice].filter(Boolean).join(" · ")}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
