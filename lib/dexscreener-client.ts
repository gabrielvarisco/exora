import { normalizeSearchTerm, toNumber } from '@/lib/utils';
import type { SupportedChain } from '@/lib/types';

const DEXSCREENER_BASE_URL = 'https://api.dexscreener.com';

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  pairAddress: string;
  url?: string;
  baseToken: {
    address?: string;
    symbol: string;
    name?: string;
  };
  quoteToken: {
    address?: string;
    symbol: string;
    name?: string;
  };
  priceNative?: string;
  priceUsd?: string;
  liquidity?: { usd?: number };
  volume?: { h24?: number };
}

interface DexScreenerSearchResponse {
  pairs?: DexScreenerPair[];
}

export async function searchDexScreenerPairs(
  chain: SupportedChain,
  tokenIn: string,
  tokenOut: string,
): Promise<DexScreenerPair[]> {
  const queries = [`${tokenIn}/${tokenOut}`, `${tokenIn} ${tokenOut}`, `${tokenOut}/${tokenIn}`];
  const collected = new Map<string, DexScreenerPair>();

  for (const query of queries) {
    const url = `${DEXSCREENER_BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      next: { revalidate: 45 },
    });

    if (!response.ok) continue;

    const payload = (await response.json()) as DexScreenerSearchResponse;
    for (const pair of payload.pairs ?? []) {
      if (pair.chainId !== chain) continue;
      collected.set(pair.pairAddress, pair);
    }
  }

  const tokenInLower = normalizeSearchTerm(tokenIn);
  const tokenOutLower = normalizeSearchTerm(tokenOut);

  return Array.from(collected.values())
    .filter((pair) => {
      const haystack = [
        normalizeSearchTerm(pair.baseToken.symbol),
        normalizeSearchTerm(pair.quoteToken.symbol),
        normalizeSearchTerm(pair.baseToken.address ?? ''),
        normalizeSearchTerm(pair.quoteToken.address ?? ''),
      ];
      return haystack.includes(tokenInLower) || haystack.includes(tokenOutLower);
    })
    .sort((a, b) => {
      const aScore = toNumber(a.liquidity?.usd) + toNumber(a.volume?.h24);
      const bScore = toNumber(b.liquidity?.usd) + toNumber(b.volume?.h24);
      return bScore - aScore;
    })
    .slice(0, 12);
}
