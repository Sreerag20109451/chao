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
  customerEmail?: string | null;
  customerPhone: string | null;
  address: string | null;
};

const MIN_ORDER_TOTAL_EUR = 10;

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

    // Server-side minimum-order validation (do not trust client-only checks).
    // Delivery fee is excluded from minimum policy.
    const itemsSubtotal = body.items.reduce(
      (sum, item) => sum + (item.basePrice || 0) * (item.quantity || 1),
      0
    );
    const minimumEligibleTotal = itemsSubtotal + (body.serviceCharge || 0);
    if (minimumEligibleTotal < MIN_ORDER_TOTAL_EUR) {
      return res.status(400).json({
        error: `Minimum order amount is €${MIN_ORDER_TOTAL_EUR.toFixed(2)} excluding delivery fee.`,
      });
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

    // Secure card "saving" is handled by Stripe vaulting:
    // - We attach checkout to a Stripe Customer
    // - We request future usage so the card can be reused without storing card PAN ourselves.
    let customerId: string | undefined;
    const normalizedEmail = body.customerEmail?.trim().toLowerCase();
    if (normalizedEmail) {
      const existing = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const created = await stripe.customers.create({
          email: normalizedEmail,
          name: body.customerName || undefined,
          phone: body.customerPhone || undefined,
          metadata: {
            source: "chao-web-checkout",
          },
        });
        customerId = created.id;
      }
    }

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
      customer: customerId,
      customer_email: customerId ? undefined : normalizedEmail || undefined,
      payment_intent_data: {
        // Tells Stripe to securely save card for future payments.
        setup_future_usage: "off_session",
      },
    });

    return res.status(200).json({ url: session.url || undefined, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
