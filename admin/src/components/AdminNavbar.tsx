"use client";

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Menu, X, LayoutDashboard, Utensils, ShoppingBag, Settings, LogOut, User, Receipt, Tag, Bike } from "lucide-react";

import { useAuth } from "@/lib/authContext";

const navLinks = [
  { href: "/",         label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
  { href: "/billing",  label: "Billing/POS", icon: <Receipt className="w-4 h-4" /> },
  { href: "/menu",     label: "Menu",      icon: <Utensils className="w-4 h-4" /> },
  { href: "/deals",    label: "Deals",     icon: <Tag className="w-4 h-4" /> },
  { href: "/orders",   label: "Orders",    icon: <ShoppingBag className="w-4 h-4" /> },
  { href: "/drivers",  label: "Drivers",   icon: <Bike className="w-4 h-4" /> },
  { href: "/settings", label: "Settings",  icon: <Settings className="w-4 h-4" /> },
];

export default function AdminNavbar() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
      setScrolled(scrollPos > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-sidebar border-b border-sidebar-border shadow-lg py-3"
          : "bg-white/80 backdrop-blur-md border-b border-brand-lavender-mid py-4"
      }`}
    >
      <div className="w-full px-4 sm:px-6 md:px-8 flex items-center justify-between">
        {/* ---- Brand / Logo (Mobile Only) ---- */}
        <div className="flex-1 flex justify-start md:hidden">
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95"
          >
            <div className={`relative w-8 h-8 rounded-lg overflow-hidden shadow-sm transition-all bg-white ${scrolled ? "bg-white/10" : "border border-brand-lavender-mid"}`}>
              <Image 
                src="/logo.png" 
                alt="Chao Logo" 
                fill
                className="object-contain p-1"
              />
            </div>
            <span className={`font-display font-bold text-lg transition-colors ${
              scrolled ? "text-white" : "text-brand-text"
            }`}>
              Chao <span className="text-brand-violet">Admin</span>
            </span>
          </Link>
        </div>

        {/* Links are now in Sidebar for Desktop */}

        {/* ---- Right Side: Profile & Mobile Hamburger ---- */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
             <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border transition-all ${
                    scrolled 
                      ? "bg-white/5 border-white/10 text-white" 
                      : "bg-white border-brand-lavender-mid text-brand-text"
                  }`}>
                <div className="w-8 h-8 rounded-lg bg-brand-violet/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-violet" />
                </div>
                <div className="text-left leading-tight">
                    <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wider">Admin</p>
                    <p className="text-sm font-bold">{user?.name || "Admin"}</p>
                </div>
             </div>
             <button 
              onClick={logout}
              className={`p-2.5 rounded-xl border transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${
                    scrolled 
                      ? "bg-white/5 border-white/10 text-zinc-400" 
                      : "bg-white border-brand-lavender-mid text-brand-muted"
                  }`}>
                <LogOut className="w-4 h-4" />
             </button>
          </div>

          {/* ---- Mobile hamburger ---- */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger 
              className={`md:hidden inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-white hover:bg-white/10"
                  : "text-brand-text hover:bg-brand-lavender"
              }`}
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72 bg-brand-lavender border-l border-border p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-brand-lavender-mid">
                    <Image src="/logo.png" alt="Chao Logo" fill className="object-contain p-1" />
                  </div>
                  <span className="font-display font-bold text-xl text-brand-text">Chao Admin</span>
                </div>
              </div>

              <ul className="flex flex-col gap-2">
                {navLinks.map(({ href, label, icon }) => (
                  <li key={href}>
                    <Link
                      to={href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium transition-colors ${
                        location.pathname === href
                          ? "bg-brand-violet text-white shadow-violet-glow"
                          : "text-brand-text hover:bg-brand-lavender-mid"
                      }`}
                    >
                      {icon}
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8 border-t border-brand-lavender-mid">
                  <button 
                    onClick={logout}
                    className="flex items-center gap-3 w-full p-4 rounded-2xl bg-red-50 text-red-600 font-display font-bold hover:bg-red-100 transition-colors">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
