import React from "react";
import { ShoppingBag, Clock, CheckCircle2, XCircle, Search, Filter } from "lucide-react";

export default function AdminOrders() {
  const mockOrders = [
    { id: "ORD-721", customer: "Sreerag Sathian", items: "Green Curry, Pad Thai", total: 24.50, status: "processing", type: "delivery", time: "10 mins ago" },
    { id: "ORD-720", customer: "John Doe", items: "Massaman Curry, Satay Gai", total: 18.20, status: "delivered", type: "collection", time: "45 mins ago" },
    { id: "ORD-719", customer: "Sarah Smith", items: "Tom Yum, Jasmine Rice", total: 12.00, status: "delivered", type: "delivery", time: "1 hour ago" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Active Orders</h1>
          <p className="text-brand-muted font-body">Track and manage incoming restaurant orders.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-brand-lavender-mid shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-brand-violet animate-pulse" />
            <span className="font-display font-bold text-sm text-brand-text">12 Live Orders</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-mid flex flex-col md:flex-row gap-4 items-center justify-between bg-white/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input 
              type="text"
              placeholder="Search orders..."
              className="w-full pl-12 pr-4 py-2.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-brand-lavender-mid rounded-xl font-display font-bold text-sm text-brand-text hover:bg-brand-lavender transition-all">
              <Filter className="w-4 h-4 text-brand-violet" />
              Filter
            </button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-lavender text-brand-violet rounded-xl font-display font-bold text-sm hover:bg-brand-lavender-mid transition-all">
              Export CSV
            </button>
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
                <th className="px-6 py-4 text-xs font-display font-bold text-brand-muted uppercase tracking-wider text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-lavender-mid">
              {mockOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-lavender/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-display font-bold text-brand-violet">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-display font-bold text-brand-text">{order.customer}</p>
                    <p className="text-[10px] text-brand-muted font-bold uppercase tracking-wider">{order.type}</p>
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-brand-muted">
                    {order.items}
                  </td>
                  <td className="px-6 py-4 font-display font-bold text-brand-text text-lg">
                    £{order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      order.status === "processing" 
                        ? "bg-brand-violet/5 text-brand-violet border-brand-violet/20" 
                        : "bg-emerald-50 text-emerald-600 border-emerald-100"
                    }`}>
                      {order.status === "processing" ? <Clock className="w-3 h-3 animate-pulse" /> : <CheckCircle2 className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-body text-brand-muted">
                    {order.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
