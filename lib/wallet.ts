import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, arbitrum, base, polygon, bsc } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing");
}

export const walletConfig = getDefaultConfig({
  appName: "Exora",
  projectId,
  chains: [mainnet, arbitrum, base, polygon, bsc],
  ssr: true,
});
