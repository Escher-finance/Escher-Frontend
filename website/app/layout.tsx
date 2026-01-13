import type { Metadata } from "next";
import { Funnel_Display, Inter } from "next/font/google";
import Footer from "./_sections/footer";
import Header from "./_sections/header";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: "Escher Finance",
  description: "Escher: Staking Made Limitless",
  openGraph: {
    title: "Escher Finance",
    description: "Escher: Staking Made Limitless",
    images: [
      {
        url: "/images/metatags.jpg",
        width: 1024,
        height: 536,
        alt: "Escher Finance",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased overscroll-none`}
      >
        <div className="flex flex-col">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
