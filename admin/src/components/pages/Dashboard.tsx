"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Utensils, TrendingUp, Power, PowerOff } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { listenToStoreSettings, toggleStoreStatus, initStoreSettings } from "@/lib/firebase/settings/service";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { subscribeToOrders } from "@/lib/firebase/orders/service";
import { Clock, CheckCircle2 } from "lucide-react";

export default function DashboardPage() {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [activeItemsCount, setActiveItemsCount] = useState(0);

  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // Init settings doc in Firestore if it doesn't exist yet
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
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(o => {
    if (!o.createdAt) return true; // optimistic local update
    const orderDate = new Date(o.createdAt.seconds * 1000).setHours(0, 0, 0, 0);
    return orderDate === today;
  });

  const todaysRevenue = todaysOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = todaysOrders.length ? todaysRevenue / todaysOrders.length : 0;
  
  const stats = [
    {
      title: "Today's Revenue",
      value: `£${todaysRevenue.toFixed(2)}`,
      change: todaysOrders.length > 0 ? "Live" : "Waiting for first order",
      icon: <DollarSign className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Orders (Today)",
      value: todaysOrders.length.toString(),
      change: todaysOrders.length > 0 ? "Live" : "No orders yet",
      icon: <ShoppingBag className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Active Menu Items",
      value: activeItemsCount.toString(),
      change: "Menu is live",
      icon: <Utensils className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Avg Order Value",
      value: `£${avgOrderValue.toFixed(2)}`,
      change: todaysOrders.length > 0 ? "Live" : "No data available",
      icon: <TrendingUp className="w-4 h-4 text-brand-violet" />,
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
           <p className="font-display font-medium text-brand-muted">Revenue Chart (Coming Soon)</p>
        </Card>
        
        <Card className="border-brand-lavender-mid shadow-sm flex flex-col p-0 bg-white/60 backdrop-blur-sm overflow-hidden">
           <CardHeader className="border-b border-brand-lavender-mid bg-white/50">
             <CardTitle className="font-display font-bold text-lg text-brand-text">Recent Orders Today</CardTitle>
           </CardHeader>
           <CardContent className="p-0 overflow-y-auto max-h-[400px]">
             {todaysOrders.length === 0 ? (
               <div className="flex flex-col items-center justify-center text-center p-6 min-h-[200px]">
                 <div className="w-16 h-16 rounded-full bg-brand-violet/10 flex items-center justify-center mb-4">
                     <ShoppingBag className="w-8 h-8 text-brand-violet opacity-50" />
                 </div>
                 <p className="font-display font-medium text-brand-muted">No orders yet today</p>
               </div>
             ) : (
               <div className="divide-y divide-brand-lavender-mid">
                 {todaysOrders.slice(0, 10).map(order => (
                   <div key={order.id} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                     <div>
                       <p className="font-display font-bold text-brand-text text-sm">#{order.id.slice(0, 6)} - {order.customerName || "Guest"}</p>
                       <p className="text-xs text-brand-muted font-body mt-1">
                         {order.items?.length || 0} items • {order.orderType}
                       </p>
                     </div>
                     <div className="text-right flex flex-col items-end">
                       <span className="font-display font-bold text-brand-text">£{order.total?.toFixed(2)}</span>
                       <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                         order.status === "pending" || order.status === "preparing" ? "bg-brand-violet/10 text-brand-violet" : "bg-emerald-50 text-emerald-600"
                       }`}>
                         {order.status === "pending" || order.status === "preparing" ? <Clock className="w-3 h-3 animate-pulse" /> : <CheckCircle2 className="w-3 h-3" />}
                         {order.status}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             )}
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
