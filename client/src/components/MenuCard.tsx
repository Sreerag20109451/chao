"use client";

/**
 * MenuCard.tsx — Chao Thai Restaurant
 *
 * Individual dish card rendered in the menu grid.
 *
 * Typography breakdown:
 *  - Dish name     : Bai Jamjuree SemiBold (font-display)
 *  - Description   : Sarabun Regular (font-body)
 *  - Price         : Bai Jamjuree Bold in amber
 *  - Tag badges    : Bai Jamjuree 500
 */

import { Badge } from "@/components/ui/badge";
import type { MenuItem, MenuTag } from "@/lib/menuData";
import { Flame, Leaf, ChefHat, WheatOff, Plus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/features/cartSlice";

/* ---- Tag display config ---- */
const tagConfig: Record<
  MenuTag,
  { label: string; icon: React.ReactNode; className: string }
> = {
  spicy: {
    label: "Spicy",
    icon: <Flame className="w-3 h-3" />,
    /* Red badge for heat indicators */
    className:
      "bg-red-50 text-red-600 border-red-200 hover:bg-red-50",
  },
  vegan: {
    label: "Vegan",
    icon: <Leaf className="w-3 h-3" />,
    /* Green for plant-based */
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  "chef-pick": {
    label: "Chef's Pick",
    icon: <ChefHat className="w-3 h-3" />,
    /* Violet to match brand primary */
    className:
      "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-50",
  },
  "gluten-free": {
    label: "GF",
    icon: <WheatOff className="w-3 h-3" />,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
};

interface MenuCardProps {
  item: MenuItem;
}
export default function MenuCard({ item }: MenuCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    dispatch(addToCart(item));
  };

  return (
    /* card-hover utility adds lift + shadow on hover (defined in globals.css) */
    <article className="card-hover bg-white rounded-2xl border border-border overflow-hidden flex flex-col group">

      {/* ---- Dish emoji / image placeholder ---- */}
      <div className="h-40 bg-lavender-gradient flex items-center justify-center text-6xl select-none transition-transform duration-300 group-hover:scale-110">
        {item.emoji}
      </div>

      {/* ---- Card body ---- */}
      <div className="flex flex-col flex-1 p-5 gap-3">

        {/* Badges row */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => {
              const cfg = tagConfig[tag];
              return (
                <Badge
                  key={tag}
                  variant="outline"
                  className={`text-xs font-display font-medium flex items-center gap-1 ${cfg.className}`}
                >
                  {cfg.icon}
                  {cfg.label}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Dish name — Bai Jamjuree SemiBold */}
        <h3 className="font-display font-semibold text-brand-text text-base leading-snug">
          {item.name}
        </h3>

        {/* Description — Sarabun Regular */}
        <p className="font-body text-sm text-brand-muted leading-relaxed flex-1">
          {item.description}
        </p>

        {/* Price & Add to Cart — Bai Jamjuree Bold, amber accent */}
        <div className="pt-3 mt-1 border-t border-brand-lavender-mid flex items-center justify-between">
          <span className="font-display font-bold text-amber-accent text-lg">
            £{item.price.toFixed(2)}
          </span>
          
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label={`Add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </article>
  );
}
