"use client";

/**
 * Sidebar.tsx — Admin App
 *
 * Left navigation sidebar using shadcn's new Sidebar component.
 * Dark sage sidebar; active link uses the same primary green as the client.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Receipt, Utensils as MenuIcon, ShoppingBag, Settings, LogOut, Bike, Tag, CreditCard, MessageSquare } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { subscribeToMessages } from "@/lib/firebase/messages/service";
// Admin is an SPA inside Next.js, we can use <img> for simplicity in the React Router context if needed, 
// but Next.js /public is available.

const links = [
  { href: "/",         label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/billing",   label: "Billing/POS",icon: <Receipt className="w-5 h-5" /> },
  { href: "/menu",     label: "Menu Items", icon: <MenuIcon className="w-5 h-5" /> },
  { href: "/deals",    label: "Deals",      icon: <Tag className="w-5 h-5" /> },
  { href: "/messages", label: "Messages",   icon: <MessageSquare className="w-5 h-5" /> },
  { href: "/orders",   label: "Orders",     icon: <ShoppingBag className="w-5 h-5" /> },
  { href: "/payments", label: "Payments",   icon: <CreditCard className="w-5 h-5" /> },
  { href: "/drivers",  label: "Drivers",    icon: <Bike className="w-5 h-5" /> },
  { href: "/settings", label: "Settings",   icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const { logout, user, userRole } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToMessages(
      (rows) => {
        setUnreadCount(rows.filter((msg) => !msg.read).length);
      },
      () => {
        // Keep nav stable even if message permissions are not yet deployed.
        setUnreadCount(0);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-screen sticky top-0 flex flex-col border-r border-sidebar-border">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
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
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm transition-all",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-violet-glow"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              ].join(" ")}
            >
              <span className="flex items-center gap-3">
                <span aria-hidden="true">{icon}</span>
                {label}
              </span>
              {href === "/messages" && unreadCount > 0 && (
                <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-black inline-flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-sidebar-border space-y-4">
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm text-sidebar-foreground/90 hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
        >
          <LogOut className="w-5 h-5" aria-hidden="true" />
          Log out
        </button>
        
        <div className="px-3 py-3 bg-sidebar-accent rounded-xl border border-sidebar-border space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/50">Status</span>
            <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${userRole === 'admin' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
              {userRole || 'No Role'}
            </span>
          </div>
          <p className="text-[9px] font-mono text-sidebar-foreground/45 truncate">ID: {user?.uid.slice(0, 12)}...</p>
        </div>
        
        <div className="px-3 py-2 text-[10px] font-display text-sidebar-foreground/55 leading-tight">
          Developed by{" "}
          <a 
            href="https://www.linkedin.com/in/sreerag-sathian-212305189/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sidebar-primary font-bold hover:underline"
          >
            Sreerag Sathian
          </a>
        </div>
      </div>
    </aside>
  );
}
