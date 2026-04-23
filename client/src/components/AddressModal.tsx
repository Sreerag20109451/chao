"use client";

import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { useDispatch } from "react-redux";
import { addAddress } from "@/lib/features/authSlice";
import { MapPin } from "lucide-react";

export default function AddressModal({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [address, setAddress] = useState("");
  const [eircode, setEircode] = useState("");
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const isValidWaterfordEircode = (code: string) => {
    const cleanCode = code.toUpperCase().replace(/\s/g, "");
    // Waterford Eircodes must start with X91 and be 7 characters total
    const regex = /^X91[A-Z0-9]{4}$/;
    return regex.test(cleanCode);
  };

  const handleAddAddress = () => {
    setError("");
    if (!isValidWaterfordEircode(eircode)) {
      setError("We currently only deliver to Waterford (Eircodes starting with X91)");
      return;
    }

    if (address.trim() && eircode.trim()) {
      // Combine address and eircode for the profile
      const fullAddress = `${address.trim()}, ${eircode.trim().toUpperCase()}`;
      dispatch(addAddress(fullAddress));
      setIsOpen(false);
      setAddress(""); // Reset for next time
      setEircode("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[425px] bg-white rounded-3xl p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl text-brand-text flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-violet" />
            Delivery Details
          </DialogTitle>
          <DialogDescription className="text-brand-muted font-body mt-2">
            Please enter your full delivery address and Eircode.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Address First */}
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">
              Street Address
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 8 O'Connell St, Waterford City"
              rows={3}
              required
              className="w-full bg-brand-lavender/30 border border-brand-lavender-mid rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all resize-none"
            />
          </div>

          {/* Eircode Below */}
          <div className="space-y-2">
            <label htmlFor="eircode" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">
              Eircode
            </label>
            <input
              id="eircode"
              value={eircode}
              onChange={(e) => {
                setEircode(e.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. X91 CH61"
              required
              className={`w-full bg-brand-lavender/30 border rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-2 transition-all uppercase ${
                error 
                  ? "border-red-500 focus:ring-red-500/20 focus:border-red-500" 
                  : "border-brand-lavender-mid focus:ring-brand-violet/20 focus:border-brand-violet"
              }`}
            />
            {error && (
              <p className="text-red-500 text-[10px] font-display font-bold uppercase tracking-wider mt-1 animate-in fade-in slide-in-from-top-1">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="bg-transparent border-none p-0 -mx-0 -mb-0">
          <button 
            type="button"
            onClick={handleAddAddress}
            disabled={!address.trim() || !eircode.trim()}
            className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 shadow-violet-glow transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            Save Delivery Details
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
