import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { dedupeCustomerCardPaymentMethods } from "@/lib/stripeDedupeCustomerCards";
import { getStripeServerClient } from "@/lib/stripeServer";

type VerifyResponse = {
  paid: boolean;
  amountTotal: number;
  paymentStatus: string;
  customerEmail: string | null;
  sessionId: string;
  stripeCustomerId: string | null;
  savedCardLast4: string | null;
  savedCardBrand: string | null;
  error?: string;
};

function paymentMethodPreview(paymentIntent: Stripe.PaymentIntent): { last4: string | null; brand: string | null } {
  const pm = paymentIntent.payment_method;
  if (!pm || typeof pm === "string") {
    return { last4: null, brand: null };
  }
  const method = pm as Stripe.PaymentMethod;
  if (method.type === "card" && method.card) {
    return {
      last4: method.card.last4 ?? null,
      brand: method.card.brand ?? null,
    };
  }
  return { last4: null, brand: null };
}

/**
 * Verifies the Stripe Checkout session after redirect from Stripe hosted page.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<VerifyResponse>) {
  if (req.method !== "GET") {
    return res.status(405).json({
      paid: false,
      amountTotal: 0,
      paymentStatus: "invalid_method",
      customerEmail: null,
      sessionId: "",
      stripeCustomerId: null,
      savedCardLast4: null,
      savedCardBrand: null,
      error: "Method not allowed",
    });
  }

  try {
    const sessionId = String(req.query.session_id || "");
    if (!sessionId) {
      return res.status(400).json({
        paid: false,
        amountTotal: 0,
        paymentStatus: "missing_session_id",
        customerEmail: null,
        sessionId: "",
        stripeCustomerId: null,
        savedCardLast4: null,
        savedCardBrand: null,
        error: "Missing session_id",
      });
    }

    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "payment_intent.payment_method"],
    });

    const paid = session.payment_status === "paid";

    let stripeCustomerId: string | null = null;
    const cust = session.customer;
    if (typeof cust === "string") {
      stripeCustomerId = cust;
    } else if (cust && typeof cust === "object" && "id" in cust) {
      stripeCustomerId = (cust as Stripe.Customer).id;
    }

    let savedCardLast4: string | null = null;
    let savedCardBrand: string | null = null;
    const pi = session.payment_intent;
    if (pi && typeof pi !== "string") {
      const intent = pi as Stripe.PaymentIntent;
      const preview = paymentMethodPreview(intent);
      savedCardLast4 = preview.last4;
      savedCardBrand = preview.brand;
    }

    if (paid && stripeCustomerId) {
      try {
        await dedupeCustomerCardPaymentMethods(stripe, stripeCustomerId);
      } catch (dedupeErr) {
        console.warn("verify-session: dedupe payment methods skipped:", dedupeErr);
      }
    }

    return res.status(200).json({
      paid,
      amountTotal: session.amount_total || 0,
      paymentStatus: session.payment_status || "unknown",
      customerEmail: session.customer_details?.email || null,
      sessionId: session.id,
      stripeCustomerId,
      savedCardLast4,
      savedCardBrand,
    });
  } catch (error) {
    console.error("Stripe session verification failed:", error);
    return res.status(500).json({
      paid: false,
      amountTotal: 0,
      paymentStatus: "verification_failed",
      customerEmail: null,
      sessionId: "",
      stripeCustomerId: null,
      savedCardLast4: null,
      savedCardBrand: null,
      error: "Failed to verify session",
    });
  }
}
