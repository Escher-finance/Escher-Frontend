"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Defi from "./_sections/defi";
import Hero from "./_sections/hero";
import Hub from "./_sections/hub";
import LiquidTokens from "./_sections/liquid-tokens";
import Partners from "./_sections/partners";
import Security from "./_sections/security";

export default function Home() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Hero />
      <div className="flex flex-col bg-white z-10">
        <Hub />
        <LiquidTokens />
        <Partners />
        <Defi />
        <Security />
      </div>
    </QueryClientProvider>
  );
}
