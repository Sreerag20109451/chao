import type Stripe from "stripe";

/**
 * Stripe creates a new PaymentMethod object on each Checkout completion. Re-using the same
 * physical card therefore stacks duplicate PMs on the Customer. Group by card fingerprint,
 * keep the newest PM, detach the rest (same last4/exp is not sufficient across brands).
 */
export async function dedupeCustomerCardPaymentMethods(
  stripe: Stripe,
  customerId: string
): Promise<void> {
  const list = await stripe.paymentMethods.list({
    customer: customerId,
    type: "card",
    limit: 100,
  });

  const groups = new Map<string, Stripe.PaymentMethod[]>();

  for (const pm of list.data) {
    const card = pm.card;
    const key =
      card?.fingerprint ??
      (card?.last4 != null &&
      card.exp_month != null &&
      card.exp_year != null &&
      card.brand != null
        ? `legacy:${card.brand}:${card.last4}:${card.exp_month}:${card.exp_year}`
        : null);

    if (!key) continue;

    const bucket = groups.get(key) ?? [];
    bucket.push(pm);
    groups.set(key, bucket);
  }

  for (const bucket of groups.values()) {
    if (bucket.length <= 1) continue;
    bucket.sort((a, b) => (b.created ?? 0) - (a.created ?? 0));
    const [, ...olderDuplicates] = bucket;
    for (const pm of olderDuplicates) {
      try {
        await stripe.paymentMethods.detach(pm.id);
      } catch (err) {
        console.warn("[dedupeCustomerCardPaymentMethods] detach failed:", pm.id, err);
      }
    }
  }
}
