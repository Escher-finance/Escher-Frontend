import AppLayout from "@/components/global/appLayout";
import WalletModal from "@/components/modal/walletModal/walletModal";
import { EscherProvider } from "@/components/providers/escherProvider";
import { ThemeProvider } from "@/components/providers/themeProvider";
import { APP_CONFIG } from "@/configs/app";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Funnel_Display, Inter } from "next/font/google";
import { Toaster } from "sonner";
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

  if (APP_CONFIG.isMaintenance) {
    return (
      <></>
    );
  }

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${funnelDisplay.variable} font-inter antialiased bg-white dark:bg-black min-h-screen`}
      >
        {/* {children} */}
        <ThemeProvider>
          <EscherProvider>
            <AppLayout>
              {children}
              <WalletModal />
            </AppLayout>
          </EscherProvider>
          <Toaster richColors />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
