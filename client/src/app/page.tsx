"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { setOrderType } from "@/lib/features/cartSlice";

const featuredItems = menuItems
  .filter((item) => item.tags.includes("chef-pick"))
  .slice(0, 3);

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
  const dispatch = useDispatch();
  const orderType = useSelector((state: RootState) => state.cart.orderType);

  const handleOrderTypeChange = (type: "delivery" | "collection") => {
    dispatch(setOrderType(type));
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="animate-in fade-in slide-in-from-left-10 duration-700">
            <div className="pill-badge mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-amber" />
              Welcome back, {user?.name.split(' ')[0]}
            </div>
            <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight mb-4">
              What are we <span className="text-brand-violet">eating today?</span>
            </h1>

            <div className="inline-flex p-1 bg-white border border-brand-lavender-mid rounded-2xl shadow-sm">
              <button 
                onClick={() => handleOrderTypeChange("delivery")}
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
                onClick={() => handleOrderTypeChange("collection")}
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
          </aside>

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
          </main>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (isAuthenticated) {
    return <LoggedInHome user={user} />;
  }

  return (
    <>
      <section className="min-h-[85vh] flex items-center pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply select-none">
          <Image src="/images/thai_green_curry_1776894985468.png" alt="Green Curry" width={400} height={400} className="absolute -top-20 -left-20 animate-[spin_60s_linear_infinite]" />
          <Image src="/images/thai_red_curry_1776895006227.png" alt="Red Curry" width={450} height={450} className="absolute top-40 -right-32 animate-[spin_80s_linear_infinite_reverse]" />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h1 className="font-display font-bold text-brand-text text-5xl sm:text-6xl md:text-7xl tracking-tight mb-6 animate-in fade-in slide-in-from-top-10 duration-1000">
            Taste the Heart of <span className="text-brand-violet">Thailand</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-top-8 duration-1000 delay-200 fill-mode-both">
            Experience the vibrant flavours of authentic Thai cuisine, crafted fresh every day in the heart of Waterford City.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-top-6 duration-1000 delay-400 fill-mode-both">
            <Link href="/login" className="bg-brand-violet text-white px-8 h-12 rounded-full flex items-center font-display font-bold shadow-violet-glow hover:bg-brand-violet-dark transition-all">
              Get Started <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
            <Link href="/menu" className="border border-brand-lavender-mid bg-white px-8 h-12 rounded-full flex items-center font-display font-bold text-brand-text hover:bg-brand-lavender transition-all">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/40 border-y border-brand-lavender-mid relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-brand-text text-3xl md:text-4xl mb-4">Why Choose Chao?</h2>
            <p className="font-body text-brand-muted">The secret to our authentic taste lies in our commitment to quality.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <ScrollReveal 
                key={feature.title} 
                animation="fade-up" 
                style={{ transitionDelay: `${i * 150}ms` }}
                className="bg-white p-8 rounded-3xl border border-brand-lavender-mid shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-display font-bold text-brand-text text-xl mb-3">{feature.title}</h3>
                <p className="font-body text-brand-muted text-sm leading-relaxed">{feature.body}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
