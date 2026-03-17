export type SupportedChainKey = "base" | "ethereum" | "bsc";

export type SupportedChain = {
  key: SupportedChainKey;
  label: string;
  chainId: number;
  zeroExChainId: number;
  nativeSymbol: string;
};

export const SUPPORTED_CHAINS: SupportedChain[] = [
  {
    key: "base",
    label: "Base",
    chainId: 8453,
    zeroExChainId: 8453,
    nativeSymbol: "ETH",
  },
  {
    key: "ethereum",
    label: "Ethereum",
    chainId: 1,
    zeroExChainId: 1,
    nativeSymbol: "ETH",
  },
  {
    key: "bsc",
    label: "BNB Chain",
    chainId: 56,
    zeroExChainId: 56,
    nativeSymbol: "BNB",
  },
];

export function getSupportedChainsFromEnv(): SupportedChain[] {
  const raw = process.env.NEXT_PUBLIC_SUPPORTED_CHAINS ?? "base,ethereum,bsc";
  const keys = raw.split(",").map((item) => item.trim().toLowerCase());

  return SUPPORTED_CHAINS.filter((chain) => keys.includes(chain.key));
}

export function getDefaultChainKey(): SupportedChainKey {
  const envValue = (process.env.NEXT_PUBLIC_DEFAULT_CHAIN ?? "base").toLowerCase();

  if (envValue === "ethereum" || envValue === "bsc" || envValue === "base") {
    return envValue;
  }

  return "base";
}

export function getChainByKey(key: string): SupportedChain | undefined {
  return SUPPORTED_CHAINS.find((chain) => chain.key === key);
}

export function getChainById(chainId?: number): SupportedChain | undefined {
  if (!chainId) return undefined;
  return SUPPORTED_CHAINS.find((chain) => chain.chainId === chainId);
}
