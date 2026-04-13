import { APP_CONFIG } from "@/configs/app";
import ShutdownView from "@/components/ShutdownView";
import type { Metadata } from "next";
import { Funnel_Display, Inter } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: (APP_CONFIG.network === "mainnet") ? "Escher App" : "Testnet Escher App",
  description: "Escher: Staking Made Limitless",
  openGraph: {
    title: APP_CONFIG.network === "mainnet" ? "Escher App" : "Testnet Escher App",
    description: "Escher: Staking Made Limitless",
    images: [
      {
        url: "/images/metatags-1.jpg",
        width: 1024,
        height: 536,
        alt: "Escher App",
      },
    ],
  },
};

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ['latin']
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={`${inter.variable} ${funnelDisplay.variable} font-inter antialiased`}>
        <ShutdownView />
      </body>
    </html>
  );
}
