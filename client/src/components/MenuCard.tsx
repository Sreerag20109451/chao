import { type MenuItem, type Deal, menuItemHasCustomizationOptions } from "@/lib/menuData";
import { Plus, AlertTriangle, Tag } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/router";
import { addToCart } from "@/lib/features/cartSlice";
import CustomizeModal from "./CustomizeModal";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { toast } from "sonner";

interface MenuCardProps {
  item: MenuItem;
  deals?: Deal[];
}
export default function MenuCard({ item, deals }: MenuCardProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOpen } = useStoreStatus();

  const hasOptions = menuItemHasCustomizationOptions(item);

  // Updated to support admin deal structure (dealPrice, items)
  const getEffectivePrice = () => {
    if (!deals || deals.length === 0) return item.basePrice || 0;
    const now = new Date();
    // Find active deals that include this item
    const applicableDeals = deals.filter(deal => {
      const start = new Date(deal.startDate);
      const end = new Date(deal.endDate);
      end.setHours(23, 59, 59, 999);
      if (now < start || now > end) return false;
      // Admin deals: items is an array of item IDs
      if (deal.items && Array.isArray(deal.items) && deal.items.includes(item.id)) return true;
      return false;
    });
    if (applicableDeals.length === 0) return item.basePrice || 0;
    // Use the lowest dealPrice among applicable deals
    let lowestPrice = item.basePrice || 0;
    applicableDeals.forEach(deal => {
      if (typeof deal.dealPrice === 'number' && deal.dealPrice < lowestPrice) {
        lowestPrice = deal.dealPrice;
      }
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
      const { createdAt, ...serializableItem } = item;
      dispatch(addToCart({ ...serializableItem, basePrice: effectivePrice }));
      toast.success(`Added ${item.name} to cart`);
    }
  };

  return (
    /* card-hover utility adds lift + shadow on hover (defined in globals.css) */
    <article data-cy="menu-card" className="card-hover bg-white rounded-2xl border border-border overflow-hidden flex flex-col group">

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
                €{item.basePrice?.toFixed(2)}
              </span>
            )}
            <span className="font-display font-bold text-amber-accent text-lg flex items-center gap-1">
              {hasActiveDeal && <Tag className="w-3.5 h-3.5 text-brand-violet" />}
              €{effectivePrice.toFixed(2)}
            </span>
          </div>
          
          {hasOptions ? (
            <CustomizeModal item={{...item, basePrice: effectivePrice}}>
              <button
                data-cy="customize-menu-item"
                className="flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white p-2 rounded-full shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label={`Customize ${item.name}`}
              >
                <Plus className="w-4 h-4" strokeWidth={3} />
              </button>
            </CustomizeModal>
          ) : (
            <button
              data-cy="add-menu-item-to-cart"
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
