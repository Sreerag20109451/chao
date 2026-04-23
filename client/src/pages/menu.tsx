import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuCard from "@/components/MenuCard";
import { categories, MenuItem, Deal } from "@/lib/menuData";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { listenToDeals } from "@/lib/firebase/deals/service";
import { Flame as FlameIcon, Leaf as LeafIcon, ChefHat as ChefHatIcon, WheatOff as WheatOffIcon, Utensils, Loader2 } from "lucide-react";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeMenu = listenToMenu((data) => {
      setItems(data);
      setIsLoading(false);
    });
    const unsubscribeDeals = listenToDeals((data) => {
      setDeals(data);
    });
    return () => {
      unsubscribeMenu();
      unsubscribeDeals();
    };
  }, []);

  const filtered = items
    .filter((item) => item.available !== false) // Default to true if missing
    .filter((item) => 
      activeCategory === "all" ? true : item.category === activeCategory
    );

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-violet animate-spin mb-4" />
        <p className="font-display font-bold text-brand-muted">Loading fresh menu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-16">
          <div className="pill-badge mx-auto mb-6 w-fit uppercase tracking-[0.1em]">
            <Utensils className="w-3.5 h-3.5 text-brand-amber" /> Our Menu
          </div>
          <h1 className="font-display font-bold text-brand-text text-5xl md:text-6xl tracking-tight mb-4">
            Taste the <span className="text-brand-violet">Exquisite</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg max-w-2xl mx-auto">
            From fragrant starters to indulgent desserts — everything crafted fresh, every day.
          </p>
        </header>

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-10"
        >
          <div className="w-full overflow-x-auto pb-4 -mb-4 no-scrollbar flex justify-start md:justify-center">
            <TabsList className="inline-flex h-auto gap-2 bg-white/60 border border-brand-lavender-mid rounded-2xl p-2 whitespace-nowrap">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="font-display font-bold text-xs uppercase tracking-wider rounded-xl data-[state=active]:bg-brand-violet data-[state=active]:text-white data-[state=active]:shadow-violet-glow px-6 py-2.5 transition-all whitespace-nowrap"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>


        <p className="font-body text-sm text-brand-muted mb-6">
          Showing <strong>{filtered.length}</strong> dishes
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} deals={deals} />
            ))}
          </div>
        ) : (
          <p className="font-body text-center text-brand-muted py-20 text-lg">
            No dishes in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
