/**
 * Footer.tsx — Chao Thai Restaurant
 *
 * Three-column footer with brand info, quick links, and contact details.
 * Uses Bai Jamjuree for headings, Sarabun for body text.
 * Background: slightly deeper lavender to distinguish from page content.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, Camera, ThumbsUp } from "lucide-react";
import Image from "next/image";

export default function Footer() {
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
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-brand-lavender-mid border-t border-border overflow-hidden">
      <div 
        ref={ref}
        className={`max-w-6xl mx-auto px-6 py-16 transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* ---- Column 1: Brand ---- */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-brand-lavender-mid p-1.5">
                <Image src="/logo.png" alt="Chao Logo" width={32} height={32} sizes="32px" className="object-contain" />
              </div>
              <span className="font-display font-bold text-2xl text-brand-text tracking-tight">Chao</span>
            </div>
            <p className="font-body text-brand-muted text-sm leading-relaxed">
              Authentic Thai flavours crafted with love. Every dish tells a story rooted in
              Thailand&apos;s rich culinary heritage.
            </p>
          </div>

          {/* ---- Column 2: Quick Links ---- */}
          <div>
            <h3 className="font-display font-semibold text-brand-text mb-5 text-sm uppercase tracking-widest">
              Explore
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/",        label: "Home" },
                { href: "/menu",    label: "Our Menu" },
                { href: "/login",   label: "Login" },
                { href: "/contact", label: "Contact Us" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="font-body text-sm text-brand-muted hover:text-brand-violet transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- Column 3: Contact & Hours ---- */}
          <div>
            <h3 className="font-display font-semibold text-brand-text mb-5 text-sm uppercase tracking-widest">
              Visit Us
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-sm text-brand-muted">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-violet" />
                <span className="font-body leading-relaxed">
                  8 O&apos;Connell St, Trinity Without<br />Waterford, X91 CH61
                </span>
              </li>
              <li className="flex gap-3 text-sm text-brand-muted">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-brand-violet" />
                <a href="tel:+353894476628" className="font-body hover:text-brand-violet transition-colors">
                  089 447 6628
                </a>
              </li>
            </ul>
          </div>

          {/* ---- Column 4: The Developer ---- */}
          <div className="bg-white/40 p-6 rounded-3xl border border-white/60 shadow-sm">
            <h3 className="font-display font-semibold text-brand-text mb-4 text-xs uppercase tracking-[0.2em]">
              The Developer
            </h3>
            <p className="font-body text-xs text-brand-muted leading-relaxed mb-4">
              Crafted with precision by <strong>Sreerag Sathian</strong>. A dedicated developer passionate about creating premium digital experiences in Waterford.
            </p>
            <a 
              href="https://www.linkedin.com/in/sreerag-sathian-212305189/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-violet text-white rounded-xl font-display font-bold text-[10px] shadow-violet-glow hover:bg-brand-violet-dark transition-all active:scale-95"
            >
              Connect on LinkedIn
            </a>
          </div>
        </div>

        {/* ---- Bottom bar ---- */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs text-brand-muted">
            © {new Date().getFullYear()} Chao Thai Restaurant. All rights reserved.
          </p>
          <p className="font-body text-xs text-brand-muted">
            Built with ❤️ in Waterford
          </p>
        </div>
      </div>
    </footer>
  );
}
