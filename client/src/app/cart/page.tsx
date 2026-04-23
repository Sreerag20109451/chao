"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setOrderType
} from "@/lib/features/cartSlice";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChevronLeft,
  Bike,
  Store,
  MapPin,
  Phone
} from "lucide-react";
import AddressModal from "@/components/AddressModal";
import { updateProfile, setPrimaryAddress } from "@/lib/features/authSlice";

export default function CartPage() {
  const { items, orderType } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [phone, setPhone] = useState(user?.phone || "");

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity, 
    0
  );
  const serviceCharge = subtotal * 0.05;
  const deliveryFee = orderType === "collection" ? 0 : (subtotal > 30 ? 0 : 3.5);
  const total = subtotal + serviceCharge + deliveryFee;

  const currentAddress = user?.addresses[user?.primaryAddressIndex || 0];
  const isCheckoutDisabled = orderType === "delivery" && (!currentAddress || !phone.trim());

  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user?.phone, phone]);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-brand-lavender-mid" />
          </div>
          <h1 className="font-display font-bold text-brand-text text-3xl">Your cart is empty</h1>
          <p className="font-body text-brand-muted">
            Looks like you haven't added any Thai delicacies to your cart yet.
          </p>
          <Link 
            href="/menu"
            className="inline-flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-2xl px-8 py-4 shadow-violet-glow transition-all w-full"
          >
            Explore the Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-10">
          <Link 
            href="/menu" 
            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-violet transition-colors font-display font-bold text-sm uppercase tracking-wider mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Browsing
          </Link>
          <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight">
            Your <span className="text-brand-violet">Order.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-6">
            {orderType === "delivery" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-brand-violet" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-brand-text text-lg mb-2">Contact Number</h3>
                      <input 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={() => dispatch(updateProfile({ phone }))}
                        placeholder="Required for delivery..."
                        className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-brand-violet" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-brand-text text-lg mb-1">Delivery Address</h3>
                      {user?.addresses && user.addresses.length > 0 ? (
                        <div className="space-y-3 mt-3">
                          {user.addresses.map((addr, idx) => (
                            <button
                              key={idx}
                              onClick={() => dispatch(setPrimaryAddress(idx))}
                              className={`w-full text-left p-3 rounded-xl border transition-all text-sm ${
                                idx === user.primaryAddressIndex 
                                  ? "bg-brand-violet/5 border-brand-violet font-semibold text-brand-text" 
                                  : "bg-white border-brand-lavender-mid text-brand-muted hover:border-brand-violet/30"
                              }`}
                            >
                              {addr}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="font-body text-brand-muted text-sm max-w-sm">
                          No delivery address added yet.
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <AddressModal>
                    <button type="button" className="flex items-center gap-2 bg-white border border-brand-lavender-mid hover:border-brand-violet hover:bg-brand-violet/5 text-brand-text font-display font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-sm shrink-0 self-start md:self-center">
                      <Plus className="w-4 h-4 text-brand-violet" />
                      Add New
                    </button>
                  </AddressModal>
                </div>
              </div>
            )}

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <ul className="divide-y divide-brand-lavender-mid">
                {items.map((item) => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group">
                    <div className="w-20 h-20 bg-lavender-gradient rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-brand-text text-lg truncate mb-1">
                            {item.name}
                          </h3>
                          <p className="font-body text-brand-muted text-sm line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-display font-bold text-brand-text text-lg whitespace-nowrap">
                          £{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white border border-brand-lavender-mid rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-display font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          onClick={() => dispatch(removeFromCart(item.id))}
                          className="flex items-center gap-1.5 text-red-500 hover:text-red-600 font-display font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl p-8 sticky top-32">
              <h2 className="font-display font-bold text-xl text-brand-text mb-6">Summary</h2>
              <div className="flex p-1 bg-brand-lavender/30 rounded-2xl mb-8">
                <button 
                  onClick={() => dispatch(setOrderType("delivery"))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                    orderType === "delivery" 
                      ? "bg-brand-violet text-white shadow-violet-glow" 
                      : "text-brand-muted hover:text-brand-violet"
                  }`}
                >
                  <Bike className="w-4 h-4" />
                  Delivery
                </button>
                <button 
                  onClick={() => dispatch(setOrderType("collection"))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                    orderType === "collection" 
                      ? "bg-brand-violet text-white shadow-violet-glow" 
                      : "text-brand-muted hover:text-brand-violet"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Collection
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-text">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Service Charge (5%)</span>
                  <span className="font-semibold text-brand-text">£{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-brand-text">
                    {deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-4 border-t border-brand-lavender-mid flex justify-between items-end">
                  <span className="font-display font-bold text-brand-text">Total</span>
                  <span className="font-display font-bold text-3xl text-brand-violet">£{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                disabled={isCheckoutDisabled}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-2xl py-5 flex items-center justify-center gap-3 shadow-violet-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout Now
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
