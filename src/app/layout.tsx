import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { TelegramProvider } from "@/components/TelegramProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import FOMOBanner from "@/components/FOMOBanner";
import { Toaster } from "react-hot-toast";
import { ModalWrapper } from "@/components/ModalWrapper";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { MobileHeader } from "@/components/MobileHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "DOPAHOUSE | The Premier Web3 Casino & Liquidity Hub",
  description: "Play Provably Fair games or launch your own house. Join the next-generation GambleFi ecosystem powered by Chainlink VRF.",
  keywords: ["DOPAHOUSE", "Web3 Casino", "GambleFi", "Provably Fair", "Decentralized Betting", "House Staking", "Chainlink VRF", "House Passive Income"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://dopahouse.xyz'),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "DOPAHOUSE",
    // startupImage: [
    //   '/apple-touch-icon.png',
    // ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo.png',
        color: '#10b981',
      },
    ],
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
              <MobileHeader />
              <Navbar />
              <FOMOBanner />
              <ModalWrapper />
              <main className="flex-1 pb-20 md:pb-0">
                {children}
              </main>
              <MobileTabNavigation />
              <Footer />
            </div>
          </TelegramProvider>
        </Providers>
      </body>
    </html>
  );
}
