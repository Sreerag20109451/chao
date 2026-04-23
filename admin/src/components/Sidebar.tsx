"use client";

/**
 * Sidebar.tsx — Admin App
 *
 * Left navigation sidebar using shadcn's new Sidebar component.
 * Uses the dark violet palette from our CSS variables to contrast strongly
 * with the lavender main content area.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UtensilsCrossed, LayoutDashboard, Menu as MenuIcon, ShoppingBag, Settings, LogOut } from "lucide-react";

const links = [
  { href: "/",         label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/menu",     label: "Menu Items", icon: <MenuIcon className="w-5 h-5" /> },
  { href: "/orders",   label: "Orders",     icon: <ShoppingBag className="w-5 h-5" /> },
  { href: "/settings", label: "Settings",   icon: <Settings className="w-5 h-5" /> },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[hsl(240_15%_8%)] text-[hsl(252_40%_88%)] h-screen sticky top-0 flex flex-col border-r border-[hsl(240_12%_16%)]">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-[hsl(240_12%_16%)]">
        <div className="flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-[hsl(250_78%_60%)]" strokeWidth={2.5} />
          <span className="font-display font-bold text-xl text-white tracking-wide">
            Chao Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
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
      <div className="p-4 border-t border-[hsl(240_12%_16%)]">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-display font-medium text-sm text-[hsl(252_40%_88%)] hover:bg-[hsl(0_72%_51%)/0.1] hover:text-[hsl(0_72%_51%)] transition-colors w-full">
          <LogOut className="w-5 h-5" />
          Log out
        </button>
      </div>
    </aside>
  );
}
