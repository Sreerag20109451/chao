import type { NextApiRequest, NextApiResponse } from "next";
import { getStripeServerClient } from "@/lib/stripeServer";

type VerifyResponse = {
  paid: boolean;
  amountTotal: number;
  paymentStatus: string;
  customerEmail: string | null;
  sessionId: string;
  error?: string;
};

/**
 * Verifies the Stripe Checkout session after redirect from Stripe hosted page.
 * The client uses this trusted server response before persisting "paid" order data.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<VerifyResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      paid: false,
      amountTotal: 0,
      paymentStatus: "invalid_method",
      customerEmail: null,
      sessionId: "",
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
        error: "Missing session_id",
      });
    }

    const stripe = getStripeServerClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    return res.status(200).json({
      paid,
      amountTotal: session.amount_total || 0,
      paymentStatus: session.payment_status || "unknown",
      customerEmail: session.customer_details?.email || null,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Stripe session verification failed:", error);
    return res.status(500).json({
      paid: false,
      amountTotal: 0,
      paymentStatus: "verification_failed",
      customerEmail: null,
      sessionId: "",
      error: "Failed to verify session",
    });
  }
}
