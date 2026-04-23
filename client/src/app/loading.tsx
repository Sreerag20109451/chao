"use client";

import React from "react";
import { UtensilsCrossed } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-lavender-gradient">
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 -m-4 rounded-full border-2 border-dashed border-brand-violet/20 animate-[spin_10s_linear_infinite]" />
        
        {/* Inner pulsing container */}
        <div className="relative bg-white p-8 rounded-full shadow-violet-glow border border-brand-lavender-mid animate-pulse">
          <UtensilsCrossed className="w-12 h-12 text-brand-violet" strokeWidth={2.5} />
        </div>
        
        {/* Floating sparkles/bubbles */}
        <div className="absolute top-0 right-0 w-3 h-3 bg-brand-amber rounded-full animate-bounce delay-100" />
        <div className="absolute bottom-2 -left-2 w-2 h-2 bg-brand-violet rounded-full animate-bounce delay-300" />
      </div>

      <div className="mt-8 flex flex-col items-center">
        <h2 className="font-display font-bold text-4xl text-brand-text tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Chao<span className="text-brand-violet">.</span>
        </h2>
        <div className="mt-3 flex gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-violet/40 animate-bounce [animation-delay:-0.3s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-violet/40 animate-bounce [animation-delay:-0.15s]" />
          <div className="w-1.5 h-1.5 rounded-full bg-brand-violet/40 animate-bounce" />
        </div>
      </div>
      
      <p className="mt-6 font-body text-brand-muted text-sm uppercase tracking-[0.2em] animate-pulse">
        Preparing something delicious
      </p>
    </div>
  );
}
