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
import { updateProfile, setPrimaryAddress, addOrder } from "@/lib/features/authSlice";
import { useStoreStatus } from "@/hooks/useStoreStatus";
import { toast } from "sonner";
import { placeOrder } from "@/lib/firebase/orders/service";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function CartPage() {
  const { items, orderType } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const { isOpen: isStoreOpen, isLoaded } = useStoreStatus();
  const dispatch = useDispatch();

  const [phone, setPhone] = useState(user?.phone || "");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const subtotal = items.reduce(
    (acc, item) => acc + (item.basePrice || 0) * item.quantity, 
    0
  );
  const serviceCharge = subtotal * 0.05;
  const deliveryFee = orderType === "collection" ? 0 : (subtotal > 30 ? 0 : 3.5);
  const total = subtotal + serviceCharge + deliveryFee;

  const currentAddress = user?.addresses[user?.primaryAddressIndex || 0];
  const isCheckoutDisabled = !isStoreOpen || (orderType === "delivery" && (!currentAddress || !phone.trim()));

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
                {!user?.phone && (
                  <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center shrink-0">
                        <Phone className="w-6 h-6 text-brand-violet" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-brand-text text-lg mb-2">Contact Number</h3>
                        <div className="flex gap-2">
                          <input 
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Required for delivery..."
                            className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-violet/20"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (phone.trim()) {
                                dispatch(updateProfile({ phone }));
                                try {
                                  const { auth, db } = await import("@/lib/firebase/config");
                                  if (auth.currentUser) {
                                    const { doc, updateDoc } = await import("firebase/firestore");
                                    await updateDoc(doc(db, "users", auth.currentUser.uid), { phone });
                                    toast.success("Phone number saved!");
                                  }
                                } catch (e) {
                                  console.error(e);
                                }
                              }
                            }}
                            className="bg-brand-violet hover:bg-brand-violet-dark text-white rounded-xl px-6 py-2 font-display font-bold text-sm shadow-sm transition-all"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                          No delivery address added yet. Please add one.
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
                  <li key={item.cartId} className="p-6 flex flex-col sm:flex-row sm:items-center gap-6 group">
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
                          </div>
                          <p className="font-body text-brand-muted text-sm line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                        <span className="font-display font-bold text-brand-text text-lg whitespace-nowrap">
                          £{((item.basePrice || 0) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white border border-brand-lavender-mid rounded-xl p-1 shadow-sm">
                          <button 
                            onClick={() => dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity - 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-display font-bold text-sm">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => dispatch(updateQuantity({ cartId: item.cartId, quantity: item.quantity + 1 }))}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-lavender text-brand-text transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button 
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

              {!isStoreOpen && isLoaded && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-center">
                  <p className="text-sm font-display font-bold text-red-600">Store is currently closed.</p>
                  <p className="text-xs font-body text-red-500 mt-1">Please check back during our opening hours.</p>
                </div>
              )}
              
              <button 
                disabled={isCheckoutDisabled}
                onClick={async () => {
                  if (!isStoreOpen) {
                    toast.error("Sorry, the store is closed right now.");
                    return;
                  }
                  
                  try {
                    // Update profile if they provided new phone
                    if (phone && phone !== user?.phone) {
                      dispatch(updateProfile({ phone }));
                    }

                    const orderData = {
                      items,
                      subtotal,
                      deliveryCharge: deliveryFee,
                      total,
                      orderType,
                      address: orderType === "delivery" ? currentAddress : null,
                      customerName: user?.name || "Guest",
                      customerPhone: phone || user?.phone || null,
                    };
                    
                    const docRef = await placeOrder(user?.email || "guest", orderData);
                    
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

                    // Divider
                    doc.setDrawColor(0);
                    doc.setLineWidth(0.5);
                    doc.line(14, 40, pageW - 14, 40);

                    // ── Details grid ──
                    doc.setTextColor(120);
                    doc.setFontSize(7);
                    doc.setFont("helvetica", "bold");
                    doc.text("SERVICE TYPE", 14, 48);
                    doc.text("CUSTOMER DETAILS", pageW / 2, 48);

                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.text(orderType.toUpperCase(), 14, 54);

                    if (orderType === "delivery" && driverName) {
                      doc.setFontSize(8);
                      doc.setTextColor(80);
                      doc.text(`Driver: ${driverName}`, 14, 59);
                      if (driverPhone) doc.text(`Mobile: ${driverPhone}`, 14, 63);
                    }

                    doc.setFontSize(9);
                    doc.setTextColor(0);
                    doc.setFont("helvetica", "bold");
                    doc.text(user?.name || "Guest", pageW / 2, 54);
                    doc.setFont("helvetica", "normal");
                    doc.setFontSize(8);
                    doc.setTextColor(80);
                    if (phone || user?.phone) doc.text(`${phone || user?.phone}`, pageW / 2, 59);
                    if (orderType === "delivery" && currentAddress) {
                      doc.text(currentAddress, pageW / 2, 64, { maxWidth: pageW / 2 - 14 });
                    } else {
                      doc.text("Collection / Takeaway", pageW / 2, 64);
                    }

                    // ── Items table ──
                    const tableStartY = orderType === "delivery" && driverPhone ? 74 : 70;
                    autoTable(doc, {
                      startY: tableStartY,
                      head: [["Item Description", "Qty", "Unit", "Amount"]],
                      body: items.map(item => [
                        item.name + (item.selectedProtein ? ` (${item.selectedProtein})` : "") + (item.selectedSide ? ` / ${item.selectedSide}` : ""),
                        item.quantity,
                        `\u00a3${(item.basePrice || 0).toFixed(2)}`,
                        `\u00a3${((item.basePrice || 0) * item.quantity).toFixed(2)}`
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
                    addRow("Subtotal",        `\u00a3${subtotal.toFixed(2)}`,     tY + 8);
                    addRow("Service Charge",  `\u00a3${serviceCharge.toFixed(2)}`,tY + 14);
                    if (orderType === "delivery") addRow("Delivery", `\u00a3${deliveryFee.toFixed(2)}`, tY + 20);
                    const totalY = orderType === "delivery" ? tY + 28 : tY + 22;
                    doc.setLineWidth(0.4);
                    doc.line(pageW - 80, totalY - 2, pageW - 14, totalY - 2);
                    addRow("TOTAL AMOUNT",    `\u00a3${total.toFixed(2)}`,        totalY + 4, true);

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
                    const newClientOrder = {
                      id: docRef.id,
                      date: new Date().toLocaleDateString(),
                      total: total,
                      status: "pending" as any,
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
                Checkout Now
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
                  <span className="text-brand-muted">Estimated Prep Time:</span>
                  <span className="font-bold text-brand-text">~20-30 mins</span>
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
