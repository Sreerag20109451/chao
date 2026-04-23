/**
 * fonts.ts — Chao Thai Restaurant
 *
 * Three-font system:
 *  - Bai Jamjuree   : Display headings & menu item names (modern Thai branding)
 *  - Noto Serif Thai: Section headings (traditional elegance)
 *  - Sarabun        : Body copy — about text, descriptions, UI labels
 *
 * All fonts are loaded via next/font/google for:
 *   • Zero layout shift (no FOUT)
 *   • Self-hosted automatically by Next.js
 *   • Optimised subsets for our English-only content
 */

import { Bai_Jamjuree, Noto_Serif_Thai, Sarabun } from "next/font/google";

/* ---- Display / Hero headings & Item names ----
   Weights: 400 (regular labels), 600 (item names), 700 (hero headings) */
export const baijamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-bai-jamjuree",
  display: "swap",
});

/* ---- Section headings ----
   Noto Serif Thai: The serif weight lends traditional authority to H2/H3 sections.
   Weight 600 gives prominence without feeling heavy. */
export const notoSerifThai = Noto_Serif_Thai({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-noto-serif-thai",
  display: "swap",
});

/* ---- Body / About / Descriptions ----
   Sarabun: Exceptionally clean at small sizes; perfect for menu descriptions,
   "About Us" prose, and form labels. */
export const sarabun = Sarabun({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sarabun",
  display: "swap",
});
