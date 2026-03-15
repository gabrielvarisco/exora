import { cookieStorage, createStorage } from "wagmi";
import { mainnet, arbitrum, base, polygon, bsc } from "@reown/appkit/networks";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";

const envProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID;

if (!envProjectId) {
  throw new Error("NEXT_PUBLIC_REOWN_PROJECT_ID is missing");
}

export const projectId: string = envProjectId;

export const networks = [mainnet, arbitrum, base, polygon, bsc] as const;

export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks: [...networks],
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
});

export const config = wagmiAdapter.wagmiConfig;
