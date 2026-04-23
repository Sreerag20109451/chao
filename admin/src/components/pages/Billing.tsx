"use client";

import React, { useState } from "react";
import { initialMenuItems, MenuItem } from "@/lib/menuData";
import { Search, Plus, Minus, Trash2, MapPin, Truck, Receipt, X, ChevronRight, Check, ShoppingBag, Bike } from "lucide-react";
import { toast } from "sonner";
import Invoice, { InvoiceData } from "../Invoice";

interface OrderItem extends MenuItem {
  quantity: number;
  selectedProtein?: string;
  selectedSide?: string;
}

const CUSTOMISABLE_CATEGORIES = ["mains", "curries", "noodles"];

export default function Billing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<"collection" | "delivery">("collection");
  const [address, setAddress] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [tempProtein, setTempProtein] = useState<string>("");
  const [tempSide, setTempSide] = useState<string>("");

  const filteredItems = initialMenuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (item: MenuItem) => {
    if (CUSTOMISABLE_CATEGORIES.includes(item.category) || (item.proteinOptions && item.proteinOptions.length > 0)) {
      setCustomizingItem(item);
      setTempProtein(item.proteinOptions?.[0] || "");
      setTempSide(item.sideOptions?.[0] || "");
    } else {
      addToOrder(item);
    }
  };

  const confirmCustomization = () => {
    if (customizingItem) {
      addToOrder(customizingItem, tempProtein, tempSide);
      setCustomizingItem(null);
      setTempProtein("");
      setTempSide("");
    }
  };

  const addToOrder = (item: MenuItem, protein?: string, side?: string) => {
    setOrderItems(prev => {
      const isCustom = CUSTOMISABLE_CATEGORIES.includes(item.category) || (item.proteinOptions && item.proteinOptions.length > 0);
      const existing = prev.find(i => 
        i.id === item.id && 
        (!isCustom || (i.selectedProtein === protein && i.selectedSide === side))
      );

      if (existing) {
        return prev.map(i => 
          (i.id === item.id && (!isCustom || (i.selectedProtein === protein && i.selectedSide === side)))
            ? { ...i, quantity: i.quantity + 1 } 
            : i
        );
      }
      return [...prev, { ...item, quantity: 1, selectedProtein: protein, selectedSide: side }];
    });
    toast.success(`Added ${item.name} to order`);
  };

  const updateQuantity = (uniqueKey: string, delta: number) => {
    setOrderItems(prev => prev.map((item) => {
      const currentKey = `${item.id}-${item.selectedProtein}-${item.selectedSide}`;
      if (currentKey === uniqueKey) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const removeFromOrder = (uniqueKey: string) => {
    setOrderItems(prev => prev.filter(item => `${item.id}-${item.selectedProtein}-${item.selectedSide}` !== uniqueKey));
  };

  const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const effectiveDeliveryCharge = orderType === "delivery" ? deliveryCharge : 0;
  const total = subtotal + effectiveDeliveryCharge;

  const invoiceData: InvoiceData = {
    orderId: Math.floor(100000 + Math.random() * 900000).toString(),
    customerName: "Counter Sale",
    address: address,
    orderType: orderType,
    items: orderItems.map(i => ({
      name: i.name,
      quantity: i.quantity,
      price: i.price,
      selectedProtein: i.selectedProtein,
      selectedSide: i.selectedSide,
    })),
    subtotal,
    deliveryCharge: effectiveDeliveryCharge,
    total,
    date: new Date().toLocaleDateString('en-GB'),
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-text">Billing & POS</h1>
          <p className="text-brand-muted font-body">Create orders and generate professional invoices.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Item Search & Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] border border-brand-lavender-mid p-6 shadow-sm">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
              <input
                type="text"
                placeholder="Search items by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-brand-lavender/20 border border-brand-lavender-mid rounded-2xl font-body text-base focus:outline-none focus:ring-2 focus:ring-brand-violet/20 transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-hide">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-brand-lavender-mid hover:border-brand-violet/40 hover:bg-brand-lavender/10 transition-all text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-lavender flex items-center justify-center text-2xl shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                    {item.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-brand-text truncate">{item.name}</p>
                    <p className="text-sm font-display font-bold text-brand-violet">£{item.price.toFixed(2)}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Summary & Billing */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-brand-lavender-mid shadow-sm overflow-hidden flex flex-col h-full sticky top-24">
            <div className="p-6 border-b border-brand-lavender-mid bg-brand-lavender/20 flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-brand-text flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-violet" />
                Current Order
              </h2>
              <div className="flex bg-brand-lavender/50 p-1 rounded-xl border border-brand-lavender-mid">
                <button 
                  onClick={() => setOrderType("collection")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    orderType === "collection" 
                      ? "bg-brand-violet text-white shadow-sm" 
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <ShoppingBag className="w-3 h-3" />
                  Collection
                </button>
                <button 
                  onClick={() => setOrderType("delivery")}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-display font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    orderType === "delivery" 
                      ? "bg-brand-violet text-white shadow-sm" 
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <Bike className="w-3 h-3" />
                  Delivery
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
              {orderItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-brand-lavender mx-auto flex items-center justify-center mb-4 text-brand-muted">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="text-brand-muted font-body">Order is empty.</p>
                </div>
              ) : (
                orderItems.map((item, idx) => {
                  const uniqueKey = `${item.id}-${item.selectedProtein}-${item.selectedSide}`;
                  return (
                    <div key={`${uniqueKey}-${idx}`} className="flex items-start gap-3 py-3 border-b border-brand-lavender/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-sm text-brand-text truncate">{item.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedProtein && (
                            <span className="text-[10px] font-bold bg-brand-violet/10 text-brand-violet px-1.5 py-0.5 rounded uppercase">🥩 {item.selectedProtein}</span>
                          )}
                          {item.selectedSide && (
                            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-1.5 py-0.5 rounded uppercase">🍚 {item.selectedSide}</span>
                          )}
                        </div>
                        <p className="text-xs text-brand-muted font-body mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 bg-brand-lavender/30 rounded-lg p-1">
                          <button onClick={() => updateQuantity(uniqueKey, -1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-brand-text transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-display font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(uniqueKey, 1)} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-brand-text transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromOrder(uniqueKey)} className="text-brand-muted hover:text-red-500 transition-colors p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-6 bg-brand-lavender/5 border-t border-brand-lavender-mid space-y-4">
              {orderType === "delivery" && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="text"
                      placeholder="Delivery Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-lavender-mid rounded-xl font-body text-xs focus:outline-none focus:ring-2 focus:ring-brand-violet/20 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                    <input
                      type="number"
                      placeholder="Delivery Charge"
                      value={deliveryCharge || ""}
                      onChange={(e) => setDeliveryCharge(parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-brand-lavender-mid rounded-xl font-body text-xs focus:outline-none focus:ring-2 focus:ring-brand-violet/20 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-muted font-body">Subtotal</span>
                  <span className="text-brand-text font-display font-bold">£{subtotal.toFixed(2)}</span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-muted font-body">Delivery</span>
                    <span className="text-brand-text font-display font-bold">£{deliveryCharge.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl pt-2 border-t border-brand-lavender-mid">
                  <div className="flex flex-col">
                    <span className="text-brand-text font-display font-bold uppercase tracking-tight">Total</span>
                    <span className="text-[10px] text-brand-violet font-display font-bold uppercase tracking-wider">{orderType}</span>
                  </div>
                  <span className="text-brand-violet font-display font-bold">£{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={orderItems.length === 0}
                onClick={() => setShowInvoice(true)}
                className="w-full py-4 bg-brand-violet text-white rounded-2xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Generate Invoice
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-lg overflow-hidden">
            <div className="bg-brand-lavender/30 px-6 py-5 border-b border-brand-lavender-mid flex items-center justify-between">
              <div>
                <h2 className="text-xl font-display font-bold text-brand-text">Customize {customizingItem.name}</h2>
                <p className="text-xs text-brand-muted font-body">Select meat and side for this dish</p>
              </div>
              <button onClick={() => setCustomizingItem(null)} className="p-2 rounded-xl hover:bg-white text-brand-muted transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {customizingItem.proteinOptions && customizingItem.proteinOptions.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-violet"></span>
                    Select Meat Option
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.proteinOptions.map(p => (
                      <button
                        key={p}
                        onClick={() => setTempProtein(p)}
                        className={`px-4 py-3 rounded-xl border font-display text-sm font-bold transition-all text-left flex items-center justify-between ${
                          tempProtein === p 
                            ? "bg-brand-violet text-white border-brand-violet shadow-violet-glow" 
                            : "bg-brand-lavender/20 border-brand-lavender-mid text-brand-text hover:bg-brand-lavender"
                        }`}
                      >
                        {p}
                        {tempProtein === p && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customizingItem.sideOptions && customizingItem.sideOptions.length > 0 && (
                <div className="space-y-3">
                  <label className="text-xs font-display font-bold text-brand-muted uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Select Side Option
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {customizingItem.sideOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => setTempSide(s)}
                        className={`px-4 py-3 rounded-xl border font-display text-sm font-bold transition-all text-left flex items-center justify-between ${
                          tempSide === s 
                            ? "bg-emerald-500 text-white border-emerald-500 shadow-md" 
                            : "bg-brand-lavender/20 border-brand-lavender-mid text-brand-text hover:bg-brand-lavender"
                        }`}
                      >
                        {s}
                        {tempSide === s && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-brand-lavender/10 border-t border-brand-lavender-mid flex gap-3">
              <button onClick={() => setCustomizingItem(null)} className="flex-1 py-3.5 rounded-xl border border-brand-lavender-mid font-display font-bold text-brand-muted hover:bg-white transition-all">
                Cancel
              </button>
              <button onClick={confirmCustomization} className="flex-1 py-3.5 bg-brand-violet text-white rounded-xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all">
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}

      {showInvoice && (
        <Invoice data={invoiceData} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
}
