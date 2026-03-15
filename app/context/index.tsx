"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { projectId, networks, wagmiAdapter, config } from "@/app/config";

const queryClient = new QueryClient();

const metadata = {
  name: "Exora",
  description: "DEX Execution Optimizer",
  url: "http://localhost:3000",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

createAppKit({
  adapters: [wagmiAdapter],
  projectId: projectId as string,
  networks: [...networks],
  defaultNetwork: networks[0],
  metadata,
  features: {
    analytics: false,
  },
});

export function AppKitProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
