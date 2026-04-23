"use client";

/**
 * Sidebar.tsx — Admin App
 *
 * Left navigation sidebar using shadcn's new Sidebar component.
 * Uses the dark violet palette from our CSS variables to contrast strongly
 * with the lavender main content area.
 */

import { Link, useLocation } from "react-router-dom";
import Image from "next/image";
import { LayoutDashboard, Receipt, Utensils as MenuIcon, ShoppingBag, Settings, LogOut, UtensilsCrossed, Bike, Tag } from "lucide-react";
import { useAuth } from "@/lib/authContext";
// Admin is an SPA inside Next.js, we can use <img> for simplicity in the React Router context if needed, 
// but Next.js /public is available.

const links = [
  { href: "/",         label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/billing",   label: "Billing/POS",icon: <Receipt className="w-5 h-5" /> },
  { href: "/menu",     label: "Menu Items", icon: <MenuIcon className="w-5 h-5" /> },
  { href: "/deals",    label: "Deals",      icon: <Tag className="w-5 h-5" /> },
  { href: "/orders",   label: "Orders",     icon: <ShoppingBag className="w-5 h-5" /> },
  { href: "/drivers",  label: "Drivers",    icon: <Bike className="w-5 h-5" /> },
  { href: "/settings", label: "Settings",   icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const { logout, user, userRole } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <aside className="w-64 bg-[hsl(240_15%_8%)] text-[hsl(252_40%_88%)] h-screen sticky top-0 flex flex-col border-r border-[hsl(240_12%_16%)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[hsl(240_12%_16%)]">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm border border-[hsl(240_12%_16%)] flex items-center justify-center p-1">
            <Image 
              src="/logo.png" 
              alt="Chao Logo" 
              width={24} 
              height={24} 
              className="object-contain"
            />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-wide">
            Chao Admin
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              to={href}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm transition-all",
                isActive
                  ? "bg-[hsl(250_78%_60%)] text-white shadow-violet-glow"
                  : "hover:bg-[hsl(240_12%_14%)] hover:text-white",
              ].join(" ")}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-[hsl(240_12%_16%)] space-y-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm text-[hsl(252_40%_88%)] hover:bg-[hsl(0_72%_51%)/0.1] hover:text-[hsl(0_72%_51%)] transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          Log out
        </button>
        
        <div className="px-3 py-3 bg-[hsl(240_12%_14%)] rounded-xl border border-[hsl(240_12%_18%)] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(252_40%_50%)]">Status</span>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {userRole || 'No Role'}
            </span>
          </div>
          <p className="text-[9px] font-mono text-[hsl(252_20%_40%)] truncate">ID: {user?.uid.slice(0, 12)}...</p>
        </div>
        
        <div className="px-3 py-2 text-[10px] font-display text-[hsl(252_40%_60%)] leading-tight">
          Developed by{" "}
          <a 
            href="https://www.linkedin.com/in/sreerag-sathian-212305189/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[hsl(250_78%_60%)] font-bold hover:underline"
          >
            Sreerag Sathian
          </a>
        </div>
      </div>
    </aside>
  );
}
