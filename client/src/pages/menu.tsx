import React, { useState, useEffect } from "react";
import MenuCard from "@/components/MenuCard";
import { categories, MenuItem, Deal } from "@/lib/menuData";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { listenToDeals } from "@/lib/firebase/deals/service";
import { Utensils, Loader2 } from "lucide-react";

const normalizeCategory = (category: string | undefined) =>
  (category ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const categoryMatchers: Record<string, (category: string) => boolean> = {
  Beverages: (category) => /\b(beverage|beverages|drink|drinks)\b/.test(category),
  "Sides & Nibbles": (category) => /\b(side|sides|nibble|nibbles)\b/.test(category),
  "Vegan Specials": (category) => /\b(vegan|plant based|plant)\b/.test(category),
  "Fried rice & Noodles": (category) =>
    /\b(noodle|noodles)\b/.test(category) || /\b(fried rice|rice noodles|rice and noodles)\b/.test(category),
  "Classic Thai Stir-Fries": (category) => /\b(stir|stir fry|stir fries|stirfries)\b/.test(category),
  "Popular Thai Curries": (category) => /\b(curry|curries)\b/.test(category),
  "Chao Kids specials": (category) => /\b(kid|kids|children|childrens)\b/.test(category),
  "Starters & Soups": (category) => /\b(starter|starters|soup|soups)\b/.test(category),
};

const reversedCategoryOrder = [
  "Starters & Soups",
  "Chao Kids specials",
  "Popular Thai Curries",
  "Classic Thai Stir-Fries",
  "Fried rice & Noodles",
  "Vegan Specials",
  "Sides & Nibbles",
  "Beverages",
];

const menuCategories = [
  categories.find((category) => category.id === "all"),
  ...reversedCategoryOrder
    .map((categoryId) => categories.find((category) => category.id === categoryId))
    .filter(Boolean),
].filter((category): category is (typeof categories)[number] => Boolean(category));

const categoryMatches = (itemCategory: string | undefined, activeCategory: string) => {
  if (activeCategory === "all") return true;

  const normalizedItemCategory = normalizeCategory(itemCategory);
  const normalizedActiveCategory = normalizeCategory(activeCategory);

  if (normalizedItemCategory === normalizedActiveCategory) return true;
  return categoryMatchers[activeCategory]?.(normalizedItemCategory) ?? false;
};

const getCategorySortIndex = (itemCategory: string | undefined) => {
  const normalizedItemCategory = normalizeCategory(itemCategory);
  const categoryIndex = reversedCategoryOrder.findIndex((category) => {
    if (normalizedItemCategory === normalizeCategory(category)) return true;
    return categoryMatchers[category]?.(normalizedItemCategory) ?? false;
  });

  return categoryIndex === -1 ? reversedCategoryOrder.length : categoryIndex;
};

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeMenu = listenToMenu((data) => {
      setItems(data);
      setLoadError(null);
      setIsLoading(false);
    }, (error) => {
      console.error("Menu load error:", error);
      setLoadError("We couldn't load the menu right now. Please try again shortly.");
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
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.available !== false) // Default to true if missing
    .filter(({ item }) => categoryMatches(item.category, activeCategory))
    .sort((a, b) => getCategorySortIndex(a.item.category) - getCategorySortIndex(b.item.category) || a.index - b.index)
    .map(({ item }) => item);

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

        <div className="mb-10 w-full overflow-x-auto no-scrollbar">
          <div className="flex w-max min-w-full justify-start px-3 py-1 md:justify-center">
            <div className="flex w-max shrink-0 gap-2 whitespace-nowrap rounded-2xl border border-brand-lavender-mid bg-white/60 p-2">
              {menuCategories.map((cat) => {
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    aria-pressed={isActive}
                    className={`shrink-0 rounded-xl px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-brand-violet text-white shadow-violet-glow"
                        : "text-brand-muted hover:bg-brand-lavender hover:text-brand-violet"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>


        <p className="font-body text-sm text-brand-muted mb-6">
          Showing <strong>{filtered.length}</strong> dishes
        </p>

        {loadError ? (
          <p className="font-body text-center text-red-600 py-20 text-lg">
            {loadError}
          </p>
        ) : filtered.length > 0 ? (
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
