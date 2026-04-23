/**
 * fonts.ts — Admin App
 * Same font set as the client for brand consistency.
 * Bai Jamjuree: UI labels, headings, stats numbers.
 * Sarabun: Table data, descriptions, form inputs.
 */

import { Bai_Jamjuree, Sarabun } from "next/font/google";

/* Display — UI headings, stat numbers, nav labels */
export const baijamjuree = Bai_Jamjuree({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-bai-jamjuree",
  display: "swap",
});

/* Body — table data, form text, descriptions */
export const sarabun = Sarabun({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sarabun",
  display: "swap",
});
