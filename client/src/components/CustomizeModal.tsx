import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { addToCart } from "@/lib/features/cartSlice";
import {
  MenuItem,
  SpiceLevel,
  EGG_FRIED_RICE_SIDE_SURCHARGE,
  getSidePriceIncrement,
} from "@/lib/menuData";
import { Check, ShoppingCart } from "lucide-react";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/router";

interface CustomizeModalProps {
  item: MenuItem;
  children: React.ReactNode;
}

export default function CustomizeModal({ item, children }: CustomizeModalProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOpen: isStoreOpen, settings } = useStoreStatus();
  const [selectedProtein, setSelectedProtein] = useState(item.availableMeats?.[0] || "");
  const [selectedSide, setSelectedSide] = useState(item.availableSides?.[0] || "");
  const [selectedSpice, setSelectedSpice] = useState<SpiceLevel | "">(
    (item.availableSpiceLevels?.[0] as SpiceLevel) || ""
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setSelectedProtein(item.availableMeats?.[0] || "");
    setSelectedSide(item.availableSides?.[0] || "");
    setSelectedSpice((item.availableSpiceLevels?.[0] as SpiceLevel) || "");
  }, [item.id, item.availableMeats, item.availableSides, item.availableSpiceLevels]);

  const getMeatIncrement = (meat: string) => {
    if (!settings?.meatOptions?.[meat]) return 0;
    return settings.meatOptions[meat].price;
  };

  const getAvailableMeats = () => {
    if (!item.availableMeats) return [];
    return item.availableMeats.filter(meat => {
      const meatOption = settings?.meatOptions?.[meat];
      return meatOption?.available !== false;
    });
  };

  const availableMeats = getAvailableMeats();
  const effectiveSelectedProtein = availableMeats.includes(selectedProtein) ? selectedProtein : (availableMeats[0] || "");
  
  const finalPrice =
    (item.basePrice || 0) +
    (item.availableMeats?.length ? getMeatIncrement(effectiveSelectedProtein) : 0) +
    getSidePriceIncrement(item.availableSides?.length ? selectedSide : undefined);

  const handleAddToCart = () => {
    if (!isStoreOpen) {
      toast.error("Sorry, the store is currently closed for orders.");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    const { createdAt, ...serializableItem } = item;
    dispatch(addToCart({
      ...serializableItem,
      basePrice: finalPrice,
      selectedProtein: item.availableMeats?.length ? effectiveSelectedProtein : undefined,
      selectedSide: item.availableSides?.length ? selectedSide : undefined,
      selectedSpice: item.availableSpiceLevels?.length ? selectedSpice || item.availableSpiceLevels[0] : undefined,
    }));
    toast.success(`Added ${item.name} to cart`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] p-8 border-none shadow-2xl animate-in zoom-in-95 duration-300 scrollbar-hide">
        <DialogHeader className="space-y-4">
          <div className="w-20 h-20 bg-brand-lavender rounded-2xl flex items-center justify-center text-5xl shadow-inner mx-auto mb-2">
            {item.emoji}
          </div>
          <DialogTitle className="font-display font-bold text-2xl text-brand-text text-center">
            Customize {item.name}
          </DialogTitle>
          <p className="text-brand-muted text-center font-body text-sm px-4">
            {item.description}
          </p>
          {item.availableSides?.includes("Jasmine Rice") &&
            item.availableSides?.includes("Egg Fried Rice") && (
              <p className="text-center text-[11px] text-brand-muted font-body px-4 -mt-2">
                Complimentary jasmine rice; egg fried rice +€{EGG_FRIED_RICE_SIDE_SURCHARGE.toFixed(2)}.
              </p>
            )}
        </DialogHeader>

        <div className="space-y-8 py-6">
          {item.availableMeats && item.availableMeats.length > 0 && (
            <div className="space-y-4">
              <label className="text-xs font-display font-bold text-brand-text uppercase tracking-widest flex items-center justify-between">
                Choose Meat
                <span className="text-[10px] text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableMeats.map((protein) => (
                  <button
                    key={protein}
                    onClick={() => setSelectedProtein(protein)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                      effectiveSelectedProtein === protein
                        ? "bg-brand-violet border-brand-violet text-white shadow-violet-glow scale-[1.02]"
                        : "bg-brand-lavender/30 border-brand-lavender-mid text-brand-text hover:border-brand-violet/40"
                    }`}
                  >
                    <span>
                      {protein}
                      {getMeatIncrement(protein) > 0 && <span className="opacity-70 text-[10px] ml-1">(+€{getMeatIncrement(protein).toFixed(2)})</span>}
                    </span>
                    {effectiveSelectedProtein === protein && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.availableSides && item.availableSides.length > 0 && (
            <div className="space-y-4">
              <label className="text-xs font-display font-bold text-brand-text uppercase tracking-widest flex items-center justify-between">
                Choose Side
                <span className="text-[10px] text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {item.availableSides.map((side) => (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                      selectedSide === side
                        ? "bg-brand-violet border-brand-violet text-white shadow-violet-glow scale-[1.02]"
                        : "bg-brand-lavender/30 border-brand-lavender-mid text-brand-text hover:border-brand-violet/40"
                    }`}
                  >
                    <span>
                      {side}
                      {getSidePriceIncrement(side) > 0 && (
                        <span className="opacity-70 text-[10px] ml-1">
                          (+€{getSidePriceIncrement(side).toFixed(2)})
                        </span>
                      )}
                    </span>
                    {selectedSide === side && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.availableSpiceLevels && item.availableSpiceLevels.length > 0 && (
            <div className="space-y-4">
              <label className="text-xs font-display font-bold text-brand-text uppercase tracking-widest flex items-center justify-between">
                Spice level
                <span className="text-[10px] text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {item.availableSpiceLevels.map((level) => {
                  const effectiveSpice = selectedSpice || item.availableSpiceLevels![0];
                  return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedSpice(level)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                      effectiveSpice === level
                        ? "bg-brand-violet border-brand-violet text-white shadow-violet-glow scale-[1.02]"
                        : "bg-brand-lavender/30 border-brand-lavender-mid text-brand-text hover:border-brand-violet/40"
                    }`}
                  >
                    {level}
                    {effectiveSpice === level && <Check className="w-4 h-4" />}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="bg-transparent border-none p-0 mt-2">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-2xl py-4 shadow-violet-glow transition-all flex items-center justify-center gap-2 group active:scale-95"
          >
            <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
            Add to Basket — €{finalPrice.toFixed(2)}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
