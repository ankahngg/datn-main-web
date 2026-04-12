"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { rainbowKitConfig } from "@/config/config";
import { useState } from "react";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";

export function Providers({ children }: { children: React.ReactNode }) {
  // QueryClient must be created once on the client (can't be on server)
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={rainbowKitConfig}>
      <QueryClientProvider client={queryClient}>
         <RainbowKitProvider theme={darkTheme()}>
        {children}
         </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
