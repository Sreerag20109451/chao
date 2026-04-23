"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Mail, Phone, MapPin, Clock, Send, MessageSquare } from "lucide-react";

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-100 animate-pulse flex items-center justify-center">
      <MapPin className="w-8 h-8 text-zinc-400" />
    </div>
  )
});

/**
 * ScrollReveal Wrapper (copying the same logic for consistency)
 */
interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-up" | "scale-in";
  style?: React.CSSProperties;
}

function ScrollReveal({ children, className = "", animation = "fade-up", style = {} }: ScrollRevealProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return "opacity-0 translate-y-8";
    
    switch (animation) {
      case "fade-up": return "opacity-100 translate-y-0";
      case "scale-in": return "opacity-100 scale-100";
      default: return "opacity-100 translate-y-0";
    }
  };

  return (
    <div
      ref={ref}
      style={style}
      className={`transition-all duration-1000 ease-out ${getAnimationClass()} ${className}`}
    >
      {children}
    </div>
  );
}

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormState({ name: "", email: "", message: "" });
    }, 1500);
  };

  // Chao Thai Restaurant Coordinates (Sheela Palace Restaurant)
  const position: [number, number] = [52.262456, -7.116006];

  return (
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* ---- Header Section ---- */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="pill-badge mx-auto mb-6 w-fit">
            <MessageSquare className="w-3.5 h-3.5 text-brand-amber" />
            Contact Us
          </div>
          <h1 className="font-display font-bold text-brand-text text-5xl md:text-6xl tracking-tight mb-4">
            Let&apos;s Start a <span className="text-brand-violet">Conversation</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg max-w-2xl mx-auto">
            Whether you have a question about our menu, want to book a large event, or just want to say hello, we&apos;re here for you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* ---- Left: Contact Form ---- */}
          <ScrollReveal animation="fade-up" className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-white/50">
            <h2 className="font-display font-bold text-2xl text-brand-text mb-6">Send us a Message</h2>
            
            {isSuccess ? (
              <div className="bg-emerald-50 text-emerald-700 p-6 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-500">
                <p className="font-display font-bold text-lg mb-1">Message Sent!</p>
                <p className="text-sm">Thank you for reaching out. We&apos;ll get back to you as soon as possible.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 text-sm font-bold underline hover:opacity-80"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-display font-semibold text-brand-text mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-display font-semibold text-brand-text mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formState.email}
                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-display font-semibold text-brand-text mb-2">Message</label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={formState.message}
                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                    className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-violet-glow disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </ScrollReveal>

          {/* ---- Right: Contact Info ---- */}
          <div className="space-y-8">
            
            {/* Info Cards */}
            <ScrollReveal animation="fade-up" className="delay-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white/60 p-6 rounded-2xl border border-white/50 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-violet" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-brand-text mb-1 text-sm uppercase tracking-wider">Phone</p>
                    <a href="tel:+353894476628" className="font-body text-brand-text hover:text-brand-violet transition-colors">089 447 6628</a>
                  </div>
                </div>

                <div className="bg-white/60 p-6 rounded-2xl border border-white/50 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-violet/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-brand-violet" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-brand-text mb-1 text-sm uppercase tracking-wider">Email</p>
                    <a href="mailto:hello@chaothai.ie" className="font-body text-brand-text hover:text-brand-violet transition-colors">hello@chaothai.ie</a>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Address & Hours */}
            <ScrollReveal animation="fade-up" className="delay-400 bg-brand-violet text-white rounded-3xl p-8 shadow-xl">
              <div className="flex items-start gap-5 mb-8 pb-8 border-b border-white/10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-2">Find Us</h3>
                  <p className="font-body text-white/80 leading-relaxed">
                    8 O&apos;Connell St, Trinity Without<br />
                    Waterford City, X91 CH61
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl mb-4">Opening Hours</h3>
                  <ul className="space-y-2 text-white/80 font-body text-sm">
                    <li className="flex justify-between gap-4">
                      <span>Mon – Thu</span>
                      <span className="font-semibold text-white">12:00 PM – 10:00 PM</span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span>Fri – Sat</span>
                      <span className="font-semibold text-white">12:00 PM – 11:00 PM</span>
                    </li>
                    <li className="flex justify-between gap-4">
                      <span>Sunday</span>
                      <span className="font-semibold text-white">1:00 PM – 9:00 PM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>

            {/* Interactive Map */}
            <ScrollReveal animation="fade-up" className="delay-500 overflow-hidden rounded-3xl h-64 border-4 border-white shadow-lg relative z-0">
              <Map 
                center={position} 
                label="Chao Thai Restaurant" 
              />
            </ScrollReveal>

          </div>
        </div>
      </div>
    </div>
  );
}
