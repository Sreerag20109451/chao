import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/lib/features/authSlice";
import { UtensilsCrossed, Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";

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
    <div ref={ref} style={style} className={`transition-all duration-1000 ease-out ${getAnimationClass()} ${className}`}>
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
    setTimeout(() => {
      dispatch(setCredentials({ name: "Sreerag Sathian", email }));
      setIsSubmitting(false);
      router.push("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-32 pb-20 overflow-hidden relative">
      <div className="max-w-xl mx-auto px-6 relative z-10">
        <header className="text-center mb-16">
          <div className="pill-badge mx-auto mb-6 w-fit uppercase tracking-[0.1em]">
            <LogIn className="w-3.5 h-3.5 text-brand-amber" /> Login
          </div>
          <h1 className="font-display font-bold text-brand-text text-5xl md:text-6xl tracking-tight mb-4">
            Welcome <span className="text-brand-violet">Back</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg">Sign in to your account to manage your orders.</p>
        </header>

        <ScrollReveal animation="fade-up" className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-display font-semibold text-brand-text mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="w-full bg-white border border-brand-lavender-mid rounded-xl py-3.5 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-display font-semibold text-brand-text mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border border-brand-lavender-mid rounded-xl py-3.5 pl-12 pr-12 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-violet text-white font-display font-bold rounded-xl py-4 shadow-violet-glow disabled:opacity-70">
              {isSubmitting ? "Signing in..." : <div className="flex items-center justify-center gap-2">Sign In <UtensilsCrossed className="w-4 h-4" /></div>}
            </button>
          </form>
          <p className="text-center text-brand-muted font-body text-sm mt-8">
            Don't have an account? <Link href="/register" className="text-brand-violet font-display font-bold hover:underline">Create account</Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
