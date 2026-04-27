import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
import { dedupeCustomerCardPaymentMethods } from "@/lib/stripeDedupeCustomerCards";
import { getStripeServerClient } from "@/lib/stripeServer";

type ListBody = {
  stripeCustomerId?: string | null;
  customerEmail?: string | null;
};

type CardRow = {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
};

/**
 * Lists saved cards for a Stripe Customer after verifying the customer belongs to this email.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ paymentMethods?: CardRow[]; error?: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ListBody;
    const customerId = body.stripeCustomerId?.trim();
    const normalizedEmail = body.customerEmail?.trim().toLowerCase();

    if (!normalizedEmail || !customerId?.startsWith("cus_")) {
      return res.status(400).json({ error: "Missing customer or email." });
    }

    const stripe = getStripeServerClient();
    const customer = await stripe.customers.retrieve(customerId);

    if (!customer || ("deleted" in customer && customer.deleted)) {
      return res.status(404).json({ error: "Customer not found." });
    }

    const cust = customer as Stripe.Customer;
    const custEmail = (cust.email || "").trim().toLowerCase();
    if (!custEmail || custEmail !== normalizedEmail) {
      return res.status(403).json({ error: "Customer does not match this account." });
    }

    try {
      await dedupeCustomerCardPaymentMethods(stripe, customerId);
    } catch (dedupeErr) {
      console.warn("list-payment-methods: dedupe skipped:", dedupeErr);
    }

    const list = await stripe.paymentMethods.list({
      customer: customerId,
      type: "card",
      limit: 100,
    });

    const rows: CardRow[] = list.data
      .map((pm) => ({
        id: pm.id,
        brand: pm.card?.brand ?? null,
        last4: pm.card?.last4 ?? null,
        expMonth: pm.card?.exp_month ?? null,
        expYear: pm.card?.exp_year ?? null,
        _sort: typeof pm.created === "number" ? pm.created : 0,
      }))
      .sort((a, b) => b._sort - a._sort)
      .map(({ _sort, ...row }) => row);

    return res.status(200).json({ paymentMethods: rows });
  } catch (error) {
    console.error("list-payment-methods failed:", error);
    return res.status(500).json({ error: "Could not load saved cards." });
  }
}
