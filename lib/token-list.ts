import { ChainKey, TokenOption } from "@/lib/types";

const TOKENS: TokenOption[] = [
  { chain: "ethereum", symbol: "ETH", name: "Ether" },
  { chain: "ethereum", symbol: "USDC", name: "USD Coin" },
  { chain: "ethereum", symbol: "USDT", name: "Tether USD" },
  { chain: "ethereum", symbol: "WBTC", name: "Wrapped Bitcoin" },
  { chain: "ethereum", symbol: "DAI", name: "Dai" },
  { chain: "ethereum", symbol: "UNI", name: "Uniswap" },

  { chain: "base", symbol: "ETH", name: "Ether" },
  { chain: "base", symbol: "USDC", name: "USD Coin" },
  { chain: "base", symbol: "DEGEN", name: "Degen" },
  { chain: "base", symbol: "AERO", name: "Aerodrome" },

  { chain: "arbitrum", symbol: "ETH", name: "Ether" },
  { chain: "arbitrum", symbol: "USDC", name: "USD Coin" },
  { chain: "arbitrum", symbol: "ARB", name: "Arbitrum" },
  { chain: "arbitrum", symbol: "GMX", name: "GMX" },

  { chain: "polygon", symbol: "POL", name: "Polygon" },
  { chain: "polygon", symbol: "USDC", name: "USD Coin" },
  { chain: "polygon", symbol: "USDT", name: "Tether USD" },
  { chain: "polygon", symbol: "WETH", name: "Wrapped Ether" },

  { chain: "bsc", symbol: "BNB", name: "BNB" },
  { chain: "bsc", symbol: "USDT", name: "Tether USD" },
  { chain: "bsc", symbol: "USDC", name: "USD Coin" },
  { chain: "bsc", symbol: "CAKE", name: "PancakeSwap" }
];

export function getTokensForChain(chain: ChainKey): TokenOption[] {
  return TOKENS.filter((token) => token.chain === chain);
}

export function getDefaultPair(chain: ChainKey) {
  const defaults: Record<ChainKey, { tokenIn: string; tokenOut: string }> = {
    ethereum: { tokenIn: "ETH", tokenOut: "USDC" },
    base: { tokenIn: "ETH", tokenOut: "USDC" },
    arbitrum: { tokenIn: "ETH", tokenOut: "USDC" },
    polygon: { tokenIn: "POL", tokenOut: "USDC" },
    bsc: { tokenIn: "BNB", tokenOut: "USDT" }
  };

  return defaults[chain];
}
