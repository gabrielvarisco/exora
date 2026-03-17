import type { SupportedChainKey } from "@/lib/chains";

export type TokenIcon = "eth" | "usdc" | "weth" | "bnb" | "wbnb" | "usdt";

export type TokenOption = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: TokenIcon;
};

export const NATIVE_TOKEN_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export const TOKENS_BY_CHAIN: Record<SupportedChainKey, TokenOption[]> = {
  base: [
    {
      symbol: "ETH",
      name: "Ether",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      icon: "eth",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0x833589fCD6EDB6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
      icon: "usdc",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
      icon: "weth",
    },
  ],
  ethereum: [
    {
      symbol: "ETH",
      name: "Ether",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      icon: "eth",
    },
    {
      symbol: "USDC",
      name: "USD Coin",
      address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      decimals: 6,
      icon: "usdc",
    },
    {
      symbol: "WETH",
      name: "Wrapped Ether",
      address: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",
      decimals: 18,
      icon: "weth",
    },
  ],
  bsc: [
    {
      symbol: "BNB",
      name: "BNB",
      address: NATIVE_TOKEN_ADDRESS,
      decimals: 18,
      icon: "bnb",
    },
    {
      symbol: "USDT",
      name: "Tether USD",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
      icon: "usdt",
    },
    {
      symbol: "WBNB",
      name: "Wrapped BNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
      icon: "wbnb",
    },
  ],
};

export function getTokensForChain(chain: SupportedChainKey): TokenOption[] {
  return TOKENS_BY_CHAIN[chain] ?? [];
}

export function getTokenBySymbol(
  chain: SupportedChainKey,
  symbol: string
): TokenOption | undefined {
  return getTokensForChain(chain).find(
    (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}

export function isNativeTokenAddress(address?: string): boolean {
  if (!address) return false;
  return address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
}