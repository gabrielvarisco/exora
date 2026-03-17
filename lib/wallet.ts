import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, bsc, mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing");
}

export const walletConfig = getDefaultConfig({
  appName: "Exora",
  projectId,
  chains: [base, mainnet, bsc],
  ssr: true,
});
