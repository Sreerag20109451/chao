"use client";

/**
 * menu/page.tsx — Full Menu Page (Client App)
 *
 * Features:
 *  - Category filter tabs (shadcn <Tabs>) — All / Starters / Mains / etc.
 *  - Responsive grid of MenuCards
 *  - Tag legend strip
 *
 * Typography:
 *  - Page title     : font-serif-thai (Noto Serif Thai) — section headers
 *  - Tab labels     : font-display (Bai Jamjuree) — consistent nav feel
 *  - Description    : font-body (Sarabun)
 */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MenuCard from "@/components/MenuCard";
import { menuItems, categories } from "@/lib/menuData";
import { Flame, Leaf, ChefHat, WheatOff } from "lucide-react";

export default function MenuPage() {
  /* Active category filter state */
  const [activeCategory, setActiveCategory] = useState("all");

  /* Filter items by selected category */
  const filtered =
    activeCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategory);

  return (
    <>
      {/* ---- Page header ---- */}
      <section className="bg-lavender-gradient pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Page title — Noto Serif Thai SemiBold */}
          <h1 className="font-serif-thai font-semibold text-[hsl(240_15%_8%)] text-4xl md:text-5xl mb-4">
            Our Menu
          </h1>
          {/* Subtitle — Sarabun */}
          <p className="font-body text-[hsl(240_10%_45%)] text-lg max-w-xl mx-auto">
            From fragrant starters to indulgent desserts — everything crafted fresh, every day.
          </p>
        </div>
      </section>

      {/* ---- Menu content ---- */}
      <section className="bg-lavender-gradient pb-20">
        <div className="max-w-6xl mx-auto px-6">

          {/* ---- Category tabs ---- */}
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="mb-10"
          >
            {/* Scrollable container for tabs on small screens, centered on large screens */}
            <div className="w-full overflow-x-auto pb-4 -mb-4 no-scrollbar flex justify-start md:justify-center">
              <TabsList className="inline-flex h-auto gap-2 bg-white/60 border border-[hsl(252_35%_88%)] rounded-2xl p-2 whitespace-nowrap">
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

          {/* ---- Tag legend ---- */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="font-display text-xs font-medium text-[hsl(240_10%_50%)] uppercase tracking-wide self-center">
              Legend:
            </span>
            {[
              { icon: <Flame className="w-3 h-3" />, label: "Spicy", cls: "text-red-600" },
              { icon: <Leaf className="w-3 h-3" />, label: "Vegan", cls: "text-emerald-700" },
              { icon: <ChefHat className="w-3 h-3" />, label: "Chef's Pick", cls: "text-violet-700" },
              { icon: <WheatOff className="w-3 h-3" />, label: "Gluten-Free", cls: "text-amber-700" },
            ].map(({ icon, label, cls }) => (
              <span key={label} className={`inline-flex items-center gap-1.5 text-xs font-display font-medium ${cls}`}>
                {icon} {label}
              </span>
            ))}
          </div>

          {/* ---- Item count ---- */}
          <p className="font-body text-sm text-[hsl(240_10%_50%)] mb-6">
            Showing <strong>{filtered.length}</strong> dishes
          </p>

          {/* ---- Grid of MenuCards ---- */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((item) => (
                <MenuCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="font-body text-center text-[hsl(240_10%_45%)] py-20 text-lg">
              No dishes in this category yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
