"use client";

import React from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  removeFromCart, 
  updateQuantity, 
  clearCart 
} from "@/lib/features/cartSlice";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  ChevronLeft
} from "lucide-react";

export default function CartPage() {
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity, 
    0
  );
  const deliveryFee = subtotal > 30 ? 0 : 3.5;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-lavender-gradient pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md w-full px-6 text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="w-10 h-10 text-brand-lavender-mid" />
          </div>
          <h1 className="font-display font-bold text-brand-text text-3xl">Your cart is empty</h1>
          <p className="font-body text-brand-muted">
            Looks like you haven&apos;t added any Thai delicacies to your cart yet.
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
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20">
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
          
          {/* ---- Left: Cart Items ---- */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <ul className="divide-y divide-brand-lavender-mid">
                {items.map((item) => (
                  <li key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group">
                    {/* Item Emoji */}
                    <div className="w-20 h-20 bg-lavender-gradient rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      {item.emoji}
                    </div>

                    {/* Item Info */}
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

                      {/* Controls */}
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
              <div className="p-4 bg-brand-lavender/30 border-t border-brand-lavender-mid flex justify-end">
                <button 
                  onClick={() => dispatch(clearCart())}
                  className="text-brand-muted hover:text-brand-violet font-display font-bold text-xs uppercase tracking-widest px-4 py-2"
                >
                  Clear all items
                </button>
              </div>
            </div>
          </div>

          {/* ---- Right: Summary ---- */}
          <aside className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 shadow-xl p-8 sticky top-32">
              <h2 className="font-display font-bold text-xl text-brand-text mb-6">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-text">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-brand-text">
                    {deliveryFee === 0 ? "FREE" : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[10px] text-brand-violet font-display font-bold bg-brand-violet/5 p-2 rounded-lg text-center">
                    FREE delivery on orders over £30
                  </p>
                )}
                <div className="pt-4 border-t border-brand-lavender-mid flex justify-between items-end">
                  <span className="font-display font-bold text-brand-text">Total</span>
                  <span className="font-display font-bold text-3xl text-brand-violet">£{total.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-2xl py-5 flex items-center justify-center gap-3 shadow-violet-glow transition-all active:scale-[0.98]">
                Checkout Now
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-display font-bold text-brand-muted uppercase tracking-widest">
                  Secure Checkout
                </span>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
