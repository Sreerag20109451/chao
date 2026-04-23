"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  CreditCard, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Star,
  CheckCircle2,
  Lock
} from "lucide-react";

export default function PaymentsPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20">
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
              <h2 className="font-display font-bold text-brand-text text-lg uppercase tracking-wider">Your Cards</h2>
              <button className="text-brand-violet font-display font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 p-2 rounded-lg hover:bg-brand-violet/5 transition-colors">
                <Plus className="w-4 h-4" /> Add New
              </button>
            </div>

            {user.paymentMethods.map((pm) => (
              <div key={pm.id} className={`p-6 rounded-3xl border relative overflow-hidden ${pm.isPrimary ? "bg-zinc-900 border-zinc-800 text-white shadow-2xl" : "bg-white/80 border-brand-lavender-mid text-brand-text"}`}>
                <div className="flex justify-between items-start mb-10">
                  <div className={`w-12 h-8 rounded-md flex items-center justify-center ${pm.isPrimary ? "bg-white/10" : "bg-brand-lavender"}`}><CreditCard className={`w-6 h-6 ${pm.isPrimary ? "text-white" : "text-brand-violet"}`} /></div>
                  {pm.isPrimary && <span className="bg-brand-violet text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-violet-glow">Primary</span>}
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <span className={`font-display font-bold text-lg leading-none ${pm.isPrimary ? "text-white" : "text-brand-text"}`}>**** **** **** {pm.last4}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span>{pm.type} Card</span>
                    <div className="flex gap-2">
                      {!pm.isPrimary && <button className="p-2 hover:bg-brand-violet/5 rounded-lg text-brand-muted hover:text-brand-violet"><Star className="w-4 h-4" /></button>}
                      <button className={`p-2 rounded-lg ${pm.isPrimary ? "hover:bg-white/10 text-white/40" : "hover:bg-red-50 text-brand-muted hover:text-red-500"}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
