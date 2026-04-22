import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TelegramProvider } from "@/components/TelegramProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FOMOBanner from "@/components/FOMOBanner";
import { IncentiveModal } from "@/components/IncentiveModal";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DOPAHOUSE | The Premier Web3 Casino & Liquidity Hub",
  description: "Play Provably Fair games or launch your own house. Join the next-generation GambleFi ecosystem powered by Chainlink VRF.",
  keywords: ["DOPAHOUSE", "Web3 Casino", "GambleFi", "Provably Fair", "Decentralized Betting", "House Staking", "Chainlink VRF", "House Passive Income"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dopahouse.xyz'),
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DOPAHOUSE - Play the House. Be the House.",
    description: "The decentralized gaming hub where you can play or own the liquidity. Full transparency, zero counterparty risk.",
    url: "https://dopahouse.xyz",
    siteName: "DOPAHOUSE",
    images: [
      {
        url: "https://dopahouse.xyz/og-image.png",
        width: 1200,
        height: 630,
        alt: "DOPAHOUSE - The Web3 Casino Ecosystem",
      },
      {
        url: "https://dopahouse.xyz/wechat-icon.png",
        width: 300,
        height: 300,
        alt: "DOPAHOUSE WeChat Thumbnail",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOPAHOUSE - The Future of Decentralized Betting",
    description: "Play against the House or launch your own casino. Fully decentralized and automated.",
    images: ["https://dopahouse.xyz/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="afterInteractive"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-slate-50 overflow-x-hidden w-full max-w-full`}
      >
        <Providers>
          <TelegramProvider>
            <div className="flex flex-col min-h-screen">
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: '#18181b', // zinc-900
                    color: '#fff',
                    border: '1px solid #27272a' // zinc-800
                  }
                }}
              />
              <Navbar />
              <FOMOBanner />
              <IncentiveModal />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </TelegramProvider>
        </Providers>
      </body>
    </html>
  );
}
