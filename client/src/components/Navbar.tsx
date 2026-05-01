import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import { Menu, X, ShoppingCart, User, LogOut } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { logout } from "@/lib/features/authSlice";
import { logoutUser } from "@/lib/firebase";
import ClientNotificationBar from "@/components/ClientNotificationBar";

const navLinks = [
  { href: "/menu",    label: "Menu" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = router.pathname;
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (href: string) => {
    setMobileOpen(false);
    if (pathname !== href) {
      void router.push(href);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      dispatch(logout());
      router.push("/");
      setMobileOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950 border-b border-white/10 shadow-2xl py-1"
          : "bg-transparent border-b border-transparent py-2"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* ---- Brand / Logo ---- */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="flex items-center transition-transform hover:scale-105 active:scale-95"
          >
            <div className="relative w-28 h-28 rounded-xl overflow-hidden transition-all bg-transparent border border-transparent shadow-none">
              <Image 
                src="/pnglogo.png"
                alt="Chao Logo" 
                fill 
                sizes="112px"
                className="object-cover"
              />
            </div>
          </Link>
        </div>

        {/* ---- Desktop links ---- */}
        <ul className="hidden md:flex items-center justify-center gap-8 flex-none">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <button
                type="button"
                onClick={() => handleNavigate(href)}
                aria-current={pathname === href ? "page" : undefined}
                className={`nav-link-hover font-display text-sm font-medium tracking-wide transition-colors ${
                  pathname === href
                    ? "text-brand-violet"
                    : scrolled
                      ? "text-zinc-400 hover:text-white"
                      : "text-brand-text hover:text-brand-violet"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        {/* ---- Right Side: Desktop CTA & Mobile Hamburger ---- */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && (
              <ClientNotificationBar scrolled={scrolled} />
            )}

            {isAuthenticated && (
              <Link
                href="/cart"
                className={`relative p-2 transition-colors ${
                  scrolled ? "text-zinc-400 hover:text-white" : "text-brand-text hover:text-brand-violet"
                }`}
                aria-label="View Cart"
              >
                <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-violet text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-violet-glow animate-in zoom-in duration-200" aria-label={`${itemCount} items in cart`}>
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:shadow-md active:scale-95 ${
                    scrolled 
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10" 
                      : "bg-brand-lavender border-brand-lavender-mid text-brand-text hover:bg-brand-lavender-mid"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-brand-violet/20 flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-brand-violet" aria-hidden="true" />
                  </div>
                  <span className="font-display text-sm font-medium">
                    Welcome, <span className="font-bold">{user?.name.split(' ')[0]}</span>
                  </span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`p-2 rounded-full border transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 ${
                    scrolled 
                      ? "bg-white/5 border-white/10 text-zinc-400" 
                      : "bg-white border-brand-lavender-mid text-brand-muted"
                  }`}
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              pathname !== "/login" && pathname !== "/register" && (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-semibold rounded-full px-5 py-2 text-sm shadow-violet-glow transition-all duration-200 group"
                >
                  Login
                </Link>
              )
            )}
          </div>

          {/* ---- Mobile hamburger ---- */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className={`md:hidden inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                scrolled
                  ? "text-white hover:bg-white/10"
                  : "text-brand-text hover:bg-brand-lavender"
              }`} aria-label="Open menu">
              <Menu className="w-5 h-5" aria-hidden="true" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72 bg-brand-lavender border-l border-border">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-transparent shadow-none border border-transparent">
                    <Image src="/pnglogo.png" alt="Chao Logo" fill sizes="96px" className="object-cover" />
                  </div>
                </div>
                <button
                  className="inline-flex items-center justify-center p-2 text-brand-text hover:bg-brand-lavender-mid rounded-lg transition-colors"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <ul className="flex flex-col gap-2">
                {navLinks.map(({ href, label }) => (
                  <li key={href}>
                    <button
                      type="button"
                      onClick={() => handleNavigate(href)}
                      aria-current={pathname === href ? "page" : undefined}
                      className={`block w-full text-left px-4 py-3 rounded-xl font-display font-medium transition-colors ${
                        pathname === href
                          ? "bg-brand-violet text-white"
                          : "text-brand-text hover:bg-brand-lavender-mid"
                      }`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/cart"
                      onClick={() => setMobileOpen(false)}
                      aria-current={pathname === "/cart" ? "page" : undefined}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl font-display font-medium transition-colors ${
                        pathname === "/cart"
                          ? "bg-brand-violet text-white"
                          : "text-brand-text hover:bg-brand-lavender-mid"
                      }`}
                    >
                      <span>Cart</span>
                      {itemCount > 0 && (
                        <span className="bg-brand-violet text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full" aria-label={`${itemCount} items in cart`}>
                          {itemCount}
                        </span>
                      )}
                    </Link>
                  </li>
                )}
              </ul>

              {isAuthenticated ? (
                <div className="space-y-6">
                  <Link 
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    aria-current={pathname === "/profile" ? "page" : undefined}
                    className="flex items-center gap-3 px-4 py-4 rounded-2xl bg-brand-violet/5 border border-brand-violet/10 hover:bg-brand-violet/10 transition-all active:scale-95"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand-violet/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-violet" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="font-display text-xs font-bold text-brand-violet uppercase tracking-wider">Account Settings</p>
                      <p className="font-display text-lg font-bold text-brand-text leading-none mt-1">
                        {user?.name}
                      </p>
                    </div>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 w-full p-4 rounded-2xl bg-red-50 text-red-600 font-display font-bold hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign Out
                  </button>
                </div>
              ) : (
                pathname !== "/login" && pathname !== "/register" && (
                  <div className="mt-6 mb-8">
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center justify-center gap-3 w-full bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-semibold rounded-full py-4 shadow-violet-glow group"
                    >
                      Login to Your Account
                    </Link>
                  </div>
                )
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
