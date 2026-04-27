/**
 * Stripe-linked fields mirrored in Firestore `users/{uid}` and Redux `User`.
 * Card details are non-sensitive display hints (last4 / brand); PCI data stays on Stripe.
 */
export interface StripeBillingInfo {
  stripeCustomerId?: string;
  stripeCardLast4?: string;
  stripeCardBrand?: string;
}

/** Masked card row from Stripe (`paymentMethods.list`). */
export interface StripeSavedPaymentMethod {
  id: string;
  brand: string | null;
  last4: string | null;
  expMonth: number | null;
  expYear: number | null;
}

export function formatCardBrandDisplay(brand?: string | null): string {
  if (!brand) return "Card";
  return brand.charAt(0).toUpperCase() + brand.slice(1).toLowerCase();
}
