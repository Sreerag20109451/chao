import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import MenuCard from "@/components/MenuCard";
import { MenuItem, Deal } from "@/lib/menuData";
import { listenToMenu } from "@/lib/firebase/menu/service";
import { listenToDeals } from "@/lib/firebase/deals/service";
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
  Store,
  MapPin
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { setOrderType } from "@/lib/features/cartSlice";
import { useStoreStatus } from "@/hooks/useStoreStatus";


const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-brand-violet" />,
    title: "Premium Ingredients",
    body: "We source the finest local produce and authentic Thai spices to ensure every dish meets our high standards of quality.",
  },
  {
    icon: <Leaf className="w-6 h-6 text-brand-violet" />,
    title: "Authentically Thai",
    body: "Waterford's most authentic Thai recipes, handed down through generations and cooked with fresh local ingredients.",
  },
  {
    icon: <Heart className="w-6 h-6 text-brand-violet" />,
    title: "Healthy & Fresh",
    body: "Wholesome, healthy Thai food prepared daily. No MSG, just pure natural herbs and vibrant Asian spices.",
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

function TodaysDeal({ deal }: { deal?: Deal }) {
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00" });

  useEffect(() => {
    if (!deal) return;
    
    const updateTime = () => {
      const end = new Date(deal.endDate);
      end.setHours(23, 59, 59, 999);
      const now = new Date();
      const diff = end.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft({ hours: "00", minutes: "00" });
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeLeft({
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0")
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [deal]);

  if (!deal) return null;

  return (
    <div className="relative overflow-hidden bg-brand-violet rounded-[2.5rem] p-8 md:p-10 shadow-violet-glow group">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-brand-amber/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-display font-bold text-white uppercase tracking-[0.2em]">
            <Sparkles className="w-3 h-3 text-brand-amber" /> Limited Time Offer
          </div>
          <h2 className="font-display font-bold text-white text-3xl md:text-4xl leading-tight">
            <span className="text-brand-amber">{deal.title}</span>.
          </h2>
          <p className="font-body text-brand-lavender/80 text-lg max-w-md">
            {deal.description}
          </p>
        </div>
        
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 text-center">
            <p className="text-brand-lavender text-xs uppercase font-display font-bold tracking-widest mb-1">Ends in</p>
            <div className="flex gap-4">
              <div className="text-center">
                <span className="block text-2xl font-display font-bold text-white">{timeLeft.hours}</span>
                <span className="text-[10px] text-brand-lavender/60 uppercase">Hrs</span>
              </div>
              <div className="text-brand-lavender/40 text-xl font-display">:</div>
              <div className="text-center">
                <span className="block text-2xl font-display font-bold text-white">{timeLeft.minutes}</span>
                <span className="text-[10px] text-brand-lavender/60 uppercase">Min</span>
              </div>
            </div>
          </div>
          <Link href="/menu" className="w-full bg-brand-amber hover:bg-brand-amber/90 text-brand-text px-8 py-3.5 rounded-2xl font-display font-bold transition-all shadow-lg active:scale-95 text-center">
            Claim This Deal
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoggedInHome({ user }: { user: any }) {
  const dispatch = useDispatch();
  const orderType = useSelector((state: RootState) => state.cart.orderType);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    const unsubscribeMenu = listenToMenu((data) => {
      // Filter out unavailable items for recommendations
      setItems(data.filter(item => item.available !== false));
    });
    const unsubscribeDeals = listenToDeals((data) => {
      setDeals(data);
    });
    return () => {
      unsubscribeMenu();
      unsubscribeDeals();
    };
  }, []);

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

          <main className="md:col-span-2 lg:col-span-3 space-y-10">
            {deals.length > 0 && (
              <ScrollReveal animation="fade-up">
                <TodaysDeal deal={deals[0]} />
              </ScrollReveal>
            )}

            <section>
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="font-display font-bold text-brand-text text-2xl">Recommended for You</h2>
                <Link href="/menu" className="text-brand-violet text-sm font-bold hover:underline">See all</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {items.slice(0, 4).map((item, i) => (
                  <ScrollReveal 
                    key={item.id} 
                    animation="fade-up"
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <MenuCard item={item} deals={deals} />
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
  const [deals, setDeals] = useState<Deal[]>([]);
  const { isOpen: isStoreOpen, isLoaded: isStatusLoaded, settings } = useStoreStatus();

  useEffect(() => {
    if (!isAuthenticated) {
      const unsubscribe = listenToDeals((data) => {
        setDeals(data);
      });
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <LoggedInHome user={user} />;
  }

  return (
    <>
      <section className="min-h-[85vh] flex items-center pt-24 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-multiply select-none">
          <Image
            src="/images/thai_green_curry_1776894985468.png"
            alt="Green Curry"
            width={400}
            height={400}
            sizes="(max-width: 768px) 70vw, 400px"
            className="absolute -top-20 -left-20 animate-[spin_60s_linear_infinite]"
          />
          <Image
            src="/images/thai_red_curry_1776895006227.png"
            alt="Red Curry"
            width={450}
            height={450}
            sizes="(max-width: 768px) 75vw, 450px"
            className="absolute top-40 -right-32 animate-[spin_80s_linear_infinite_reverse]"
          />
        </div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          {!isStoreOpen && isStatusLoaded && (
            <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl inline-block shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-sm md:text-base font-display font-bold text-red-600">Store is currently closed.</p>
              <p className="text-xs md:text-sm font-body text-red-500 mt-1">Please check back during our opening hours to place an order.</p>
            </div>
          )}
          <h1 className="font-display font-bold text-brand-text text-5xl sm:text-6xl md:text-7xl tracking-tight mb-6 animate-in fade-in slide-in-from-top-10 duration-1000">
            Waterford's Finest <span className="text-brand-violet">Authentic Thai</span>.
          </h1>
          <p className="font-body text-brand-muted text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-top-8 duration-1000 delay-200 fill-mode-both">
            Traditionally crafted Thai cuisine, made fresh daily with premium ingredients. Experience the heart of Thailand with Waterford's top-rated Thai takeaway and restaurant.
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

      {deals.length > 0 && (
        <section className="py-24 max-w-6xl mx-auto px-6 relative z-10">
          <ScrollReveal animation="fade-up">
            <TodaysDeal deal={deals[0]} />
          </ScrollReveal>
        </section>
      )}

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

      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="bg-zinc-950 rounded-[3.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-brand-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
              {/* Left: Delivery Areas */}
              <ScrollReveal animation="fade-up" className="space-y-8">
                <div>
                  <div className="pill-badge mb-6 bg-brand-violet/20 border-brand-violet/30 text-brand-violet">
                    <MapPin className="w-3.5 h-3.5" /> Delivery Coverage
                  </div>
                  <h2 className="font-display font-bold text-white text-3xl md:text-5xl tracking-tight leading-tight">
                    Our Delivery <span className="text-brand-violet">Areas</span>.
                  </h2>
                  <p className="font-body text-zinc-400 mt-4 text-lg">
                    Fast, fresh delivery within 45 minutes of ordering across Waterford.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {[
                    "Waterford City", "Ballybeg", "Ferrybank", "Hillview", 
                    "Bishops Field", "Dunmore Road", "Ardkeen", "Lismore", 
                    "Cork road", "Foxwood", "Gracedieu", "Kill Saint Lawrence"
                  ].map((area, i) => (
                    <span 
                      key={area} 
                      className="font-display text-sm font-bold text-zinc-400 flex items-center hover:text-white transition-colors cursor-default"
                    >
                      <MapPin className="w-3 h-3 mr-2 text-brand-violet opacity-60" />
                      {area}
                    </span>
                  ))}
                </div>
              </ScrollReveal>

              {/* Right: Opening Hours */}
              <ScrollReveal animation="fade-up" className="space-y-8">
                <div>
                  <div className="pill-badge mb-6 bg-brand-violet/20 border-brand-violet/30 text-brand-violet">
                    <Clock className="w-3.5 h-3.5" /> Opening Times
                  </div>
                  <h2 className="font-display font-bold text-white text-3xl md:text-5xl tracking-tight leading-tight">
                    When We're <span className="text-brand-violet">Open</span>.
                  </h2>
                </div>

                <div className="space-y-3">
                  {isStatusLoaded && settings?.openingHours ? (() => {
                    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
                    const dayMap: Record<string, string> = { 
                      mon: "Monday", tue: "Tuesday", wed: "Wednesday", 
                      thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" 
                    };
                    
                    const todayIndex = new Date().getDay();
                    const orderedKeys = [
                      ...dayKeys.slice(todayIndex),
                      ...dayKeys.slice(0, todayIndex)
                    ];

                    return orderedKeys.map((key, index) => {
                      const value = settings.openingHours[key];
                      const isToday = index === 0;
                      
                      return (
                        <div 
                          key={key} 
                          className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                            isToday 
                              ? "bg-brand-violet text-white shadow-violet-glow scale-105" 
                              : "bg-white/5 border border-white/5 text-zinc-300 hover:bg-white/10"
                          }`}
                        >
                          <span className="font-display font-bold text-sm">
                            {dayMap[key]}
                            {isToday && <span className="ml-2 text-[10px] uppercase bg-white/20 px-2 py-0.5 rounded-full">Today</span>}
                          </span>
                          <span className={`font-display font-bold text-sm ${isToday ? "text-white" : "text-brand-violet"}`}>
                            {value.closed ? "Closed" : `${value.open} - ${value.close}`}
                          </span>
                        </div>
                      );
                    });
                  })() : (
                    <div className="py-12 text-center text-zinc-500 italic">
                      Loading hours...
                    </div>
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
