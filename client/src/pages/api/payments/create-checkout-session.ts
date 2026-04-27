import type { NextApiRequest, NextApiResponse } from "next";
import { getStripeServerClient } from "@/lib/stripeServer";

type CartLineItem = {
  name: string;
  quantity: number;
  basePrice?: number;
};

type CreateCheckoutPayload = {
  items: CartLineItem[];
  orderType: "delivery" | "collection";
  deliveryFee: number;
  serviceCharge: number;
  customerName: string;
  customerPhone: string | null;
  address: string | null;
};

/**
 * Creates a Stripe Checkout Session for card payments.
 * The cart and delivery metadata are attached so we can persist
 * the paid order after returning from Stripe success URL.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ url?: string; sessionId?: string; error?: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as CreateCheckoutPayload;
    const stripe = getStripeServerClient();

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: "No cart items provided" });
    }

    const lineItems = body.items.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: { name: item.name || "Menu item" },
        unit_amount: Math.round((item.basePrice || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    if (body.serviceCharge > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Service charge" },
          unit_amount: Math.round(body.serviceCharge * 100),
        },
        quantity: 1,
      });
    }

    if (body.deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.round(body.deliveryFee * 100),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.origin || process.env.NEXT_PUBLIC_CLIENT_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?card_cancelled=1`,
      metadata: {
        orderType: body.orderType,
        customerName: body.customerName || "Guest",
        customerPhone: body.customerPhone || "",
        address: body.address || "",
      },
    });

    return res.status(200).json({ url: session.url || undefined, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
