"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Utensils, TrendingUp, Power, PowerOff, X, Bike, Clock, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { listenToStoreSettings, toggleStoreStatus, initStoreSettings } from "@/lib/firebase/settings/service";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { subscribeToOrders } from "@/lib/firebase/orders/service";
import { getDashboardOrderSummary } from "@/lib/orders/summary";
import { parseOrderDate } from "@/controllers/ordersController";

export default function DashboardPage() {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [activeItemsCount, setActiveItemsCount] = useState(0);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    initStoreSettings();
    const unsubSettings = listenToStoreSettings((settings) => {
      setIsAcceptingOrders(settings.isAcceptingOrders);
    });
    const unsubMenu = listenToMenu((items) => {
      setActiveItemsCount(items.filter(i => i.available !== false).length);
    });
    const unsubOrders = subscribeToOrders((allOrders) => {
      setOrders(allOrders);
    });
    return () => {
      unsubSettings();
      unsubMenu();
      unsubOrders();
    };
  }, []);
  
  const handleToggleOrders = async (val: boolean) => {
    try {
      await toggleStoreStatus(val);
      toast(val ? "Restaurant is now accepting orders" : "Restaurant is now closed for orders", {
        icon: val ? <Power className="w-4 h-4 text-emerald-500" /> : <PowerOff className="w-4 h-4 text-red-500" />,
      });
    } catch (e) {
      toast.error("Failed to update store status");
    }
  };

  const { activeTodaysOrders, todaysRevenue, weeklyOrders, weeklyRevenue } =
    getDashboardOrderSummary(orders);

  const stats = [
    {
      title: "Today's Revenue",
      value: `€${todaysRevenue.toFixed(2)}`,
      change: `${activeTodaysOrders.length} active orders`,
      icon: <DollarSign className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Weekly Revenue",
      value: `€${weeklyRevenue.toFixed(2)}`,
      change: `${weeklyOrders.length} orders this week`,
      icon: <TrendingUp className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Active Menu Items",
      value: activeItemsCount.toString(),
      change: "Menu is live",
      icon: <Utensils className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Store Status",
      value: isAcceptingOrders ? "Online" : "Offline",
      change: isAcceptingOrders ? "Accepting orders" : "Paused",
      icon: isAcceptingOrders ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <PowerOff className="w-4 h-4 text-red-500" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="font-display font-bold text-3xl text-brand-text">Dashboard Overview</h1>
          <p className="font-body text-brand-muted">Here&apos;s what&apos;s happening at Chao today.</p>
        </div>
        
        <div className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] border transition-all ${
          isAcceptingOrders 
            ? 'bg-emerald-50 border-emerald-100 shadow-sm shadow-emerald-100' 
            : 'bg-red-50 border-red-100 shadow-sm shadow-red-100 opacity-80'
        }`}>
          <div className="flex flex-col">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isAcceptingOrders ? 'text-emerald-600' : 'text-red-600'}`}>
              Store Status
            </span>
            <span className="font-display font-bold text-sm text-brand-text">
              {isAcceptingOrders ? 'Accepting Orders' : 'Paused / Closed'}
            </span>
          </div>
          <Switch 
            checked={isAcceptingOrders}
            onCheckedChange={handleToggleOrders}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-brand-lavender-mid shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="font-display font-medium text-sm text-brand-muted">
                {stat.title}
              </CardTitle>
              <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display font-bold text-2xl text-brand-text">
                {stat.value}
              </div>
              <p className="font-body text-xs text-brand-muted mt-1 italic">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-brand-lavender-mid shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-sm">
           <div className="w-16 h-16 rounded-full bg-brand-violet/10 flex items-center justify-center mb-4">
               <TrendingUp className="w-8 h-8 text-brand-violet opacity-50" />
           </div>
           <p className="font-display font-medium text-brand-muted">Revenue Analytics (Coming Soon)</p>
        </Card>
        
        <Card className="border-brand-lavender-mid shadow-sm flex flex-col p-0 bg-white/60 backdrop-blur-sm overflow-hidden">
           <CardHeader className="border-b border-brand-lavender-mid bg-white/50">
             <CardTitle className="font-display font-bold text-lg text-brand-text">Recent Orders Today</CardTitle>
           </CardHeader>
           <CardContent className="p-0 overflow-y-auto max-h-[400px]">
             {activeTodaysOrders.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                 <div className="w-16 h-16 rounded-full bg-brand-violet/10 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-brand-violet opacity-50" />
                 </div>
                 <p className="font-display font-medium text-brand-muted">No orders yet today</p>
               </div>
             ) : (
               <div className="divide-y divide-brand-lavender-mid">
                 {activeTodaysOrders.slice(0, 10).map(order => {
                    const orderDate = parseOrderDate(order.createdAt) ?? new Date();
                    const timeStr = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    return (
                      <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            order.orderType === 'delivery' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {order.orderType === 'delivery' ? <Bike className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-display font-bold text-brand-text text-sm">
                              {order.orderId || `#${order.id.slice(0, 6)}`} • {order.customerName || "Guest"}
                            </p>
                            <p className="text-[10px] text-brand-muted font-body uppercase tracking-wider mt-0.5">
                              {timeStr} • {order.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end">
                          <span className="font-display font-bold text-brand-text">€{order.total?.toFixed(2)}</span>
                          <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            order.status === "cancelled" ? "bg-red-50 text-red-600" : (order.status === "pending" || order.status === "preparing" ? "bg-brand-violet/10 text-brand-violet" : "bg-emerald-50 text-emerald-600")
                          }`}>
                            {order.status === "cancelled" ? <X className="w-3 h-3" /> : (order.status === "pending" || order.status === "preparing" ? <Clock className="w-3 h-3 animate-pulse" /> : <CheckCircle2 className="w-3 h-3" />)}
                            {order.status}
                          </span>
                        </div>
                      </div>
                    );
                 })}
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
