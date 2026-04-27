import { useEffect, useState } from "react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { doc, updateDoc } from "firebase/firestore";
import { clearCart } from "@/lib/features/cartSlice";
import { addOrder, updateStripeBilling } from "@/lib/features/authSlice";
import { placeOrder } from "@/lib/firebase/orders/service";
import { db } from "@/lib/firebase";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

type CheckoutDraft = {
  userId: string;
  items: Array<{ name: string; quantity: number; basePrice?: number }>;
  subtotal: number;
  serviceCharge: number;
  deliveryFee: number;
  total: number;
  orderType: "delivery" | "collection";
  address: string | null;
  customerName: string;
  customerPhone: string | null;
  requestedPickupTime: number | null;
  /** Mirrors cart checkbox — vault card on Stripe Customer when true. */
  savePaymentMethod?: boolean;
};

/**
 * Stripe success page:
 * 1) verifies session server-side
 * 2) persists a paid order in Firestore
 * 3) clears cart and shows confirmation state
 */
export default function CheckoutSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const finalizeCardOrder = async () => {
      const sessionId = String(router.query.session_id || "");
      if (!sessionId) return;

      const draftRaw = sessionStorage.getItem("stripe_checkout_draft");
      if (!draftRaw) {
        toast.error("Missing checkout draft. Please contact support.");
        setIsLoading(false);
        return;
      }

      try {
        const verifyRes = await fetch(`/api/payments/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const verifyPayload = await verifyRes.json() as {
          paid?: boolean;
          sessionId?: string;
          stripeCustomerId?: string | null;
          savedCardLast4?: string | null;
          savedCardBrand?: string | null;
        };

        if (!verifyRes.ok || !verifyPayload?.paid) {
          throw new Error("Stripe payment was not completed.");
        }

        const draft = JSON.parse(draftRaw) as CheckoutDraft;

        const saveRequested = draft.savePaymentMethod !== false;
        if (saveRequested && verifyPayload.stripeCustomerId) {
          await updateDoc(doc(db, "users", draft.userId), {
            stripeCustomerId: verifyPayload.stripeCustomerId,
            stripeCardLast4: verifyPayload.savedCardLast4 ?? null,
            stripeCardBrand: verifyPayload.savedCardBrand ?? null,
          });
          dispatch(
            updateStripeBilling({
              stripeCustomerId: verifyPayload.stripeCustomerId,
              stripeCardLast4: verifyPayload.savedCardLast4 ?? undefined,
              stripeCardBrand: verifyPayload.savedCardBrand ?? undefined,
            })
          );
        }
        const orderData = {
          items: draft.items,
          subtotal: draft.subtotal,
          serviceCharge: draft.serviceCharge,
          deliveryCharge: draft.deliveryFee,
          total: draft.total,
          orderType: draft.orderType,
          paymentMethod: "card",
          paymentStatus: "paid",
          stripeSessionId: verifyPayload.sessionId,
          address: draft.address,
          customerName: draft.customerName,
          customerPhone: draft.customerPhone,
          requestedPickupTime: draft.requestedPickupTime,
        };

        const docRef = await placeOrder(draft.userId, orderData);
        const placedAt = new Date();

        dispatch(
          addOrder({
            id: docRef.id,
            date: placedAt.toLocaleDateString("en-IE"),
            createdAt: placedAt.toISOString(),
            total: draft.total,
            status: "pending",
            orderType: draft.orderType,
            items: draft.items.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.basePrice || 0,
            })),
          })
        );
        dispatch(clearCart());
        sessionStorage.removeItem("stripe_checkout_draft");
        setOrderId(docRef.id);
        toast.success("Card payment confirmed and order placed.");
      } catch (error) {
        console.error("Failed to finalize card order:", error);
        toast.error("Payment confirmed but order finalization failed. Please contact support.");
      } finally {
        setIsLoading(false);
      }
    };

    finalizeCardOrder();
  }, [dispatch, router.query.session_id]);

  return (
    <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white border border-brand-lavender-mid rounded-3xl shadow-xl p-8 text-center">
        {isLoading ? (
          <>
            <Loader2 className="w-12 h-12 text-brand-violet animate-spin mx-auto mb-4" />
            <h1 className="font-display font-bold text-2xl text-brand-text">Finalizing your payment...</h1>
            <p className="font-body text-brand-muted mt-2">Please wait while we confirm your order.</p>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
            <h1 className="font-display font-bold text-3xl text-brand-text">Payment Successful</h1>
            <p className="font-body text-brand-muted mt-2">
              {orderId ? `Order #${orderId.slice(0, 8).toUpperCase()} has been placed.` : "Your payment was received."}
            </p>
            <div className="mt-8 flex gap-3 justify-center">
              <Link href="/orders" className="bg-brand-violet text-white px-5 py-3 rounded-xl font-display font-bold">
                Track Order
              </Link>
              <Link href="/menu" className="border border-brand-lavender-mid px-5 py-3 rounded-xl font-display font-bold text-brand-text">
                Back to Menu
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
