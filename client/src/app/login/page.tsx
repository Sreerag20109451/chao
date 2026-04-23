"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/features/authSlice";
import { UtensilsCrossed, Eye, EyeOff, ArrowLeft, LogIn, Lock, Mail } from "lucide-react";

/**
 * ScrollReveal Wrapper (matching the Contact page)
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

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate successful login
    setTimeout(() => {
      dispatch(setCredentials({ 
        name: "Sreerag Sathian", 
        email: email 
      }));
      setIsSubmitting(false);
      router.push("/");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    console.log("Google login attempt");
  };

  return (
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20 overflow-hidden relative">


      <div className="max-w-xl mx-auto px-6 relative z-10">

        {/* ---- Header Section (Matching Contact Page) ---- */}
        <header className="text-center mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
          <div className="pill-badge mx-auto mb-6 w-fit uppercase tracking-[0.1em]">
            <LogIn className="w-3.5 h-3.5 text-brand-amber" />
            Login
          </div>
          <h1 className="font-display font-bold text-brand-text text-5xl md:text-6xl tracking-tight mb-4">
            Welcome <span className="text-brand-violet">Back</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg">
            Sign in to your account to manage your orders and preferences.
          </p>
        </header>

        {/* ---- Login Form (No card, no boundary) ---- */}
        <ScrollReveal animation="fade-up" className="space-y-8">
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-display font-semibold text-brand-text mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-brand-lavender-mid rounded-xl py-3.5 pl-12 pr-4 font-body text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-display font-semibold text-brand-text">Password</label>
                  <button type="button" className="text-xs font-display font-bold text-brand-violet hover:text-brand-violet-dark transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-brand-lavender-mid rounded-xl py-3.5 pl-12 pr-12 font-body text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-violet transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-all shadow-violet-glow disabled:opacity-70 mt-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <UtensilsCrossed className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-brand-lavender-mid"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-4 text-brand-muted/60 font-display font-bold">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 text-brand-text font-display font-semibold py-4 rounded-2xl border border-zinc-200 transition-all duration-200 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: "#4285F4" }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: "#34A853" }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  style={{ fill: "#FBBC05" }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  style={{ fill: "#EA4335" }}
                />
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-brand-muted font-body text-sm mt-8">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brand-violet font-display font-bold hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
