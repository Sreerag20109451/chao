"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Utensils, TrendingUp, Power, PowerOff } from "lucide-react";
import { initialMenuItems } from "@/lib/menuData";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState } from "react";

export default function DashboardPage() {
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const activeItemsCount = initialMenuItems.filter((i) => i.available).length;
  
  const handleToggleOrders = (val: boolean) => {
    setIsAcceptingOrders(val);
    toast(val ? "Restaurant is now accepting orders" : "Restaurant is now closed for orders", {
      icon: val ? <Power className="w-4 h-4 text-emerald-500" /> : <PowerOff className="w-4 h-4 text-red-500" />,
    });
  };
  
  const stats = [
    {
      title: "Today's Revenue",
      value: "£1,245.00",
      change: "+12.5% from yesterday",
      icon: <DollarSign className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Orders (Today)",
      value: "42",
      change: "+4 from yesterday",
      icon: <ShoppingBag className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Active Menu Items",
      value: activeItemsCount.toString(),
      change: "2 items disabled",
      icon: <Utensils className="w-4 h-4 text-brand-violet" />,
    },
    {
      title: "Avg Order Value",
      value: "£29.64",
      change: "+2% from last week",
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
        <Card className="border-brand-lavender-mid shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-white/60 backdrop-blur-sm">
           <div className="w-16 h-16 rounded-full bg-brand-violet/10 flex items-center justify-center mb-4">
               <ShoppingBag className="w-8 h-8 text-brand-violet opacity-50" />
           </div>
           <p className="font-display font-medium text-brand-muted">Recent Orders (Coming Soon)</p>
        </Card>
      </div>
    </div>
  );
}
