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
    <div className="min-h-screen bg-[hsl(240_15%_7%)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[hsl(250_78%_60%/0.16)] blur-[100px]" />
        <div className="absolute bottom-0 -right-32 w-[400px] h-[400px] rounded-full bg-[hsl(280_78%_60%/0.10)] blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm p-1 group-hover:scale-105 transition-transform">
              <Image 
                src="/logo.png" 
                alt="Chao Logo" 
                width={28} 
                height={28} 
                className="object-contain"
              />
            </div>
            <span className="font-display font-bold text-xl text-white tracking-wide">Chao Admin</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white/[0.05] border border-white/[0.10] rounded-3xl p-8 backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-2xl text-white mb-2">Welcome back</h1>
            <p className="text-sm text-[hsl(252_20%_60%)] font-body">Sign in to your admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-bold text-[hsl(252_30%_70%)] uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(252_20%_50%)]" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@chaothai.co"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder-[hsl(252_20%_40%)] rounded-xl pl-11 pr-4 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[hsl(250_78%_60%/0.5)] focus:border-[hsl(250_78%_60%/0.4)] transition-all"
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-400 mt-1 font-body">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-bold text-[hsl(252_30%_70%)] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(252_20%_50%)]" />
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder-[hsl(252_20%_40%)] rounded-xl pl-11 pr-11 py-3 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[hsl(250_78%_60%/0.5)] focus:border-[hsl(250_78%_60%/0.4)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(252_20%_45%)] hover:text-white transition-colors"
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
              className="w-full mt-2 flex items-center justify-center gap-2 bg-[hsl(250_78%_60%)] text-white font-display font-bold text-sm py-3.5 rounded-xl shadow-violet-glow hover:bg-[hsl(250_78%_50%)] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[hsl(252_20%_50%)] font-body">
            Don't have an account?{" "}
            <Link to="/register" className="text-[hsl(250_78%_70%)] font-bold hover:text-[hsl(250_78%_80%)] transition-colors">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-[hsl(252_20%_35%)] font-body">
          Chao Admin · Restaurant Management System
        </p>
      </div>
    </div>
  );
}
