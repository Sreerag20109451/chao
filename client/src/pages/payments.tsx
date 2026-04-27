import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  CreditCard, 
  ChevronLeft, 
  Banknote,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";

export default function PaymentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);

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
                Secure card payment is powered by Stripe Checkout. You will be redirected to Stripe to complete payment.
              </p>
              <Link href="/cart" className="mt-4 inline-flex items-center gap-2 text-brand-violet font-display font-bold text-xs uppercase tracking-wider">
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
              <Link href="/cart" className="mt-4 inline-flex items-center gap-2 text-brand-violet font-display font-bold text-xs uppercase tracking-wider">
                Go to checkout <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <h3 className="font-display font-bold text-brand-text text-xl mb-6 flex items-center gap-2"><Lock className="w-5 h-5 text-brand-violet" /> Security</h3>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
                  <div>
                    <h4 className="font-display font-bold text-brand-text text-sm mb-1">PCI DSS Compliant</h4>
                    <p className="font-body text-brand-muted text-xs">Your info is encrypted according to strict security standards.</p>
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
