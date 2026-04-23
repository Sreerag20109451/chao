"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import MenuCard from "@/components/MenuCard";
import { menuItems } from "@/lib/menuData";
import { 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  Heart, 
  Menu as MenuIcon, 
  User, 
  ShoppingBag, 
  CreditCard, 
  Clock,
  ChevronRight,
  Bike,
  Store
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

/* Pull only chef's-pick items for the homepage preview */
const featuredItems = menuItems
  .filter((item) => item.tags.includes("chef-pick"))
  .slice(0, 3);

/* Feature highlights config */
const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-brand-violet" />,
    title: "Fresh Daily",
    body: "Every ingredient sourced fresh each morning from trusted local suppliers and specialist Thai importers.",
  },
  {
    icon: <Leaf className="w-6 h-6 text-brand-violet" />,
    title: "Authentically Thai",
    body: "Recipes handed down through generations, cooked with the herbs and spices that define true Thai cuisine.",
  },
  {
    icon: <Heart className="w-6 h-6 text-brand-violet" />,
    title: "Warm Hospitality",
    body: "We treat every guest like family. Our team is here to make your evening effortlessly memorable.",
  },
];

/**
 * ScrollReveal Wrapper
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

function LoggedInHome({ user }: { user: any }) {
  const [orderType, setOrderType] = useState<"delivery" | "collection">("delivery");

  return (
    <div className="min-h-screen bg-lavender-gradient pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* ---- Dashboard Header ---- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-10 duration-700">
            <div className="pill-badge mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
              Welcome back, {user?.name.split(' ')[0]}
            </div>
            <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight mb-4">
              What are we <span className="text-brand-violet">eating today?</span>
            </h1>

            {/* Delivery/Collection Toggle */}
            <div className="inline-flex p-1 bg-white border border-brand-lavender-mid rounded-2xl shadow-sm">
              <button 
                onClick={() => setOrderType("delivery")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all ${
                  orderType === "delivery" 
                    ? "bg-brand-violet text-white shadow-violet-glow" 
                    : "text-brand-muted hover:text-brand-violet"
                }`}
              >
                <Bike className="w-4 h-4" />
                Delivery
              </button>
              <button 
                onClick={() => setOrderType("collection")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-display font-bold transition-all ${
                  orderType === "collection" 
                    ? "bg-brand-violet text-white shadow-violet-glow" 
                    : "text-brand-muted hover:text-brand-violet"
                }`}
              >
                <Store className="w-4 h-4" />
                Collection
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-right-10 duration-700 delay-200 fill-mode-both">
            <Link href="/cart" className="flex items-center gap-2 bg-white border border-brand-lavender-mid px-5 py-2.5 rounded-2xl font-display font-bold text-brand-text hover:bg-brand-lavender transition-all">
              <ShoppingBag className="w-4 h-4 text-brand-violet" />
              View Cart
            </Link>
            <Link href="/menu" className="flex items-center gap-2 bg-brand-violet text-white px-6 py-2.5 rounded-2xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all">
              <MenuIcon className="w-4 h-4" />
              Full Menu
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          
          {/* ---- Sidebar: Account Links ---- */}
          <aside className="md:col-span-1 space-y-4">
            <ScrollReveal animation="fade-up" className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white/50 shadow-sm">
              <h2 className="font-display font-bold text-brand-text mb-6 px-2 uppercase text-xs tracking-[0.2em] opacity-50">Your Account</h2>
              <nav className="space-y-1">
                {[
                  { icon: <User className="w-4 h-4" />, label: "Profile Settings", href: "/profile" },
                  { icon: <Clock className="w-4 h-4" />, label: "Order History", href: "/orders" },
                  { icon: <CreditCard className="w-4 h-4" />, label: "Payment Methods", href: "/payments" },
                ].map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-brand-violet/5 hover:text-brand-violet transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-brand-violet/20 transition-all">
                        {link.icon}
                      </div>
                      <span className="font-display font-bold text-sm tracking-wide">{link.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </Link>
                ))}
              </nav>
            </ScrollReveal>

            {/* Quick Promo Card */}
            <ScrollReveal animation="fade-up" className="bg-brand-violet rounded-3xl p-6 text-white shadow-violet-glow delay-200">
              <h3 className="font-display font-bold text-lg mb-2">Member Perk!</h3>
              <p className="text-white/80 text-sm font-body leading-relaxed mb-4">
                You have <strong>250 Chao Points</strong>. That&apos;s enough for a free Thai Milk Tea!
              </p>
              <button className="w-full bg-white text-brand-violet font-display font-bold py-2 rounded-xl text-sm shadow-lg hover:bg-white/90 transition-all">
                Redeem Now
              </button>
            </ScrollReveal>
          </aside>

          {/* ---- Main: Menu Recommendations ---- */}
          <main className="md:col-span-2 lg:col-span-3 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="font-display font-bold text-brand-text text-2xl">Recommended for You</h2>
                <Link href="/menu" className="text-brand-violet text-sm font-bold hover:underline">See all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {menuItems.slice(0, 4).map((item, i) => (
                  <ScrollReveal 
                    key={item.id} 
                    animation="fade-up"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <MenuCard item={item} />
                  </ScrollReveal>
                ))}
              </div>
            </section>

            <section>
              <div className="bg-white/40 border border-brand-lavender-mid rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-10">
                <div className="w-32 h-32 bg-lavender-gradient rounded-full flex items-center justify-center text-6xl shadow-inner animate-pulse">
                  🥘
                </div>
                <div className="flex-1 text-center md:text-left space-y-2">
                  <h3 className="font-display font-bold text-brand-text text-2xl tracking-tight">Your usual order?</h3>
                  <p className="font-body text-brand-muted">
                    Based on your last visit: <strong>Chicken Pad Thai</strong> and <strong>Prawn Spring Rolls</strong>.
                  </p>
                </div>
                <button className="bg-brand-violet text-white px-10 py-4 rounded-2xl font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all active:scale-95">
                  Reorder
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <LoggedInHome user={user} />;
  }

  return (
    <>
      {/* ============================================================
          SECTION 1 — Hero
          ============================================================ */}
      <section className="bg-lavender-gradient min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply select-none">
          <Image
            src="/images/thai_green_curry_1776894985468.png"
            alt="Green Curry"
            width={400}
            height={400}
            className="absolute -top-20 -left-20 animate-[spin_60s_linear_infinite]"
          />
          <Image
            src="/images/thai_red_curry_1776895006227.png"
            alt="Red Curry"
            width={450}
            height={450}
            className="absolute top-40 -right-32 animate-[spin_80s_linear_infinite_reverse]"
          />
          <Image
            src="/images/thai_massaman_curry_1776895018978.png"
            alt="Massaman Curry"
            width={350}
            height={350}
            className="absolute -bottom-20 left-1/4 animate-[spin_70s_linear_infinite]"
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <div className="pill-badge mx-auto mb-6 w-fit animate-in fade-in zoom-in duration-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
            Now accepting orders online
          </div>

          <h1 className="font-display font-bold text-brand-text text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight mb-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-top-10 duration-1000">
            Taste the Heart of <span className="text-brand-violet">Thailand</span>.
          </h1>

          <p className="font-body text-brand-muted text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200 fill-mode-both">
            At <strong className="font-semibold text-brand-text">Chao</strong>, every dish is a journey.
            Bold aromatics, vibrant spices and the warmth of Thai hospitality.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in zoom-in-95 duration-700 delay-500 fill-mode-both">
            <Link
              href="/login"
              className="inline-flex items-center justify-center bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-semibold rounded-full px-8 shadow-violet-glow transition-all duration-200 h-12"
            >
              Get Started
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center border hover:bg-zinc-100 rounded-full px-8 font-display font-semibold border-brand-lavender-mid text-brand-text bg-white h-12"
            >
              <MenuIcon className="mr-2 w-4 h-4" />
              Browse the Menu
            </Link>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4 select-none animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-700 fill-mode-both">
            {["🍜", "🥭", "🌿", "🍛", "🥢", "🦆"].map((emoji, i) => (
              <div
                key={i}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl glass-card flex items-center justify-center text-3xl sm:text-4xl shadow-sm"
              >
                {emoji}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 2 — Features
          ============================================================ */}
      <section className="bg-white py-20 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <ScrollReveal 
                key={i} 
                className="h-full"
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <div className="p-8 h-full rounded-2xl bg-brand-lavender/30 border border-brand-lavender-mid flex flex-col items-center text-center gap-4 hover:shadow-lg transition-shadow duration-300">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                    {feature.icon}
                  </div>
                  <h3 className="font-display font-bold text-brand-text text-xl">{feature.title}</h3>
                  <p className="font-body text-brand-muted text-sm leading-relaxed">{feature.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 3 — Chef's Pick
          ============================================================ */}
      <section className="bg-lavender-gradient py-20">
        <ScrollReveal className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif-thai font-semibold text-brand-text text-3xl md:text-4xl mb-3">
              Chef&apos;s Favourites
            </h2>
            <p className="font-body text-brand-muted text-base max-w-xl mx-auto">
              Dishes our kitchen is proudest of — each one a signature of Chao.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map((item, i) => (
              <div key={item.id} className="animate-in fade-in zoom-in-95 duration-700" style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'both' }}>
                <MenuCard item={item} />
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center border rounded-full px-8 font-display font-semibold border-brand-violet text-brand-violet hover:bg-brand-lavender bg-white h-12"
            >
              View Full Menu
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* ============================================================
          SECTION 5 — Reservation CTA
          ============================================================ */}
      <section className="bg-brand-violet py-20">
        <ScrollReveal animation="scale-in" className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="font-display font-bold text-white text-3xl md:text-4xl">
            Ready to experience Chao?
          </h2>
          <p className="font-body text-white/80 text-lg max-w-xl mx-auto">
            Access your member portal. We look forward to welcoming you.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-white text-brand-violet hover:bg-white/90 font-display font-bold rounded-full px-10 shadow-lg h-12"
          >
            Login
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </ScrollReveal>
      </section>
    </>
  );
}
