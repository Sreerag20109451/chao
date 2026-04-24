"use client";

import React, { useState, useEffect } from "react";
import { MenuItem, Category, Deal } from "@/lib/menuData";
import { Search, Plus, Minus, Trash2, MapPin, Truck, Receipt, X, ChevronRight, Check, ShoppingBag, Bike, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import Invoice, { InvoiceData } from "../Invoice";
import { getMenuItems, listenToMenu } from "@/lib/firebase/menu/service";
import { listenToDealsAdmin } from "@/lib/firebase/deals/service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface OrderItem extends MenuItem {
  quantity: number;
  selectedMeat?: string;
  selectedSide?: string;
  isDealActive?: boolean;
}

const CUSTOMISABLE_CATEGORIES: Category[] = ["Main Course", "Curry"];

export default function Billing() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<"collection" | "delivery">("collection");
  const [address, setAddress] = useState("");
  const [deliveryPhone, setDeliveryPhone] = useState("");
  const [deliveryCharge, setDeliveryCharge] = useState(3);
  const [showInvoice, setShowInvoice] = useState(false);
  
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [tempMeat, setTempMeat] = useState<string>("");
  const [tempSide, setTempSide] = useState<string>("");

  useEffect(() => {
    const now = new Date();

    const unsubMenu = listenToMenu((data) => {
      setMenuItems(data);
      setIsLoading(false);
    });

    const unsubDeals = listenToDealsAdmin((dealsData) => {
      const active = dealsData.filter(d =>
        d.isActive &&
        new Date(d.startDate) <= now &&
        new Date(d.endDate) >= now
      );
      setActiveDeals(active);
    });

    return () => {
      unsubMenu();
      unsubDeals();
    };
  }, []);

  // Helper to get active deal for an item
  const getItemDeal = (itemId: string) => {
    return activeDeals.find(d => d.items.includes(itemId));
  };

  const getEffectivePrice = (item: MenuItem) => {
    const deal = getItemDeal(item.id);
    if (deal && deal.dealPrice !== undefined && deal.dealPrice !== null && !isNaN(Number(deal.dealPrice))) {
      return Number(deal.dealPrice);
    }
    return Number(item.basePrice) || 0;
  };

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (item: MenuItem) => {
    try {
      const hasMeats = item.availableMeats?.length > 0;
      const hasSides = item.availableSides?.length > 0;
      const isCustomizable = item.category && CUSTOMISABLE_CATEGORIES.includes(item.category);

      if (isCustomizable && (hasMeats || hasSides)) {
        setCustomizingItem(item);
        setTempMeat(hasMeats ? item.availableMeats[0] : "");
        setTempSide(hasSides ? item.availableSides[0] : "");
      } else {
        addToOrder(item);
      }
    } catch (e: any) {
      console.error("handleItemClick error:", e);
      toast.error(`Error selecting item: ${e.message}`);
    }
  };

  const confirmCustomization = () => {
    try {
      if (customizingItem) {
        addToOrder(customizingItem, tempMeat, tempSide);
        setCustomizingItem(null);
        setTempMeat("");
        setTempSide("");
      }
    } catch (e: any) {
      console.error("confirmCustomization error:", e);
      toast.error(`Error confirming customization: ${e.message}`);
    }
  };

  const getMeatIncrement = (meat?: string) => {
    if (meat === 'Lamb') return 1;
    if (meat === 'Prawn' || meat === 'Beef') return 2;
    return 0;
  };

  const addToOrder = (item: MenuItem, meat?: string, side?: string) => {
    try {
      const baseEffectivePrice = getEffectivePrice(item);
      const price = baseEffectivePrice + getMeatIncrement(meat);
      const deal = getItemDeal(item.id);

      setOrderItems(prev => {
        const isCustom = item.category && CUSTOMISABLE_CATEGORIES.includes(item.category) && (item.availableMeats?.length > 0 || item.availableSides?.length > 0);
        const existing = prev.find(i => 
          i.id === item.id && 
          (!isCustom || (i.selectedMeat === meat && i.selectedSide === side))
        );

        if (existing) {
          return prev.map(i => 
            (i.id === item.id && (!isCustom || (i.selectedMeat === meat && i.selectedSide === side)))
              ? { ...i, quantity: i.quantity + 1, basePrice: price } 
              : i
          );
        }
        return [...prev, { 
          ...item, 
          basePrice: price, // Use the deal price as the base price for this order item
          quantity: 1, 
          selectedMeat: meat, 
          selectedSide: side,
          isDealActive: !!deal
        }];
      });
      toast.success(`Added ${item.name} to order`);
    } catch (e: any) {
      console.error("addToOrder error:", e);
      toast.error(`Error adding to order: ${e.message}`);
    }
  };

  const updateQuantity = (uniqueKey: string, delta: number) => {
    setOrderItems(prev => prev.map((item) => {
      const currentKey = `${item.id}-${item.selectedMeat || 'none'}-${item.selectedSide || 'none'}`;
      if (currentKey === uniqueKey) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const subtotal = orderItems.reduce((acc, item) => acc + (item.basePrice * item.quantity), 0);
  const effectiveDeliveryCharge = orderType === "delivery" ? deliveryCharge : 0;
  const total = subtotal + effectiveDeliveryCharge;

  const [isFindingCustomer, setIsFindingCustomer] = useState(false);

  const handleFindCustomer = async () => {
    if (!deliveryPhone) return;
    setIsFindingCustomer(true);
    try {
      const q = query(
        collection(db, "orders"),
        where("customerPhone", "==", deliveryPhone),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lastOrder = snapshot.docs[0].data();
        if (lastOrder.address) {
          setAddress(lastOrder.address);
          toast.success("Found previous address!");
        } else {
          toast.info("Customer found, but no address on file.");
        }
      } else {
        toast.error("No previous orders found for this phone number.");
      }
    } catch (e) {
      console.error("Error finding customer:", e);
      toast.error("Search failed.");
    } finally {
      setIsFindingCustomer(false);
    }
  };

  const invoiceData: InvoiceData = {
    orderId: Math.floor(100000 + Math.random() * 900000).toString(),
    customerName: "Counter Sale",
    address: address,
    orderType: orderType,
    items: orderItems.map(i => ({
      name: i.isDealActive ? `[DEAL] ${i.name}` : i.name,
      quantity: i.quantity,
      price: i.basePrice,
      selectedProtein: i.selectedMeat,
      selectedSide: i.selectedSide,
      category: i.category,
      total: i.basePrice * i.quantity
    })),
    subtotal,
    deliveryCharge: effectiveDeliveryCharge,
    total,
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };

  const [completedOrder, setCompletedOrder] = useState<InvoiceData | null>(null);

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-12rem)] min-h-0 animate-in fade-in duration-700">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col min-w-0 bg-white/60 backdrop-blur-sm rounded-[2.5rem] border border-brand-lavender-mid overflow-hidden shadow-sm">
        <div className="p-8 border-b border-brand-lavender-mid bg-white/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-2xl font-display font-bold text-brand-text">Menu Selection</h1>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input 
                type="text"
                placeholder="Quick search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-brand-lavender/30 border border-brand-lavender-mid rounded-2xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-muted">
              <Loader2 className="w-10 h-10 animate-spin mb-4" />
              <p className="font-display font-medium">Loading Menu...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-brand-muted italic">
              <p>No items found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const deal = getItemDeal(item.id);
                const price = getEffectivePrice(item);
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="relative flex flex-col items-start p-4 bg-white border border-brand-lavender-mid rounded-3xl text-left hover:border-brand-violet hover:shadow-lg hover:shadow-brand-violet/5 transition-all group active:scale-[0.98]"
                  >
                    {deal && (
                      <div className="absolute top-3 right-3 bg-brand-violet text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter animate-pulse flex items-center gap-1 shadow-lg shadow-brand-violet/20">
                        <Tag className="w-2 h-2" />
                        Deal Active
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-2xl bg-brand-lavender flex items-center justify-center text-xl mb-3 shadow-sm group-hover:scale-110 transition-transform">
                      {item.emoji || "🍛"}
                    </div>
                    <p className="font-display font-bold text-brand-text text-sm mb-1 leading-tight">{item.name}</p>
                    <div className="flex flex-col mt-auto">
                      {deal && (
                        <span className="text-[10px] text-brand-muted line-through font-bold">£{item.basePrice.toFixed(2)}</span>
                      )}
                      <p className="font-display font-bold text-brand-violet text-base">£{price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between w-full mt-1">
                      <p className="text-[10px] text-brand-muted uppercase tracking-widest font-bold">{item.category}</p>
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex gap-1" title={item.allergens.join(", ")}>
                          {item.allergens.slice(0, 2).map(a => (
                            <span key={a} className="text-[8px] px-1 bg-amber-100 text-amber-700 rounded font-black uppercase">
                              {a.substring(0, 3)}
                            </span>
                          ))}
                          {item.allergens.length > 2 && (
                            <span className="text-[8px] px-1 bg-amber-100 text-amber-700 rounded font-black">+{item.allergens.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="w-full lg:w-[420px] flex flex-col bg-brand-violet rounded-[2.5rem] text-white shadow-violet-glow overflow-hidden min-h-0">
        <div className="p-8 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display font-bold">Current Order</h2>
            <p className="text-xs text-white/60 font-body mt-1">Order #{(Math.random()*1000).toFixed(0)}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar-light">
          {orderItems.length === 0 ? (
            <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-white/40 text-center">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-display text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {orderItems.map((item) => {
                 const uniqueKey = `${item.id}-${item.selectedMeat || 'none'}-${item.selectedSide || 'none'}`;
                 return (
                  <div key={uniqueKey} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-sm truncate">{item.name}</p>
                        {item.isDealActive && (
                          <span className="bg-white/20 text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Deal</span>
                        )}
                      </div>
                      {(item.selectedMeat || item.selectedSide) && (
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
                          {[item.selectedMeat, item.selectedSide].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <p className="text-xs font-bold text-white/80 mt-1">£{(item.basePrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
                      <button onClick={() => updateQuantity(uniqueKey, -1)} className="hover:text-amber-400 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-display font-bold text-sm min-w-[1rem] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(uniqueKey, 1)} className="hover:text-amber-400 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                 );
              })}

              {/* Delivery Details (Moved inside scroll area to prevent button overlap) */}
              {orderType === "delivery" && (
                <div className="pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Delivery Details</p>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={deliveryPhone}
                      onChange={e => setDeliveryPhone(e.target.value)}
                      placeholder="Phone number"
                      className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-body text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button 
                      onClick={handleFindCustomer}
                      disabled={isFindingCustomer || !deliveryPhone}
                      className="px-4 bg-white/20 hover:bg-white/30 rounded-xl transition-all disabled:opacity-50"
                    >
                      {isFindingCustomer ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Delivery address"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-xs font-body text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <div className="flex items-center justify-between gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Delivery Charge</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">£</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={deliveryCharge}
                        onChange={e => setDeliveryCharge(Number(e.target.value))}
                        className="w-20 bg-transparent text-right text-sm font-display font-bold text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-8 bg-white/5 space-y-6">
          <div className="flex p-1 bg-white/10 rounded-2xl">
            <button 
              onClick={() => setOrderType("collection")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-xs transition-all ${orderType === "collection" ? 'bg-white text-brand-violet shadow-lg' : 'hover:bg-white/5'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Collection
            </button>
            <button 
              onClick={() => setOrderType("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-display font-bold text-xs transition-all ${orderType === "delivery" ? 'bg-white text-brand-violet shadow-lg' : 'hover:bg-white/5'}`}
            >
              <Bike className="w-4 h-4" /> Delivery
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-body text-white/60">
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-display font-bold pt-3 border-t border-white/10">
              <span>Total</span>
              <span>£{total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={orderItems.length === 0}
            onClick={async () => {
              try {
                // 1. Generate Custom Order ID (YYYYMMDD-SEQ)
                const now = new Date();
                const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                const q = query(
                  collection(db, "orders"),
                  where("createdAt", ">=", startOfToday)
                );
                const snapshot = await getDocs(q);
                const seq = (snapshot.size + 1).toString().padStart(3, '0');
                const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
                const customId = `${dateStr}-${seq}`;

                // 2. Save Order to Database
                await addDoc(collection(db, "orders"), {
                  orderId: customId,
                  items: orderItems.map(i => ({
                    name: i.name,
                    quantity: i.quantity,
                    basePrice: i.basePrice,
                    selectedProtein: i.selectedMeat || null,
                    selectedSide: i.selectedSide || null,
                  })),
                  subtotal,
                  deliveryCharge: effectiveDeliveryCharge,
                  total,
                  orderType,
                  address: orderType === "delivery" ? (address || null) : null,
                  customerPhone: orderType === "delivery" ? (deliveryPhone || null) : null,
                  customerName: "Counter Sale (POS)",
                  status: "preparing",
                  source: "pos",
                  createdAt: serverTimestamp(),
                });

                // 3. Prepare Invoice Data for printing
                const finalInvoice: InvoiceData = {
                  ...invoiceData,
                  orderId: customId,
                  date: now.toLocaleDateString(),
                  time: now.toLocaleTimeString()
                };
                
                setCompletedOrder(finalInvoice);
                setOrderItems([]); 
                setAddress("");
                setDeliveryPhone("");
                setShowInvoice(true);
              } catch (e) {
                console.error("Failed to save POS order:", e);
                toast.error("Failed to process order.");
              }
            }}
            className="w-full bg-white text-brand-violet py-5 rounded-[1.5rem] font-display font-bold text-sm hover:bg-amber-400 hover:text-brand-text transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-xl"
          >
            Process Payment & Print
          </button>
        </div>
      </div>

      {/* Customization Modal */}
      <Dialog open={!!customizingItem} onOpenChange={(open) => !open && setCustomizingItem(null)}>
        <DialogContent className="bg-white rounded-3xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-bold text-brand-text">Customize {customizingItem?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 mt-6">
            {customizingItem?.availableMeats && customizingItem.availableMeats.length > 0 && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-brand-muted uppercase tracking-wider">Select Meat</label>
                <div className="flex flex-wrap gap-2">
                  {customizingItem.availableMeats.map(meat => (
                    <button
                      key={meat}
                      onClick={() => setTempMeat(meat)}
                      className={`px-4 py-2 rounded-xl text-sm font-display font-bold border-2 transition-all ${
                        tempMeat === meat 
                          ? "border-brand-violet bg-brand-violet/10 text-brand-violet"
                          : "border-brand-lavender-mid text-brand-muted hover:border-brand-violet/50"
                      }`}
                    >
                      {meat}
                      {getMeatIncrement(meat) > 0 && <span className="opacity-70 text-[10px] ml-1">(+£{getMeatIncrement(meat).toFixed(2)})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {customizingItem?.availableSides && customizingItem.availableSides.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Select Side</p>
                <div className="grid grid-cols-2 gap-3">
                  {customizingItem.availableSides.map(side => (
                    <button
                      key={side}
                      onClick={() => setTempSide(side)}
                      className={`p-3 rounded-2xl border-2 font-display font-bold text-xs transition-all ${tempSide === side ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-brand-lavender hover:border-brand-lavender-mid'}`}
                    >
                      {side}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <button 
            onClick={confirmCustomization}
            className="w-full bg-brand-violet text-white mt-8 py-6 rounded-2xl font-display font-bold hover:bg-brand-violet-dark transition-all active:scale-95"
          >
            Confirm & Add to Order
          </button>
        </DialogContent>
      </Dialog>

      {/* Invoice Modal */}
      {showInvoice && completedOrder && (
        <Invoice 
          data={completedOrder} 
          onClose={() => {
            setShowInvoice(false);
            setCompletedOrder(null);
            toast.success("Order completed successfully!");
          }} 
        />
      )}
    </div>
  );
}
