import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
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

export default function OrdersPage() {
  const { user } = useSelector((state: RootState) => state.auth);

  if (!user) return null;

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
          {user.orders.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 p-12 text-center shadow-xl">
              <div className="w-20 h-20 bg-brand-lavender rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-10 h-10 text-brand-lavender-mid" />
              </div>
              <h2 className="font-display font-bold text-brand-text text-2xl mb-2">No orders yet</h2>
              <p className="font-body text-brand-muted mb-8">Hungry? Start exploring our menu!</p>
              <Link href="/menu" className="inline-flex items-center justify-center bg-brand-violet text-white font-display font-bold rounded-2xl px-8 py-4 shadow-violet-glow">Explore Menu</Link>
            </div>
          ) : (
            user.orders.map((order) => (
              <div key={order.id} className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-lg overflow-hidden group">
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-brand-lavender-mid/50">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      {order.status === "delivered" ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : order.status === "processing" ? <Clock className="w-7 h-7 text-brand-violet animate-pulse" /> : <XCircle className="w-7 h-7 text-red-500" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display font-bold text-brand-text text-lg">Order #{order.id}</span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${order.status === "delivered" ? "bg-emerald-100 text-emerald-700" : order.status === "processing" ? "bg-brand-violet/10 text-brand-violet" : "bg-red-100 text-red-700"}`}>{order.status}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-body text-brand-muted">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{order.date}</span>
                        <span className="flex items-center gap-1 capitalize">{order.orderType === "delivery" ? <Bike className="w-3.5 h-3.5" /> : <Store className="w-3.5 h-3.5" />}{order.orderType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <span className="font-display font-bold text-brand-text text-2xl">£{order.total.toFixed(2)}</span>
                    <button className="text-brand-violet font-display font-bold text-xs uppercase flex items-center gap-1 group">View Details <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></button>
                  </div>
                </div>
                <div className="p-6 bg-brand-lavender/10">
                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="bg-white px-3 py-2 rounded-xl border border-brand-lavender-mid flex items-center gap-2 shadow-sm">
                        <span className="bg-brand-violet text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                        <span className="font-body text-sm text-brand-text">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
