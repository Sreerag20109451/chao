import type { Metadata } from "next";
import { Bai_Jamjuree, Noto_Serif_Thai, Sarabun } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bai-jamjuree",
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-serif-thai",
});

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "Chao Thai Restaurant | Authentic Thai Cuisine in Waterford",
  description: "Experience the heart of Thailand with our authentic dishes, crafted fresh every day in the heart of Waterford City.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${baiJamjuree.variable} ${notoSerifThai.variable} ${sarabun.variable}`}>
      <body className="antialiased bg-lavender-gradient">
        <ReduxProvider>
          <div className="min-h-screen flex flex-col antialiased bg-lavender-gradient">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
