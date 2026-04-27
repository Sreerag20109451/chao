"use client";

/**
 * LandingPage.tsx — Public home shown when no admin is logged in.
 * Showcases the admin product with a CTA to login or register.
 */

import React from "react";
import { Link } from "react-router-dom";
import Image from "next/image";
import { UtensilsCrossed, LayoutDashboard, ShoppingBag, BarChart3, Zap, ArrowRight, Star } from "lucide-react";

const features = [
  { icon: <LayoutDashboard className="w-6 h-6" />, title: "Live Dashboard", desc: "Real-time revenue, order counts and table-turn metrics at a glance." },
  { icon: <ShoppingBag className="w-6 h-6" />, title: "Order Management", desc: "Accept, track and fulfil every order with one click — no missed tickets." },
  { icon: <BarChart3 className="w-6 h-6" />, title: "Menu Control", desc: "Toggle availability, update prices and manage protein & side options instantly." },
  { icon: <Zap className="w-6 h-6" />, title: "Store Toggle", desc: "Open or close your restaurant for online orders in a single switch." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-sidebar text-white overflow-hidden relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-brand-violet/22 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-brand-violet/12 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-brand-amber/8 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-16 py-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm p-1">
            <Image 
              src="/logo.png" 
              alt="Chao Logo" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <span className="font-display font-bold text-xl tracking-wide">Chao Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-xl font-display font-bold text-sm text-white/80 hover:text-white hover:bg-white/5 transition-all"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl font-display font-bold text-sm bg-brand-violet text-white shadow-violet-glow hover:bg-brand-violet-dark transition-all"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-[11px] font-display font-bold uppercase tracking-widest text-brand-amber mb-8">
          <Star className="w-3 h-3 fill-current" /> Restaurant Control Centre
        </div>

        <h1 className="font-display font-bold text-5xl md:text-7xl leading-[1.08] tracking-tight max-w-3xl mx-auto">
          Run your restaurant
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-amber to-emerald-300">
            from one place.
          </span>
        </h1>

        <p className="mt-6 text-lg text-white/60 max-w-xl mx-auto font-body leading-relaxed">
          Chao Admin gives your team a powerful, beautiful control centre — manage the menu, watch orders roll in, and keep your kitchen in sync.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="group inline-flex items-center gap-2 bg-brand-violet text-white font-display font-bold text-sm px-8 py-4 rounded-2xl shadow-violet-glow hover:bg-brand-violet-dark transition-all"
          >
            Create your account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white font-display font-bold text-sm px-8 py-4 rounded-2xl hover:bg-white/10 transition-all"
          >
            Sign in to dashboard
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="relative z-10 px-6 md:px-16 pb-32">
        <div className="w-full max-w-[90rem] mx-auto px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-brand-violet/35 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-violet/20 flex items-center justify-center text-brand-amber mb-4 group-hover:bg-brand-violet/30 transition-all">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-white mb-1.5">{f.title}</h3>
              <p className="text-sm text-white/55 font-body leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
