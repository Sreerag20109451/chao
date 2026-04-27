import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import {
  CreditCard,
  ChevronLeft,
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
} from "lucide-react";
import type { StripeSavedPaymentMethod } from "@/models/billing";
import { formatCardBrandDisplay } from "@/models/billing";

export default function PaymentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [cards, setCards] = useState<StripeSavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.stripeCustomerId || !user?.email) {
      setCards([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const res = await fetch("/api/payments/list-payment-methods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stripeCustomerId: user.stripeCustomerId,
            customerEmail: user.email,
          }),
        });
        const data = (await res.json()) as { paymentMethods?: StripeSavedPaymentMethod[] };
        if (cancelled) return;
        setCards(Array.isArray(data.paymentMethods) ? data.paymentMethods : []);
      } catch {
        if (!cancelled) setCards([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.stripeCustomerId, user?.email]);

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-10">
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-brand-muted hover:text-brand-violet transition-colors font-display font-bold text-sm uppercase tracking-wider mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Link>
          <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight">
            Payment <span className="text-brand-violet">Methods.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="font-display font-bold text-brand-text text-lg uppercase tracking-wider">Checkout Options</h2>
            </div>

            {user.stripeCustomerId && (
              <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 text-brand-text">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-700" />
                  <p className="font-display font-bold text-sm text-brand-text">Saved cards (Stripe)</p>
                </div>
                {loading ? (
                  <div className="flex items-center gap-2 font-body text-sm text-brand-muted">
                    <Loader2 className="h-4 w-4 animate-spin text-brand-violet" />
                    Loading cards…
                  </div>
                ) : cards.length === 0 ? (
                  <p className="font-body text-xs text-brand-muted">
                    No cards saved yet. Pay with card at checkout and enable &quot;Save this card&quot; — you can store
                    multiple cards over time and pick which one to use in the cart.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {cards.map((card) => (
                      <li
                        key={card.id}
                        className="flex items-start justify-between gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="font-display font-bold text-sm text-brand-text">
                            {formatCardBrandDisplay(card.brand)} •••• {card.last4 || "····"}
                          </p>
                          {card.expMonth != null && card.expYear != null ? (
                            <p className="mt-0.5 font-body text-[11px] text-brand-muted">
                              Exp {String(card.expMonth).padStart(2, "0")}/{String(card.expYear).slice(-2)}
                            </p>
                          ) : null}
                        </div>
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-4 border-t border-emerald-100 pt-4 font-body text-[11px] text-brand-muted">
                  Choose which card to charge in the cart before you go to Stripe. Manage new cards by selecting
                  &quot;New card&quot; at checkout.
                </p>
              </div>
            )}

            <div className="p-6 rounded-3xl border bg-white/80 border-brand-lavender-mid text-brand-text">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-10 rounded-xl flex items-center justify-center bg-brand-lavender">
                  <CreditCard className="w-6 h-6 text-brand-violet" />
                </div>
                <span className="bg-brand-violet text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md">
                  Stripe
                </span>
              </div>
              <h3 className="font-display font-bold text-lg text-brand-text">Card Payment</h3>
              <p className="font-body text-brand-muted text-sm mt-1">
                Pick a saved card or add a new one from the cart, then complete payment on Stripe Checkout.
              </p>
              <Link
                href="/cart"
                className="mt-4 inline-flex items-center gap-2 text-brand-violet font-display font-bold text-xs uppercase tracking-wider"
              >
                Go to checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl border bg-white/80 border-brand-lavender-mid text-brand-text">
              <div className="w-12 h-10 rounded-xl flex items-center justify-center bg-brand-lavender mb-4">
                <Banknote className="w-6 h-6 text-brand-violet" />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-text">Cash on Delivery</h3>
              <p className="font-body text-brand-muted text-sm mt-1">
                Prefer to pay when your food arrives? Choose Cash on Delivery directly in the cart checkout.
              </p>
              <Link
                href="/cart"
                className="mt-4 inline-flex items-center gap-2 text-brand-violet font-display font-bold text-xs uppercase tracking-wider"
              >
                Go to checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <h3 className="font-display font-bold text-brand-text text-xl mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-violet" /> Security
              </h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-text text-sm mb-1">PCI DSS Compliant</h4>
                    <p className="font-body text-brand-muted text-xs">
                      Full card numbers and CVC never touch our servers — Stripe vaults your cards.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
