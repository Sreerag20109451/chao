"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuCard from "@/components/MenuCard";
import { menuItems, categories } from "@/lib/menuData";
import { Flame as FlameIcon, Leaf as LeafIcon, ChefHat as ChefHatIcon, WheatOff as WheatOffIcon } from "lucide-react";

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <header className="text-center mb-12">
          <h1 className="font-serif-thai font-semibold text-brand-text text-4xl md:text-5xl mb-4">
            Our Menu
          </h1>
          <p className="font-body text-brand-muted text-lg max-w-xl mx-auto">
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

        <div className="flex flex-wrap gap-3 mb-8">
          <span className="font-display text-xs font-medium text-brand-muted uppercase tracking-wide self-center">
            Legend:
          </span>
          {[
            { icon: <FlameIcon className="w-3 h-3" />, label: "Spicy", cls: "text-red-600" },
            { icon: <LeafIcon className="w-3 h-3" />, label: "Vegan", cls: "text-emerald-700" },
            { icon: <ChefHatIcon className="w-3 h-3" />, label: "Chef's Pick", cls: "text-violet-700" },
            { icon: <WheatOffIcon className="w-3 h-3" />, label: "Gluten-Free", cls: "text-amber-700" },
          ].map(({ icon, label, cls }) => (
            <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-display font-medium ${cls}`}>
              {icon} {label}
            </span>
          ))}
        </div>

        <p className="font-body text-sm text-brand-muted mb-6">
          Showing <strong>{filtered.length}</strong> dishes
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} />
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
