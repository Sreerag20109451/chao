import type { AppProps } from "next/app";
import { Bai_Jamjuree, Noto_Serif_Thai, Sarabun } from "next/font/google";
import "@/styles/globals.css";
import { ReduxProvider } from "@/components/ReduxProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Head from "next/head";

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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ReduxProvider>
      <div className={`${baiJamjuree.variable} ${notoSerifThai.variable} ${sarabun.variable} min-h-screen flex flex-col antialiased bg-lavender-gradient`}>
        <Head>
          <title>Chao | Waterford's Finest Authentic Thai Restaurant & Takeaway</title>
          <meta name="description" content="Experience Waterford's best authentic Thai food. Fresh, healthy, and traditionally crafted Thai cuisine. Order Thai takeaway or dine-in in Waterford City center." />
          <meta name="keywords" content="Thai Restaurant Waterford, Authentic Thai food Waterford, Authentic Thai Cuisine Ireland, Best Thai Curry Waterford, Thai Takeaway Waterford City, Thai Dining Waterford" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Navbar />
        <main className="flex-1">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </ReduxProvider>
  );
}
