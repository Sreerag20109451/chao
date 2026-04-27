"use client";

import React, { useState, useEffect } from "react";
import {
  MenuItem,
  Deal,
  CUSTOMISABLE_CATEGORIES,
  EGG_FRIED_RICE_SIDE_SURCHARGE,
  getSidePriceIncrement,
} from "@/lib/menuData";
import { Search, Plus, Minus, MapPin, Truck, ShoppingBag, Bike, Loader2, Tag, Phone } from "lucide-react";
import { toast } from "sonner";
import Invoice, { InvoiceData } from "../Invoice";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { listenToDealsAdmin } from "@/lib/firebase/deals/service";
import { listenToStoreSettings, StoreSettings } from "@/lib/firebase/settings/service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface OrderItem extends MenuItem {
  quantity: number;
  selectedMeat?: string;
  selectedSide?: string;
  selectedSpice?: string;
  isDealActive?: boolean;
}

export default function Billing() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeDeals, setActiveDeals] = useState<Deal[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
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
  const [tempSpice, setTempSpice] = useState<string>("");

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

    const unsubSettings = listenToStoreSettings((data) => {
      setSettings(data);
    });

    return () => {
      unsubMenu();
      unsubDeals();
      unsubSettings();
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

  const getMeatIncrement = (meat?: string) => {
    if (!meat || !settings?.meatOptions?.[meat]) return 0;
    return settings.meatOptions[meat].price;
  };

  const getAvailableMeats = (meats: string[]) => {
    if (!meats) return [];
    return meats.filter(meat => {
      const meatOption = settings?.meatOptions?.[meat];
      return meatOption?.available !== false;
    });
  };

  const searchQuery = searchTerm.trim().toLowerCase();
  const searchActive = searchQuery.length > 0;
  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery) ||
    item.category.toLowerCase().includes(searchQuery)
  );

  const handleItemClick = (item: MenuItem) => {
    try {
      const availableMeats = getAvailableMeats(item.availableMeats || []);
      const hasMeats = availableMeats.length > 0;
      const hasSides = item.availableSides?.length > 0;
      const hasSpice = !!(item.availableSpiceLevels && item.availableSpiceLevels.length > 0);
      const isCustomizable = item.category && CUSTOMISABLE_CATEGORIES.includes(item.category);

      if (isCustomizable && (hasMeats || hasSides || hasSpice)) {
        setCustomizingItem(item);
        setTempMeat(hasMeats ? availableMeats[0] : "");
        setTempSide(hasSides ? item.availableSides![0] : "");
        setTempSpice(hasSpice ? item.availableSpiceLevels![0] : "");
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
        addToOrder(customizingItem, tempMeat, tempSide, tempSpice);
        setCustomizingItem(null);
        setTempMeat("");
        setTempSide("");
        setTempSpice("");
      }
    } catch (e: any) {
      console.error("confirmCustomization error:", e);
      toast.error(`Error confirming customization: ${e.message}`);
    }
  };

  const addToOrder = (item: MenuItem, meat?: string, side?: string, spice?: string) => {
    try {
      const baseEffectivePrice = getEffectivePrice(item);
      const price =
        baseEffectivePrice + getMeatIncrement(meat) + getSidePriceIncrement(side);
      const deal = getItemDeal(item.id);

      setOrderItems(prev => {
        const isCustom =
          item.category &&
          CUSTOMISABLE_CATEGORIES.includes(item.category) &&
          (item.availableMeats?.length > 0 ||
            item.availableSides?.length > 0 ||
            (item.availableSpiceLevels && item.availableSpiceLevels.length > 0));
        const existing = prev.find(
          (i) =>
            i.id === item.id &&
            (!isCustom ||
              (i.selectedMeat === meat &&
                i.selectedSide === side &&
                i.selectedSpice === spice))
        );

        if (existing) {
          return prev.map((i) =>
            i.id === item.id &&
            (!isCustom ||
              (i.selectedMeat === meat && i.selectedSide === side && i.selectedSpice === spice))
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
          selectedSpice: spice,
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
      const currentKey = `${item.id}-${item.selectedMeat || 'none'}-${item.selectedSide || 'none'}-${item.selectedSpice || 'none'}`;
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

  const deliveryPhoneOk = deliveryPhone.trim().length === 0 || deliveryPhone.trim().length >= 8;
  const deliveryAddressOk = address.trim().length >= 8;
  const deliveryDetailsComplete =
    orderType !== "delivery" || (deliveryAddressOk && deliveryPhoneOk);

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
      selectedSpice: i.selectedSpice,
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
    <div className="flex flex-col w-full max-w-none mx-auto pb-6 md:pb-10 animate-in fade-in duration-700">
      <div className="w-full flex flex-col bg-white rounded-[2rem] md:rounded-[2.5rem] text-brand-text border border-brand-lavender-mid shadow-md overflow-hidden min-h-[min(85vh,52rem)]">
        <div className="p-5 sm:p-6 border-b border-brand-lavender-mid flex items-center justify-between shrink-0 bg-brand-lavender/35">
          <div>
            <h2 className="text-xl font-display font-bold text-brand-text">Current order</h2>
            <p className="text-xs text-brand-muted font-body mt-1">Search to add items · customise when prompted</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-brand-lavender-mid flex items-center justify-center shrink-0 text-brand-violet shadow-sm">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Collection / delivery + search (no menu list until you search) */}
        <div className="p-5 sm:p-6 border-b border-brand-lavender-mid space-y-4 bg-brand-lavender/25 shrink-0">
          <div className="flex p-1 bg-brand-lavender/60 rounded-2xl border border-brand-lavender-mid w-full max-w-md">
            <button
              type="button"
              onClick={() => setOrderType("collection")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-bold text-xs transition-all ${
                orderType === "collection"
                  ? "bg-white text-brand-violet shadow-sm border border-brand-lavender-mid/80"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" /> Collection
            </button>
            <button
              type="button"
              onClick={() => setOrderType("delivery")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-display font-bold text-xs transition-all ${
                orderType === "delivery"
                  ? "bg-white text-brand-violet shadow-sm border border-brand-lavender-mid/80"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              <Bike className="w-4 h-4 shrink-0" /> Delivery
            </button>
          </div>
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
            <input
              type="text"
              placeholder="Search menu to add items…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-brand-lavender-mid rounded-2xl font-body text-sm text-brand-text placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-violet/20 transition-all"
            />
          </div>
        </div>

        {/* Matches only after typing a search (nothing before) */}
        {searchActive && (
          <div className="max-h-[min(32vh,18rem)] lg:max-h-[min(36vh,22rem)] overflow-y-auto px-4 sm:px-6 py-4 border-b border-brand-lavender-mid bg-brand-lavender/20 custom-scrollbar shrink-0">
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 py-6 text-brand-muted">
                <Loader2 className="w-6 h-6 animate-spin shrink-0 text-brand-violet" />
                <span className="font-body text-sm">Loading menu…</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <p className="text-center text-sm text-brand-muted font-body py-4">No items match that search.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                {filteredItems.map((item) => {
                  const deal = getItemDeal(item.id);
                  const price = getEffectivePrice(item);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      className="relative flex items-start gap-3 p-3 rounded-2xl text-left bg-white border border-brand-lavender-mid hover:border-brand-violet/35 hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      {deal && (
                        <span className="absolute top-2 right-2 bg-brand-amber text-brand-text text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-0.5">
                          <Tag className="w-2 h-2" />
                          Deal
                        </span>
                      )}
                      <span className="text-2xl shrink-0 w-10 h-10 rounded-xl bg-brand-lavender/50 border border-brand-lavender-mid flex items-center justify-center">
                        {item.emoji || "🍛"}
                      </span>
                      <span className="min-w-0 flex-1 pt-0.5">
                        <span className="font-display font-bold text-sm text-brand-text block leading-tight">{item.name}</span>
                        <span className="text-[10px] font-bold text-brand-muted uppercase tracking-widest mt-1 block">{item.category}</span>
                        <span className="mt-1.5 flex items-baseline gap-2">
                          {deal && (
                            <span className="text-[10px] text-brand-muted line-through font-bold">£{item.basePrice.toFixed(2)}</span>
                          )}
                          <span className="font-display font-bold text-brand-violet text-sm">£{price.toFixed(2)}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-h-0 max-h-[min(42vh,22rem)] overflow-y-auto p-5 sm:p-6 space-y-3 custom-scrollbar bg-white">
          {orderItems.length === 0 ? (
            <div className="min-h-[120px] flex flex-col items-center justify-center text-brand-muted text-center rounded-2xl border border-dashed border-brand-lavender-mid bg-brand-lavender/20 py-8 px-4">
              <ShoppingBag className="w-10 h-10 mb-3 opacity-30 text-brand-muted" />
              <p className="font-display text-sm font-bold text-brand-text">Basket is empty</p>
              <p className="text-xs font-body text-brand-muted mt-1 max-w-sm">
                Type in the search box to find dishes; tap one to add (customise if options apply).
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {orderItems.map((item) => {
                 const uniqueKey = `${item.id}-${item.selectedMeat || 'none'}-${item.selectedSide || 'none'}-${item.selectedSpice || 'none'}`;
                 return (
                  <div key={uniqueKey} className="flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                    <div className="min-w-0 flex-1 pr-4">
                      <div className="flex items-center gap-2">
                        <p className="font-display font-bold text-sm truncate text-brand-text">{item.name}</p>
                        {item.isDealActive && (
                          <span className="bg-brand-lavender text-brand-violet text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-brand-lavender-mid">Deal</span>
                        )}
                      </div>
                      {(item.selectedMeat || item.selectedSide || item.selectedSpice) && (
                        <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                          {[item.selectedMeat, item.selectedSide, item.selectedSpice].filter(Boolean).join(" • ")}
                        </p>
                      )}
                      <p className="text-xs font-bold text-brand-violet mt-1">€{(item.basePrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3 bg-brand-lavender/40 px-3 py-1.5 rounded-xl border border-brand-lavender-mid text-brand-text">
                      <button type="button" onClick={() => updateQuantity(uniqueKey, -1)} className="hover:text-brand-violet transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-display font-bold text-sm min-w-[1rem] text-center">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(uniqueKey, 1)} className="hover:text-brand-violet transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                 );
              })}
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 pt-4 bg-brand-lavender/30 space-y-5 border-t border-brand-lavender-mid shrink-0">
          {orderType === "delivery" && (
            <div className="space-y-4 rounded-2xl border border-brand-lavender-mid bg-white p-4 sm:p-5 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wide text-brand-text">
                <Truck className="w-4 h-4 text-brand-violet shrink-0" />
                Delivery
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="pos-delivery-phone" className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                    <Phone className="w-3.5 h-3.5 text-brand-violet" />
                    Phone <span className="text-brand-muted normal-case font-normal">(optional)</span>
                  </label>
                  <input
                    id="pos-delivery-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    placeholder="e.g. 089 447 6628"
                    className="w-full bg-brand-lavender/30 text-brand-text border border-brand-lavender-mid rounded-xl px-4 py-2.5 text-sm font-body placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-violet/25"
                  />
                  {deliveryPhone.trim().length > 0 && deliveryPhone.trim().length < 8 && (
                    <p className="text-[10px] text-amber-800 font-body">If provided, use at least 8 characters.</p>
                  )}
                  <button
                    type="button"
                    onClick={handleFindCustomer}
                    disabled={isFindingCustomer || !deliveryPhone.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-display font-bold bg-brand-lavender-mid hover:bg-brand-lavender border border-brand-lavender-mid text-brand-text transition-all disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {isFindingCustomer ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Look up address from last order
                  </button>
                </div>
                <div className="space-y-2">
                  <label htmlFor="pos-delivery-address" className="flex items-center gap-2 text-[10px] font-bold text-brand-muted uppercase tracking-wide">
                    <MapPin className="w-3.5 h-3.5 text-brand-violet" />
                    Address <span className="text-red-600 normal-case">*</span>
                  </label>
                  <textarea
                    id="pos-delivery-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, area, town, Eircode"
                    className="w-full resize-y min-h-[72px] bg-brand-lavender/30 text-brand-text border border-brand-lavender-mid rounded-xl px-4 py-2.5 text-sm font-body placeholder:text-brand-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-violet/25"
                  />
                  {!deliveryAddressOk && address.length > 0 && (
                    <p className="text-[10px] text-amber-800 font-body">At least 8 characters.</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-brand-lavender-mid bg-brand-lavender/25 px-3 py-2.5">
                  <span className="text-[10px] font-display font-bold text-brand-muted uppercase tracking-wide">Delivery fee (€)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                    className="w-24 bg-white text-brand-text border border-brand-lavender-mid rounded-lg px-2 py-1.5 text-right text-sm font-display font-bold focus:outline-none focus:ring-2 focus:ring-brand-violet/25"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-body text-brand-muted">
              <span>Subtotal</span>
              <span className="font-medium text-brand-text">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-display font-bold pt-3 border-t border-brand-lavender-mid text-brand-text">
              <span>Total</span>
              <span>€{total.toFixed(2)}</span>
            </div>
          </div>

          {!deliveryDetailsComplete && orderType === "delivery" && (
            <p className="text-center text-[11px] font-body text-amber-800 px-2">
              Add a delivery address before paying. Phone is optional.
            </p>
          )}

          <button 
            disabled={orderItems.length === 0 || !deliveryDetailsComplete}
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
                    selectedSpice: i.selectedSpice || null,
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
                setSearchTerm("");
                setShowInvoice(true);
              } catch (e) {
                console.error("Failed to save POS order:", e);
                toast.error("Failed to process order.");
              }
            }}
            className="w-full bg-brand-text text-white py-5 rounded-[1.5rem] font-display font-bold text-sm hover:bg-neutral-800 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg border border-brand-lavender-mid"
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
                  {getAvailableMeats(customizingItem.availableMeats).map(meat => (
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
                      {getMeatIncrement(meat) > 0 && <span className="opacity-70 text-[10px] ml-1">(+€{getMeatIncrement(meat).toFixed(2)})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {customizingItem?.availableSides && customizingItem.availableSides.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Select Side</p>
                {customizingItem.availableSides.includes("Jasmine Rice") &&
                  customizingItem.availableSides.includes("Egg Fried Rice") && (
                    <p className="text-[11px] text-brand-muted font-body">
                      Jasmine rice included; egg fried rice +€{EGG_FRIED_RICE_SIDE_SURCHARGE.toFixed(2)}.
                    </p>
                  )}
                <div className="grid grid-cols-2 gap-3">
                  {customizingItem.availableSides.map(side => (
                    <button
                      key={side}
                      onClick={() => setTempSide(side)}
                      className={`p-3 rounded-2xl border-2 font-display font-bold text-xs transition-all ${tempSide === side ? 'border-brand-violet bg-brand-violet/5 text-brand-violet' : 'border-brand-lavender hover:border-brand-lavender-mid'}`}
                    >
                      {side}
                      {getSidePriceIncrement(side) > 0 && (
                        <span className="opacity-70 text-[10px] ml-1">
                          (+€{getSidePriceIncrement(side).toFixed(2)})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {customizingItem?.availableSpiceLevels && customizingItem.availableSpiceLevels.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">Spice level</p>
                <div className="grid grid-cols-2 gap-3">
                  {customizingItem.availableSpiceLevels.map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTempSpice(level)}
                      className={`p-3 rounded-2xl border-2 font-display font-bold text-xs transition-all ${
                        tempSpice === level
                          ? "border-brand-violet bg-brand-violet/5 text-brand-violet"
                          : "border-brand-lavender hover:border-brand-lavender-mid"
                      }`}
                    >
                      {level}
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
