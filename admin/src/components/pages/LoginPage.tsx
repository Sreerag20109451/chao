"use client";

/**
 * LoginPage.tsx — Admin sign-in form.
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Image from "next/image";
import { UtensilsCrossed, Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { toast } from "sonner";

import { validateEmail, validatePassword } from "@/lib/validators";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: "Invalid email address" }));
      return;
    }

    const pwError = validatePassword(password);
    if (pwError) {
      setErrors(prev => ({ ...prev, password: pwError }));
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sidebar flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-brand-violet/25 blur-[100px]" />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full bg-brand-amber/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-28 h-28 rounded-xl bg-transparent flex items-center justify-center shadow-none group-hover:scale-105 transition-transform overflow-hidden">
              <Image 
                src="/pnglogo.png"
                alt="Chao Logo" 
                width={80} 
                height={80} 
                className="object-cover"
              />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">Chao Admin</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-3xl p-8 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Welcome back</h1>
            <p className="text-sm text-white/55 font-body">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-bold text-white/65 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@chaothai.co"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/35 rounded-xl pl-11 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/50 focus:border-brand-violet/40 transition-all"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1 font-body">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-bold text-white/65 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder-white/35 rounded-xl pl-11 pr-11 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/50 focus:border-brand-violet/40 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1 font-body leading-tight">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-violet text-white font-display font-bold text-sm py-3.5 rounded-xl shadow-violet-glow hover:bg-brand-violet-dark disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/50 font-body">
            Don't have an account?{" "}
            <Link to="/register" className="text-brand-amber font-bold hover:text-brand-amber/90 transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-white/35 font-body">
          Chao Admin · Restaurant Management System
        </p>
      </div>
    </div>
  );
}
