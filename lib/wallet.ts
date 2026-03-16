import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, bsc, mainnet, polygon } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo-project-id";

export const walletConfig = getDefaultConfig({
  appName: "Exora",
  projectId,
  chains: [mainnet, base, arbitrum, polygon, bsc],
  ssr: true
});
