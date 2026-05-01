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
  Phone,
  Clock,
  CreditCard,
  Loader2,
} from "lucide-react";
import AddressModal from "@/components/AddressModal";
import { updateProfile, setPrimaryAddress, addOrder } from "@/lib/features/authSlice";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { toast } from "sonner";
import { placeOrder } from "@/lib/firebase/orders/service";
import { getDocs, collection, query, where, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { StripeSavedPaymentMethod } from "@/models/billing";
import { formatCardBrandDisplay } from "@/models/billing";

export default function CartPage() {
  const { items, orderType } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isOpen: isStoreOpen, isLoaded, settings } = useStoreStatus();
  const dispatch = useDispatch();

  const [phone, setPhone] = useState(user?.phone || "");
  const [pickupMinutes, setPickupMinutes] = useState(20);
  // Checkout supports two real payment paths:
  // - cod: keep existing in-app order placement
  // - card: redirect to Stripe Checkout
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "card">("cod");
  /** Vault card on Stripe Customer for repeat checkout (optional). */
  const [savePaymentMethod, setSavePaymentMethod] = useState(true);
  const [isCardProcessing, setIsCardProcessing] = useState(false);
  const [savedCards, setSavedCards] = useState<StripeSavedPaymentMethod[]>([]);
  const [savedCardsLoading, setSavedCardsLoading] = useState(false);
  /** Which vaulted Stripe PaymentMethod to charge, or `new` for a fresh card on Checkout. */
  const [selectedSavedPaymentMethodId, setSelectedSavedPaymentMethodId] = useState<string | "new">("new");

  useEffect(() => {
    if (settings?.minPrepTime && pickupMinutes < settings.minPrepTime) {
      setPickupMinutes(settings.minPrepTime);
    }
  }, [settings?.minPrepTime]);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const subtotal = items.reduce(
    (acc, item) => acc + (item.basePrice || 0) * item.quantity, 
    0
  );
  // Enforce restaurant minimum order policy on food/service value only.
  // Delivery fee must NOT count towards the minimum.
  const MIN_ORDER_TOTAL = 10;
  const serviceCharge = subtotal * 0.05;
  const deliveryFee = orderType === "collection" ? 0 : (subtotal > 30 ? 0 : 3.0);
  const total = subtotal + serviceCharge + deliveryFee;
  const minimumEligibleAmount = subtotal + serviceCharge;

  const currentAddress = user?.addresses[user?.primaryAddressIndex || 0];
  const isCheckoutDisabled =
    !isStoreOpen ||
    !phone.trim() ||
    (orderType === "delivery" && !currentAddress) ||
    minimumEligibleAmount < MIN_ORDER_TOTAL;

  useEffect(() => {
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user?.phone, phone]);

  useEffect(() => {
    if (paymentMethod !== "card" || !user?.stripeCustomerId || !user?.email) {
      setSavedCards([]);
      setSelectedSavedPaymentMethodId("new");
      setSavedCardsLoading(false);
      return;
    }

    let cancelled = false;
    setSavedCardsLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/payments/list-payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stripeCustomerId: user.stripeCustomerId,
            customerEmail: user.email,
          }),
        });
        const data = (await res.json()) as { paymentMethods?: StripeSavedPaymentMethod[] };
        if (cancelled) return;
        if (!res.ok || !Array.isArray(data.paymentMethods)) {
          setSavedCards([]);
          setSelectedSavedPaymentMethodId("new");
          return;
        }
        setSavedCards(data.paymentMethods);
        setSelectedSavedPaymentMethodId(data.paymentMethods.length > 0 ? data.paymentMethods[0].id : "new");
      } catch {
        if (!cancelled) {
          setSavedCards([]);
          setSelectedSavedPaymentMethodId("new");
        }
      } finally {
        if (!cancelled) setSavedCardsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paymentMethod, user?.stripeCustomerId, user?.email]);

  /**
   * Uses Stripe Checkout for card payments.
   * We persist a draft payload in sessionStorage so the success page
   * can safely write the paid order to Firestore after verification.
   */
  const startCardCheckout = async () => {
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      toast.error("Please log in before placing an order.");
      return;
    }

    const vaultNewCardOnly =
      selectedSavedPaymentMethodId === "new" && savePaymentMethod;

    const checkoutDraft = {
      userId: currentUid,
      items,
      subtotal,
      serviceCharge,
      deliveryFee,
      total,
      orderType,
      address: orderType === "delivery" ? currentAddress ?? null : null,
      customerName: user?.name || "Guest",
      customerPhone: (phone ?? user?.phone) || null,
      requestedPickupTime: orderType === "collection" ? pickupMinutes : null,
      savePaymentMethod: vaultNewCardOnly,
    };

    sessionStorage.setItem("stripe_checkout_draft", JSON.stringify(checkoutDraft));
    setIsCardProcessing(true);

    try {
      const response = await fetch("/api/payments/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          orderType,
          deliveryFee,
          serviceCharge,
          customerName: user?.name || "Guest",
          customerEmail: user?.email || null,
          customerPhone: (phone ?? user?.phone) || null,
          address: orderType === "delivery" ? currentAddress ?? null : null,
          savePaymentMethod: vaultNewCardOnly,
          stripeCustomerId: user?.stripeCustomerId ?? null,
          selectedPaymentMethodId:
            selectedSavedPaymentMethodId === "new" ? null : selectedSavedPaymentMethodId,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.url) {
        throw new Error(payload?.error || "Failed to start card checkout.");
      }

      globalThis.location.assign(payload.url as string);
    } catch (error) {
      console.error("Card checkout initialization failed:", error);
      toast.error("Unable to start card payment. Please try again.");
      setIsCardProcessing(false);
    }
  };

  if (items.length === 0 && !placedOrderId) {
    return (
      <div data-cy="empty-cart" className="min-h-screen pt-32 pb-20 flex items-center justify-center">
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
            data-cy="empty-cart-explore-menu"
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
            {/* Only show contact number input if user has no phone in profile */}
            {(!user?.phone || user.phone.trim() === "") && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-brand-violet" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-brand-text text-lg mb-2">Contact Number</h3>
                      <div className="flex gap-2">
                        <input 
                          data-cy="checkout-phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter phone number for order updates..."
                          className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                        />
                        {user && phone !== user.phone && (
                          <button
                            type="button"
                            onClick={async () => {
                              if (phone.trim()) {
                                dispatch(updateProfile({ phone }));
                                try {
                                  if (auth.currentUser) {
                                    await updateDoc(doc(db, "users", auth.currentUser.uid), { phone });
                                    toast.success("Phone updated in profile!");
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }}
                            className="bg-brand-violet/10 hover:bg-brand-violet/20 text-brand-violet rounded-xl px-4 py-2 font-display font-bold text-xs transition-all whitespace-nowrap"
                          >
                            Save to Profile
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {orderType === "delivery" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 flex flex-col shadow-sm">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-brand-violet" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-brand-text text-lg mb-1">Delivery Address</h3>
                      <p className="text-xs text-brand-muted font-body mb-4">Where should we bring your Thai feast?</p>
                      
                      {user?.addresses && user.addresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                          {user.addresses.map((addr, idx) => (
                            <button
                              key={idx}
                              onClick={() => dispatch(setPrimaryAddress(idx))}
                              className={`w-full text-left p-4 rounded-2xl border transition-all text-xs relative ${
                                idx === user.primaryAddressIndex 
                                  ? "bg-brand-violet text-white border-brand-violet shadow-violet-glow font-semibold" 
                                  : "bg-white border-brand-lavender-mid text-brand-text hover:border-brand-violet/30"
                              }`}
                            >
                              {addr}
                              {idx === user.primaryAddressIndex && (
                                <div className="absolute top-2 right-2 bg-white/20 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-tighter">Primary</div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-brand-lavender/20 border border-dashed border-brand-lavender-mid rounded-2xl p-6 text-center">
                          <p className="font-body text-brand-muted text-sm mb-4">
                            No delivery address added yet.
                          </p>
                          <AddressModal>
                            <button type="button" className="inline-flex items-center gap-2 bg-brand-violet text-white font-display font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-violet-glow">
                              <Plus className="w-4 h-4" />
                              Add Delivery Address
                            </button>
                          </AddressModal>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {user?.addresses && user.addresses.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-brand-lavender-mid flex justify-end">
                      <AddressModal>
                        <button type="button" className="flex items-center gap-2 text-brand-violet font-display font-bold text-xs uppercase tracking-widest hover:underline">
                          <Plus className="w-3.5 h-3.5" />
                          Add another address
                        </button>
                      </AddressModal>
                    </div>
                  )}
                </div>
              </div>
            )}

            {orderType === "collection" && (
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-brand-violet" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-brand-text text-lg mb-2">Requested Pickup Time</h3>
                    <p className="text-xs text-brand-muted font-body mb-4">
                      When would you like to collect your order? 
                      {settings?.minPrepTime && (
                        <span className="block mt-1 text-brand-violet font-bold">
                          Note: Minimum preparation time is {settings.minPrepTime} minutes.
                        </span>
                      )}
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {[15, 20, 30, 45, 60]
                          .filter(mins => mins >= (settings?.minPrepTime || 0))
                          .map((mins) => (
                          <button
                            key={mins}
                            type="button"
                            onClick={() => setPickupMinutes(mins)}
                            className={`py-3 px-2 rounded-xl font-display font-bold text-xs transition-all border ${
                              pickupMinutes === mins 
                                ? "bg-brand-violet text-white border-brand-violet shadow-violet-glow" 
                                : "bg-white border-brand-lavender-mid text-brand-muted hover:border-brand-violet/30"
                            }`}
                          >
                            {mins} mins
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-display font-bold text-brand-muted uppercase">Custom:</span>
                        <input 
                          type="number"
                          min={settings?.minPrepTime || 0}
                          value={pickupMinutes}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setPickupMinutes(val);
                          }}
                          onBlur={() => {
                            if (settings?.minPrepTime && pickupMinutes < settings.minPrepTime) {
                              setPickupMinutes(settings.minPrepTime);
                              toast.info(`Time adjusted to minimum prep time of ${settings.minPrepTime} mins.`);
                            }
                          }}
                          className="w-20 px-3 py-2 bg-white border border-brand-lavender-mid rounded-xl font-display font-bold text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                        />
                        <span className="text-xs font-body text-brand-muted">minutes from now</span>
                      </div>
                      <div className="bg-brand-violet/5 border border-brand-violet/10 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-sm font-display font-bold text-brand-text">Estimated Collection Time:</span>
                        <span className="text-lg font-display font-bold text-brand-violet">
                          {new Date(Date.now() + pickupMinutes * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 shadow-sm overflow-hidden">
              <ul className="divide-y divide-brand-lavender-mid">
                {items.map((item) => (
                  <li key={item.cartId} data-cy="cart-item" className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group">
                    <div className="w-20 h-20 bg-lavender-gradient rounded-2xl flex items-center justify-center text-4xl shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-brand-text text-lg truncate mb-1">
                            {item.name}
                          </h3>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {item.selectedProtein && (
                              <span className="text-[10px] font-display font-bold uppercase tracking-wider bg-brand-violet/5 text-brand-violet px-2 py-0.5 rounded-full border border-brand-violet/10">
                                {item.selectedProtein}
                              </span>
                            )}
                            {item.selectedSide && (
                              <span className="text-[10px] font-display font-bold uppercase tracking-wider bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full border border-amber-100">
                                {item.selectedSide}
                              </span>
                            )}
                            {item.selectedSpice && (
                              <span className="text-[10px] font-display font-bold uppercase tracking-wider bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100">
                                {item.selectedSpice}
                              </span>
                            )}
                          </div>
                          <p className="font-body text-brand-muted text-sm line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-display font-bold text-brand-text text-lg whitespace-nowrap">
                          €{((item.basePrice || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white border border-brand-lavender-mid rounded-xl p-1 shadow-sm">
                          <button 
                            data-cy="cart-item-decrement"
                            onClick={() => dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity - 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-display font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            data-cy="cart-item-increment"
                            onClick={() => dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity + 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
                          data-cy="cart-item-remove"
                          onClick={() => dispatch(removeFromCart(item.cartId))}
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
                  data-cy="order-type-delivery"
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
                  data-cy="order-type-collection"
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
                  <span className="font-semibold text-brand-text">€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Service Charge (5%)</span>
                  <span className="font-semibold text-brand-text">€{serviceCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-muted font-body">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-brand-text">
                    {deliveryFee === 0 ? "FREE" : `€${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-4 border-t border-brand-lavender-mid flex justify-between items-end">
                  <span className="font-display font-bold text-brand-text">Total</span>
                  <span data-cy="cart-total" className="font-display font-bold text-3xl text-brand-violet">€{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method selector keeps checkout explicit and auditable. */}
              <div className="mb-6">
                <p className="text-xs font-display font-bold text-brand-muted uppercase tracking-wider mb-3">
                  Payment Method
                </p>
                <div className="flex p-1 bg-brand-lavender/30 rounded-2xl">
                  <button
                    type="button"
                    data-cy="payment-method-cod"
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                      paymentMethod === "cod"
                        ? "bg-brand-violet text-white shadow-violet-glow"
                        : "text-brand-muted hover:text-brand-violet"
                    }`}
                  >
                    Cash on Delivery
                  </button>
                  <button
                    type="button"
                    data-cy="payment-method-card"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-display font-bold transition-all ${
                      paymentMethod === "card"
                        ? "bg-brand-violet text-white shadow-violet-glow"
                        : "text-brand-muted hover:text-brand-violet"
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="mb-4 space-y-3">
                  <p className="text-xs font-display font-bold uppercase tracking-wider text-brand-muted">
                    Pay with
                  </p>
                  {savedCardsLoading ? (
                    <div className="flex items-center gap-2 rounded-2xl border border-brand-lavender-mid bg-white/70 px-4 py-3 text-sm text-brand-muted">
                      <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand-violet" />
                      Loading saved cards…
                    </div>
                  ) : savedCards.length > 0 ? (
                    <div className="space-y-2 rounded-2xl border border-brand-lavender-mid bg-white/70 p-3">
                      {savedCards.map((card) => (
                        <label
                          key={card.id}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                            selectedSavedPaymentMethodId === card.id
                              ? "border-brand-violet bg-brand-violet/10 ring-1 ring-brand-violet/25"
                              : "border-transparent hover:border-brand-lavender-mid hover:bg-brand-lavender/20"
                          }`}
                        >
                          <input
                            type="radio"
                            name="saved-card"
                            checked={selectedSavedPaymentMethodId === card.id}
                            onChange={() => setSelectedSavedPaymentMethodId(card.id)}
                            className="mt-1 h-4 w-4 shrink-0 border-brand-lavender-mid text-brand-violet focus:ring-brand-violet"
                          />
                          <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand-violet" />
                          <span className="min-w-0 flex-1 font-body text-sm text-brand-text">
                            <span className="font-display font-bold">
                              {formatCardBrandDisplay(card.brand)} •••• {card.last4 || "····"}
                            </span>
                            {card.expMonth != null && card.expYear != null ? (
                              <span className="block text-xs text-brand-muted">
                                Exp {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                              </span>
                            ) : null}
                          </span>
                        </label>
                      ))}
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                          selectedSavedPaymentMethodId === "new"
                            ? "border-brand-violet bg-brand-violet/10 ring-1 ring-brand-violet/25"
                            : "border-transparent hover:border-brand-lavender-mid hover:bg-brand-lavender/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="saved-card"
                          checked={selectedSavedPaymentMethodId === "new"}
                          onChange={() => setSelectedSavedPaymentMethodId("new")}
                          className="mt-1 h-4 w-4 shrink-0 border-brand-lavender-mid text-brand-violet focus:ring-brand-violet"
                        />
                        <span className="min-w-0 flex-1 font-body text-sm text-brand-text">
                          <span className="font-display font-bold">New card</span>
                          <span className="mt-0.5 block text-xs text-brand-muted">
                            Enter details on Stripe. You can save another card below — multiple cards are allowed.
                          </span>
                        </span>
                      </label>
                    </div>
                  ) : user?.stripeCustomerId ? (
                    <p className="rounded-2xl border border-brand-lavender-mid bg-white/60 px-4 py-3 font-body text-xs leading-relaxed text-brand-muted">
                      No saved cards on file yet. Continue to Stripe to add one. Turn on &quot;Save card&quot; after
                      payment to vault it — repeat on future orders to build a list of cards.
                    </p>
                  ) : (
                    <p className="rounded-2xl border border-brand-lavender-mid bg-white/60 px-4 py-3 font-body text-xs leading-relaxed text-brand-text">
                      You&apos;ll enter your card on Stripe&apos;s secure page. Enable &quot;Save card&quot; to store it;
                      you can save <strong className="font-display">several cards</strong> over time and pick one here
                      next time.
                    </p>
                  )}
                </div>
              )}

              {paymentMethod === "card" && (
                <p className="mb-4 rounded-2xl border border-brand-lavender-mid bg-white/60 px-4 py-3 font-body text-xs leading-relaxed text-brand-text">
                  {selectedSavedPaymentMethodId !== "new" ? (
                    <>
                      Stripe will use the card you selected. You may only need to enter the{" "}
                      <strong className="font-display">security code (CVC)</strong> — it is never stored.
                    </>
                  ) : (
                    <>
                      Payment continues on Stripe. Only the <strong className="font-display">CVC</strong> may be
                      required if you pick a saved card next time.
                    </>
                  )}
                </p>
              )}

              {paymentMethod === "card" && selectedSavedPaymentMethodId === "new" && (
                <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-brand-lavender-mid bg-white/70 p-4 text-left">
                  <input
                    data-cy="save-payment-method"
                    type="checkbox"
                    checked={savePaymentMethod}
                    onChange={(e) => setSavePaymentMethod(e.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-brand-lavender-mid text-brand-violet focus:ring-brand-violet"
                  />
                  <span>
                    <span className="font-display font-bold text-sm text-brand-text">Save this card for next time</span>
                    <span className="mt-1 block font-body text-xs text-brand-muted">
                      When checked, Stripe adds the new card you enter to your saved list (you can store multiple).
                      Uncheck for a one-off payment without saving another card.
                    </span>
                  </span>
                </label>
              )}

              {paymentMethod === "card" && selectedSavedPaymentMethodId !== "new" && savedCards.length > 0 && (
                <p className="mb-6 rounded-2xl border border-brand-lavender-mid/80 bg-brand-lavender/15 px-4 py-3 font-body text-xs text-brand-muted">
                  Using a card already on file. To add another card, select <strong className="font-display text-brand-text">New card</strong>{" "}
                  above and enable save after paying.
                </p>
              )}

              {!isStoreOpen && isLoaded && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                  <p className="text-sm font-display font-bold text-red-600">Store is currently closed.</p>
                  <p className="text-xs font-body text-red-500 mt-1">Please check back during our opening hours.</p>
                </div>
              )}

              {minimumEligibleAmount < MIN_ORDER_TOTAL && (
                <div data-cy="minimum-order-warning" className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm font-display font-bold text-amber-700">
                    Minimum order amount is €{MIN_ORDER_TOTAL.toFixed(2)} (excluding delivery)
                  </p>
                  <p className="text-xs font-body text-amber-700 mt-1">
                    Add more items to continue checkout.
                  </p>
                </div>
              )}
              
              <button 
                data-cy="checkout-button"
                disabled={isCheckoutDisabled || isCardProcessing}
                onClick={async () => {
                  if (!isStoreOpen) {
                    toast.error("Sorry, the store is closed right now.");
                    return;
                  }

                  // Guard both CoD and Card paths in case button state is bypassed.
                  if (minimumEligibleAmount < MIN_ORDER_TOTAL) {
                    toast.error(
                      `Minimum order amount is €${MIN_ORDER_TOTAL.toFixed(2)} excluding delivery fee.`
                    );
                    return;
                  }

                  if (paymentMethod === "card") {
                    await startCardCheckout();
                    return;
                  }

                  // Orders + notification writes are keyed by auth UID in Firestore rules.
                  // Block checkout if auth is not ready to prevent permission-denied flows.
                  const currentUid = auth.currentUser?.uid;
                  if (!currentUid) {
                    toast.error("Please log in before placing an order.");
                    return;
                  }
                  
                  try {
                    // Update profile if they provided new phone
                    if (phone && phone !== user?.phone) {
                      dispatch(updateProfile({ phone }));
                    }


                    // Build orderData and remove undefined fields
                    const orderDataRaw = {
                      items,
                      subtotal,
                      serviceCharge,
                      deliveryCharge: deliveryFee,
                      total,
                      paymentMethod: "cod",
                      paymentStatus: "pending_cod",
                      orderType,
                      address: orderType === "delivery" ? (currentAddress ?? null) : null,
                      customerName: user?.name || "Guest",
                      customerPhone: (phone ?? user?.phone) ? (phone ?? user?.phone) : null,
                      requestedPickupTime: orderType === "collection" ? (pickupMinutes ?? null) : null,
                    };
                    // Remove any undefined fields
                    const orderData = Object.fromEntries(Object.entries(orderDataRaw).filter(([_, v]) => v !== undefined));
                    const docRef = await placeOrder(currentUid, orderData);
                    
                    // === Generate POS-style Invoice PDF ===
                    const doc = new jsPDF({ unit: "mm", format: "a4" });
                    const pageW = doc.internal.pageSize.getWidth();
                    const now = new Date();
                    const dateStr = now.toLocaleDateString("en-IE");
                    const timeStr = now.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" });

                    // ── Fetch active driver ──
                    let driverName = "";
                    let driverPhone = "";
                    if (orderType === "delivery") {
                      try {
                        const driversSnap = await getDocs(
                          query(collection(db, "drivers"), where("isWorkingToday", "==", true))
                        );
                        if (!driversSnap.empty) {
                          const d = driversSnap.docs[0].data();
                          driverName = d.name || "";
                          driverPhone = d.phone || "";
                        }
                      } catch (err) { console.error(err); }
                    }

                    // ── Header ──
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(18);
                    doc.text("CHAO THAI", 14, 20);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text("8 O'Connell St, Trinity Without", 14, 27);
                    doc.text("Waterford, X91 CH61", 14, 31);
                    doc.text("T: 089 447 6628  |  W: www.chaothai.ie", 14, 35);

                    // Right side – Invoice label & meta
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(14);
                    doc.setTextColor(0);
                    doc.text("INVOICE", pageW - 14, 20, { align: "right" });
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(100);
                    doc.text(`No: #${docRef.id.slice(0, 8).toUpperCase()}`, pageW - 14, 27, { align: "right" });
                    doc.text(`Date: ${dateStr}`, pageW - 14, 31, { align: "right" });
                    doc.text(`Time: ${timeStr}`, pageW - 14, 35, { align: "right" });
                    doc.text("Payment: Cash on Delivery", pageW - 14, 39, { align: "right" });

                    // Divider
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.5);
                    doc.line(14, 42, pageW - 14, 42);

                    // ── Details grid ──
                    doc.setTextColor(120);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "bold");
                    doc.text("SERVICE TYPE", 14, 50);
                    doc.text("CUSTOMER DETAILS", pageW / 2, 50);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text(orderType.toUpperCase(), 14, 56);

                    if (orderType === "delivery" && driverName) {
                      doc.setFontSize(8);
                      doc.setTextColor(80);
                      doc.text(`Driver: ${driverName}`, 14, 61);
                      if (driverPhone) doc.text(`Mobile: ${driverPhone}`, 14, 65);
                    }

                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "bold");
                    doc.text(user?.name || "Guest", pageW / 2, 56);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(80);
                    if (phone || user?.phone) doc.text(`${phone || user?.phone}`, pageW / 2, 61);
                    if (orderType === "delivery" && currentAddress) {
                      doc.text(currentAddress, pageW / 2, 66, { maxWidth: pageW / 2 - 14 });
                    } else {
                      doc.text("Collection / Takeaway", pageW / 2, 66);
                      if (orderType === "collection") {
                        doc.setFont("helvetica", "bold");
                        doc.text(`Requested Pickup: ${pickupMinutes} mins`, pageW / 2, 70);
                      }
                    }

                    // ── Items table ──
                    const tableStartY = orderType === "delivery" && driverPhone ? 76 : 72;
                    autoTable(doc, {
                      startY: tableStartY,
                      head: [["Item Description", "Qty", "Unit", "Amount"]],
                      body: items.map(item => [
                        item.name +
                          (item.selectedProtein ? ` (${item.selectedProtein})` : "") +
                          (item.selectedSide ? ` / ${item.selectedSide}` : "") +
                          (item.selectedSpice ? ` · ${item.selectedSpice}` : ""),
                        item.quantity,
                        `€${(item.basePrice || 0).toFixed(2)}`,
                        `€${((item.basePrice || 0) * item.quantity).toFixed(2)}`
                      ]),
                      headStyles: { fillColor: [30, 30, 30], textColor: 255, fontSize: 8, fontStyle: "bold" },
                      bodyStyles: { fontSize: 8 },
                      alternateRowStyles: { fillColor: [248, 248, 248] },
                      columnStyles: { 1: { halign: "center" }, 2: { halign: "right" }, 3: { halign: "right" } },
                      margin: { left: 14, right: 14 },
                    });

                    // ── Totals ──
                    const tY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.3);
                    doc.line(pageW - 80, tY + 2, pageW - 14, tY + 2);

                    const addRow = (label: string, val: string, y: number, bold = false) => {
                      doc.setFont("helvetica", bold ? "bold" : "normal");
                      doc.setFontSize(bold ? 10 : 8);
                      doc.setTextColor(bold ? 0 : 80);
                      doc.text(label, pageW - 80, y);
                      doc.text(val, pageW - 14, y, { align: "right" });
                    };
                    addRow("Subtotal",        `€${subtotal.toFixed(2)}`,     tY + 8);
                    addRow("Service Charge",  `€${serviceCharge.toFixed(2)}`,tY + 14);
                    if (orderType === "delivery") addRow("Delivery", `€${deliveryFee.toFixed(2)}`, tY + 20);
                    const totalY = orderType === "delivery" ? tY + 28 : tY + 22;
                    doc.setLineWidth(0.4);
                    doc.line(pageW - 80, totalY - 2, pageW - 14, totalY - 2);
                    addRow("TOTAL AMOUNT",    `€${total.toFixed(2)}`,        totalY + 4, true);

                    // ── Footer ──
                    const footY = totalY + 22;
                    doc.setFont("helvetica", "bold");
                    doc.setFontSize(8);
                    doc.setTextColor(80);
                    doc.text("THANK YOU FOR YOUR ORDER", pageW / 2, footY, { align: "center" });
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(7);
                    doc.setTextColor(140);
                    doc.text("This is a computer-generated document.", pageW / 2, footY + 5, { align: "center" });

                    doc.save(`chao-invoice-${docRef.id.slice(0, 8)}.pdf`);

                    toast.success("Order placed successfully!");
                    dispatch(clearCart());
                    
                    // Add order to user's profile
                    const placedAt = new Date();
                    const newClientOrder = {
                      id: docRef.id,
                      date: placedAt.toLocaleDateString("en-IE"),
                      createdAt: placedAt.toISOString(),
                      total: total,
                      status: "pending" as const,
                      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.basePrice || 0 })),
                      orderType: orderType,
                    };
                    dispatch(addOrder(newClientOrder));
                    
                    // Show modal
                    setPlacedOrderId(docRef.id);
                  } catch (e) {
                    console.error("Checkout failed:", e);
                    toast.error("Failed to place order.");
                  }
                }}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-2xl py-5 flex items-center justify-center gap-3 shadow-violet-glow transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentMethod === "card"
                  ? (isCardProcessing ? "Redirecting to Stripe..." : "Pay with Card")
                  : "Checkout Now"}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Order Tracking Modal */}
      {placedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="p-8 text-center bg-brand-lavender/30 border-b border-brand-lavender-mid">
              <div className="w-20 h-20 bg-brand-violet rounded-full flex items-center justify-center mx-auto mb-6 shadow-violet-glow">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h2 className="font-display font-bold text-3xl text-brand-text mb-2">Order Received!</h2>
              <p className="font-body text-brand-muted">Order #{placedOrderId}</p>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-center">
                <h3 className="font-display font-bold text-orange-600 mb-1">Status: Pending Confirmation</h3>
                <p className="text-sm font-body text-orange-500">The restaurant has received your order and is reviewing it.</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-body border-b border-brand-lavender-mid pb-3">
                  <span className="text-brand-muted">
                    {orderType === "collection" ? "Requested Pickup Time:" : "Estimated Prep Time:"}
                  </span>
                  <span className="font-bold text-brand-text">
                    ~{orderType === "collection" ? pickupMinutes : "20-30"} mins
                  </span>
                </div>
                {orderType === "delivery" && (
                  <div className="flex justify-between items-center text-sm font-body">
                    <span className="text-brand-muted">Estimated Delivery:</span>
                    <span className="font-bold text-brand-text">~45 mins</span>
                  </div>
                )}
              </div>
              
              <Link 
                href="/orders" 
                className="block w-full text-center bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 transition-all"
              >
                Track My Order
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
