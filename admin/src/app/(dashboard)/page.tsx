"use client";

/**
 * (dashboard)/page.tsx — Admin Dashboard Home
 *
 * Shows high-level stats: revenue, orders, active menu items.
 * Uses shadcn cards and our brand typography.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Utensils, TrendingUp } from "lucide-react";
import { initialMenuItems } from "@/lib/menuData";

export default function DashboardPage() {
  /* Dummy data for dashboard numbers */
  const activeItemsCount = initialMenuItems.filter((i) => i.available).length;
  
  const stats = [
    {
      title: "Today's Revenue",
      value: "£1,245.00",
      change: "+12.5% from yesterday",
      icon: <DollarSign className="w-4 h-4 text-[hsl(250_78%_60%)]" />,
    },
    {
      title: "Orders (Today)",
      value: "42",
      change: "+4 from yesterday",
      icon: <ShoppingBag className="w-4 h-4 text-[hsl(250_78%_60%)]" />,
    },
    {
      title: "Active Menu Items",
      value: activeItemsCount.toString(),
      change: "2 items disabled",
      icon: <Utensils className="w-4 h-4 text-[hsl(250_78%_60%)]" />,
    },
    {
      title: "Avg Order Value",
      value: "£29.64",
      change: "+2% from last week",
      icon: <TrendingUp className="w-4 h-4 text-[hsl(250_78%_60%)]" />,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="space-y-2">
        <h1 className="font-display font-bold text-3xl text-[hsl(240_15%_8%)]">Dashboard Overview</h1>
        <p className="font-body text-[hsl(240_10%_45%)]">Here&apos;s what&apos;s happening at Chao today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-[hsl(252_35%_88%)] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="font-display font-medium text-sm text-[hsl(240_10%_45%)]">
                {stat.title}
              </CardTitle>
              <div className="w-8 h-8 rounded-full bg-[hsl(252_60%_95%)] flex items-center justify-center">
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display font-bold text-2xl text-[hsl(240_15%_8%)]">
                {stat.value}
              </div>
              <p className="font-body text-xs text-[hsl(240_10%_50%)] mt-1">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for future charts or recent orders list */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-[hsl(252_35%_88%)] shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-[hsl(0_0%_100%)]">
           <div className="w-16 h-16 rounded-full bg-[hsl(252_60%_95%)] flex items-center justify-center mb-4">
               <TrendingUp className="w-8 h-8 text-[hsl(250_78%_60%)] opacity-50" />
           </div>
           <p className="font-display font-medium text-[hsl(240_10%_45%)]">Revenue Chart (Coming Soon)</p>
        </Card>
        <Card className="border-[hsl(252_35%_88%)] shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center p-6 bg-[hsl(0_0%_100%)]">
           <div className="w-16 h-16 rounded-full bg-[hsl(252_60%_95%)] flex items-center justify-center mb-4">
               <ShoppingBag className="w-8 h-8 text-[hsl(250_78%_60%)] opacity-50" />
           </div>
           <p className="font-display font-medium text-[hsl(240_10%_45%)]">Recent Orders (Coming Soon)</p>
        </Card>
      </div>
    </div>
  );
}
