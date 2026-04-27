import Stripe from "stripe";

/**
 * Builds a server-side Stripe client.
 *
 * Prefer STRIPE_SECRET_KEY (server-only).
 * NEXT_PUBLIC_STRIPE_SECRET_KEY is supported as a temporary fallback
 * for existing local setup, but should be removed because it exposes
 * secret credentials to browser bundles.
 */
export const getStripeServerClient = () => {
  const secretKey =
    process.env.STRIPE_SECRET_KEY || process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing Stripe secret key. Set STRIPE_SECRET_KEY in client/.env.local."
    );
  }

  return new Stripe(secretKey, {
    // Keep API version aligned with the Stripe SDK's typed default.
    apiVersion: "2026-04-22.dahlia",
  });
};
