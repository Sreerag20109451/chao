import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { UtensilsCrossed, Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { validateEmail, validatePassword } from "@/lib/validators";
import { loginClient, signInWithGoogle } from "@/lib/firebase/auth/service";

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
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email address" }));
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setErrors(prev => ({ ...prev, password: pwError }));
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await loginClient(email, password);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.push("/");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      router.push("/");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Google login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 overflow-hidden relative">
      <div className="max-w-xl mx-auto px-6 relative z-10">
        <header className="text-center mb-16">
          <div className="pill-badge mx-auto mb-6 w-fit uppercase tracking-[0.1em]">
            <LogIn className="w-3.5 h-3.5 text-brand-amber" aria-hidden="true" /> Login
          </div>
          <h1 className="font-display font-bold text-brand-text text-5xl md:text-6xl tracking-tight mb-4">
            Welcome <span className="text-brand-violet">Back</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg">Sign in to your account to manage your orders.</p>
        </header>

        <ScrollReveal animation="fade-up" className="space-y-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="client-login-email" className="block text-sm font-display font-semibold text-brand-text mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" aria-hidden="true" />
                <input id="client-login-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "client-login-email-error" : undefined} className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-brand-lavender-mid'} rounded-xl py-3.5 pl-12 pr-4 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20`} />
              </div>
              {errors.email && <p id="client-login-email-error" className="text-xs text-red-600 mt-1 ml-2 font-body">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="client-login-password" className="block text-sm font-display font-semibold text-brand-text mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted/50" aria-hidden="true" />
                <input id="client-login-password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "client-login-password-error" : undefined} className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-brand-lavender-mid'} rounded-xl py-3.5 pl-12 pr-12 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}</button>
              </div>
              {errors.password && <p id="client-login-password-error" className="text-xs text-red-600 mt-1 ml-2 font-body leading-tight">{errors.password}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-brand-violet text-white font-display font-bold rounded-xl py-4 shadow-violet-glow disabled:opacity-70">
              {isSubmitting ? "Signing in..." : <div className="flex items-center justify-center gap-2">Sign In <UtensilsCrossed className="w-4 h-4" aria-hidden="true" /></div>}
            </button>
          </form>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-lavender-mid"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-lavender-gradient px-4 text-brand-muted font-display font-bold">Or continue with</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-brand-lavender-mid text-brand-text font-display font-bold rounded-xl py-3.5 hover:bg-brand-lavender/10 transition-all shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-brand-muted font-body text-sm mt-8">
            Don&apos;t have an account? <Link href="/register" className="text-brand-violet font-display font-bold hover:underline">Create account</Link>
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
