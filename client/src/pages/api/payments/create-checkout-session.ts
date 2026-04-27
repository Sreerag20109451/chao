import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
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
  /** When true, attach a Stripe Customer and vault the card for future checkout. */
  savePaymentMethod?: boolean;
  /** Optional; verified server-side against customer email before reuse. */
  stripeCustomerId?: string | null;
  /** When set, charge this saved card (must belong to the resolved Customer). Use null/omit for a new card on Stripe. */
  selectedPaymentMethodId?: string | null;
};

const MIN_ORDER_TOTAL_EUR = 10;

function paymentMethodCustomerId(pm: Stripe.PaymentMethod): string | null {
  const c = pm.customer;
  if (typeof c === "string") return c;
  if (c && typeof c === "object" && "id" in c) {
    return (c as Stripe.Customer).id;
  }
  return null;
}

async function resolveOrCreateCustomer(
  stripe: Stripe,
  body: CreateCheckoutPayload
): Promise<string | undefined> {
  const normalizedEmail = body.customerEmail?.trim().toLowerCase();
  if (!normalizedEmail) return undefined;

  const trustedId = body.stripeCustomerId?.trim();
  if (trustedId?.startsWith("cus_")) {
    try {
      const existing = await stripe.customers.retrieve(trustedId);
      if (existing && !("deleted" in existing && existing.deleted)) {
        const cust = existing as Stripe.Customer;
        const email = (cust.email || "").trim().toLowerCase();
        if (email && email === normalizedEmail) {
          return cust.id;
        }
      }
    } catch {
      // ignore and fall through to lookup by email
    }
  }

  const list = await stripe.customers.list({ email: normalizedEmail, limit: 1 });
  if (list.data.length > 0) return list.data[0].id;

  const created = await stripe.customers.create({
    email: normalizedEmail,
    name: body.customerName || undefined,
    phone: body.customerPhone || undefined,
    metadata: { source: "chao-web-checkout" },
  });
  return created.id;
}

/**
 * Creates a Stripe Checkout Session for card payments.
 * Save-card is opt-in: `savePaymentMethod` controls `setup_future_usage` and Customer attachment.
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

    const deliveryFee = Number(body.deliveryFee ?? 0);
    const serviceChargeNum = Number(body.serviceCharge ?? 0);

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ error: "No cart items provided" });
    }

    const itemsSubtotal = body.items.reduce(
      (sum, item) => sum + (item.basePrice || 0) * (item.quantity || 1),
      0
    );
    const minimumEligibleTotal = itemsSubtotal + serviceChargeNum;
    if (minimumEligibleTotal < MIN_ORDER_TOTAL_EUR) {
      return res.status(400).json({
        error: `Minimum order amount is €${MIN_ORDER_TOTAL_EUR.toFixed(2)} excluding delivery fee.`,
      });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams["line_items"] = [];

    for (const item of body.items) {
      const cents = Math.round(Number(item.basePrice ?? 0) * 100);
      if (!Number.isFinite(cents) || cents <= 0) {
        return res.status(400).json({
          error: `Invalid or missing price for "${item.name || "menu item"}". Refresh and try again.`,
        });
      }
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: item.name || "Menu item" },
          unit_amount: cents,
        },
        quantity: Math.max(1, item.quantity || 1),
      });
    }

    if (serviceChargeNum > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Service charge" },
          unit_amount: Math.max(1, Math.round(serviceChargeNum * 100)),
        },
        quantity: 1,
      });
    }

    if (deliveryFee > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: { name: "Delivery fee" },
          unit_amount: Math.max(1, Math.round(deliveryFee * 100)),
        },
        quantity: 1,
      });
    }

    const origin = req.headers.origin || process.env.NEXT_PUBLIC_CLIENT_BASE_URL || "http://localhost:3000";
    const normalizedEmail = body.customerEmail?.trim().toLowerCase();
    const savePaymentMethod = Boolean(body.savePaymentMethod);

    // Resolve Stripe Customer whenever we have email / a verified customer id so Checkout can list
    // saved cards (Stripe pre-selects when possible; security code is entered on Stripe's page only).
    const customerId = await resolveOrCreateCustomer(stripe, body);

    let selectedPaymentMethodId: string | undefined;
    const requestedPm = body.selectedPaymentMethodId?.trim();
    if (requestedPm?.startsWith("pm_")) {
      if (!customerId) {
        return res.status(400).json({
          error: "Save a card first or complete one checkout before using a saved card.",
        });
      }
      const pm = await stripe.paymentMethods.retrieve(requestedPm);
      if (pm.type !== "card") {
        return res.status(400).json({ error: "Invalid payment method type." });
      }
      const pmCustomer = paymentMethodCustomerId(pm);
      if (pmCustomer !== customerId) {
        return res.status(400).json({ error: "That card does not belong to this account." });
      }
      selectedPaymentMethodId = requestedPm;
    }

    // Stripe API accepts `payment_method` for pre-selected saved cards; typings may omit it by API version.
    type SessionParams = Stripe.Checkout.SessionCreateParams & { payment_method?: string };

    const sessionParams: SessionParams = {
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
        savePaymentMethod: savePaymentMethod ? "true" : "false",
      },
      // Checkout defaults to showing only PMs with allow_redisplay=always; cards saved with
      // setup_future_usage from a prior visit are often "limited" and would not appear otherwise.
      saved_payment_method_options: {
        allow_redisplay_filters: ["always", "limited", "unspecified"],
        ...(savePaymentMethod && !selectedPaymentMethodId
          ? { payment_method_save: "enabled" as const }
          : {}),
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else if (normalizedEmail) {
      sessionParams.customer_email = normalizedEmail;
    }

    if (selectedPaymentMethodId) {
      sessionParams.payment_method = selectedPaymentMethodId;
    }

    // Vault a *new* card only when checkout collects fresh card details (no pre-selected saved PM).
    if (savePaymentMethod && !selectedPaymentMethodId) {
      sessionParams.payment_intent_data = {
        setup_future_usage: "off_session",
      };
    }

    let session: Stripe.Response<Stripe.Checkout.Session>;
    try {
      session = await stripe.checkout.sessions.create(sessionParams as Stripe.Checkout.SessionCreateParams);
    } catch (firstErr) {
      // Some API/account combinations reject `payment_method` on Checkout; retry without it so checkout still works.
      if (selectedPaymentMethodId && sessionParams.payment_method) {
        const { payment_method: _skip, ...withoutPm } = sessionParams;
        console.warn("Checkout session: retrying without payment_method after:", firstErr);
        session = await stripe.checkout.sessions.create(withoutPm as Stripe.Checkout.SessionCreateParams);
      } else {
        throw firstErr;
      }
    }

    return res.status(200).json({ url: session.url || undefined, sessionId: session.id });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return res.status(400).json({ error: error.message });
    }
    if (error instanceof Error) {
      if (error.message.includes("Missing Stripe secret key")) {
        return res.status(500).json({ error: error.message });
      }
    }
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
