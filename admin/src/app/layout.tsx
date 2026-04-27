/**
 * layout.tsx — Admin Root Layout
 *
 * Wraps every admin page with the persistent sidebar.
 * Login page is the exception — it gets a full-screen centred layout.
 */

import type { Metadata } from "next";
import { baijamjuree, sarabun } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Chao Admin",
    template: "%s | Chao Admin",
  },
  description: "Admin dashboard for Chao Thai Restaurant.",
  /* Prevent search engine indexing of the admin panel */
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${baijamjuree.variable} ${sarabun.variable}`}
    >
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
