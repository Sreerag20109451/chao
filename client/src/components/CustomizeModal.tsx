import React, { useState } from "react";
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
import { MenuItem } from "@/lib/menuData";
import { Check, ShoppingCart } from "lucide-react";

interface CustomizeModalProps {
  item: MenuItem;
  children: React.ReactNode;
}

export default function CustomizeModal({ item, children }: CustomizeModalProps) {
  const dispatch = useDispatch();
  const [selectedProtein, setSelectedProtein] = useState(item.proteinOptions?.[0] || "");
  const [selectedSide, setSelectedSide] = useState(item.sideOptions?.[0] || "");
  const [isOpen, setIsOpen] = useState(false);

  const handleAddToCart = () => {
    dispatch(addToCart({
      ...item,
      selectedProtein: item.proteinOptions ? selectedProtein : undefined,
      selectedSide: item.sideOptions ? selectedSide : undefined,
    }));
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
        </DialogHeader>

        <div className="space-y-8 py-6">
          {item.proteinOptions && (
            <div className="space-y-4">
              <label className="text-xs font-display font-bold text-brand-text uppercase tracking-widest flex items-center justify-between">
                Choose Protein
                <span className="text-[10px] text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {item.proteinOptions.map((protein) => (
                  <button
                    key={protein}
                    onClick={() => setSelectedProtein(protein)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                      selectedProtein === protein
                        ? "bg-brand-violet border-brand-violet text-white shadow-violet-glow scale-[1.02]"
                        : "bg-brand-lavender/30 border-brand-lavender-mid text-brand-text hover:border-brand-violet/40"
                    }`}
                  >
                    {protein}
                    {selectedProtein === protein && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item.sideOptions && (
            <div className="space-y-4">
              <label className="text-xs font-display font-bold text-brand-text uppercase tracking-widest flex items-center justify-between">
                Choose Side
                <span className="text-[10px] text-brand-violet bg-brand-violet/5 px-2 py-0.5 rounded-full">Required</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {item.sideOptions.map((side) => (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border font-body text-sm transition-all ${
                      selectedSide === side
                        ? "bg-brand-violet border-brand-violet text-white shadow-violet-glow scale-[1.02]"
                        : "bg-brand-lavender/30 border-brand-lavender-mid text-brand-text hover:border-brand-violet/40"
                    }`}
                  >
                    {side}
                    {selectedSide === side && <Check className="w-4 h-4" />}
                  </button>
                ))}
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
            Add to Basket — £{item.price.toFixed(2)}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
