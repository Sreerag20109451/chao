import { Badge } from "@/components/ui/badge";
import type { MenuItem, Allergen, Deal } from "@/lib/menuData";
import { Flame, Leaf, ChefHat, WheatOff, Plus, AlertTriangle, Check, Tag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/router";
import { addToCart } from "@/lib/features/cartSlice";
import CustomizeModal from "./CustomizeModal";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { toast } from "sonner";

/* ---- Allergen display config ---- */
const allergenConfig: Record<
  Allergen,
  { label: string; icon: React.ReactNode; className: string }
> = {
  "Dairy/Milk": {
    label: "Dairy",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  "Eggs": {
    label: "Eggs",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  "Nuts": {
    label: "Nuts",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  "Crustaceans": {
    label: "Crustaceans",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  "Soy": {
    label: "Soy",
    icon: <AlertTriangle className="w-3 h-3" />,
    className: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50",
  },
  "Gluten": {
    label: "GF",
    icon: <Check className="w-3 h-3" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  "Vegan": {
    label: "Vegan",
    icon: <Leaf className="w-3 h-3" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
  "Vegetarian": {
    label: "Veg",
    icon: <Leaf className="w-3 h-3" />,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50",
  },
};

interface MenuCardProps {
  item: MenuItem;
  deals?: Deal[];
}
export default function MenuCard({ item, deals }: MenuCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOpen } = useStoreStatus();

  const hasOptions = !!(item.availableMeats?.length || item.availableSides?.length);

  const getEffectivePrice = () => {
    if (!deals || deals.length === 0) return item.basePrice || 0;
    
    const now = new Date();
    const applicableDeals = deals.filter(deal => {
      const start = new Date(deal.startDate);
      const end = new Date(deal.endDate);
      end.setHours(23, 59, 59, 999);
      if (now < start || now > end) return false;
      if (deal.applicableCategories && deal.applicableCategories.includes(item.category)) return true;
      if (deal.applicableItems && deal.applicableItems.includes(item.id)) return true;
      return false;
    });

    if (applicableDeals.length === 0) return item.basePrice || 0;

    let lowestPrice = item.basePrice || 0;
    applicableDeals.forEach(deal => {
      let dealPrice = item.basePrice || 0;
      if (deal.type === 'fixed_price') {
        dealPrice = deal.value;
      } else if (deal.type === 'discount') {
        dealPrice = (item.basePrice || 0) * (1 - deal.value / 100);
      }
      if (dealPrice < lowestPrice) lowestPrice = dealPrice;
    });

    return lowestPrice;
  };

  const effectivePrice = getEffectivePrice();
  const hasActiveDeal = effectivePrice < (item.basePrice || 0);

  const handleAddToCart = () => {
    if (!isOpen) {
      toast.error("Sorry, the store is currently closed for orders.");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!hasOptions) {
      // Overwrite basePrice with effectivePrice so the cart knows the discounted price
      dispatch(addToCart({ ...item, basePrice: effectivePrice }));
      toast.success(`Added ${item.name} to cart`);
    }
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
        {item.allergens && item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {item.allergens.map((allergen) => (
              <span key={allergen} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase tracking-widest flex items-center gap-1">
                {allergen === 'Gluten' || allergen === 'Vegan' || allergen === 'Vegetarian' ? <AlertTriangle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                {allergen}
              </span>
            ))}
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
          <div className="flex flex-col">
            {hasActiveDeal && (
              <span className="text-[10px] text-brand-muted line-through font-bold">
                £{item.basePrice?.toFixed(2)}
              </span>
            )}
            <span className="font-display font-bold text-amber-accent text-lg flex items-center gap-1">
              {hasActiveDeal && <Tag className="w-3.5 h-3.5 text-brand-violet" />}
              £{effectivePrice.toFixed(2)}
            </span>
          </div>
          
          {hasOptions ? (
            <CustomizeModal item={{...item, basePrice: effectivePrice}}>
              <button
                className="flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={`Customize ${item.name}`}
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
              </button>
            </CustomizeModal>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label={`Add ${item.name} to cart`}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
