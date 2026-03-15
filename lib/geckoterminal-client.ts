import { GECKO_NETWORK_MAP } from '@/lib/chains';
import { normalizeSearchTerm, toNumber } from '@/lib/utils';
import type { SupportedChain } from '@/lib/types';

const GECKO_BASE_URL = 'https://api.geckoterminal.com/api/v2';

interface GeckoPoolAttributes {
  address: string;
  name: string;
  reserve_in_usd?: string;
  volume_usd?: { h24?: string };
  base_token_price_quote_token?: string;
  quote_token_price_base_token?: string;
}

interface GeckoTokenData {
  id?: string;
  type?: string;
  attributes?: {
    address?: string;
    symbol?: string;
    name?: string;
  };
}

export interface GeckoPoolItem {
  id: string;
  attributes: GeckoPoolAttributes;
  relationships?: {
    dex?: { data?: { id?: string } };
    base_token?: { data?: GeckoTokenData };
    quote_token?: { data?: GeckoTokenData };
  };
  includedBase?: GeckoTokenData;
  includedQuote?: GeckoTokenData;
}

interface GeckoSearchResponse {
  data?: GeckoPoolItem[];
  included?: GeckoTokenData[];
}

export async function searchGeckoTerminalPools(
  chain: SupportedChain,
  tokenIn: string,
  tokenOut: string,
): Promise<GeckoPoolItem[]> {
  const network = GECKO_NETWORK_MAP[chain];
  const url = `${GECKO_BASE_URL}/search/pools?query=${encodeURIComponent(`${tokenIn} ${tokenOut}`)}&network=${encodeURIComponent(network)}`;

  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    next: { revalidate: 45 },
  });

  if (!response.ok) return [];

  const payload = (await response.json()) as GeckoSearchResponse;
  const included = payload.included ?? [];

  return (payload.data ?? [])
    .map((pool) => {
      const baseId = pool.relationships?.base_token?.data?.id;
      const quoteId = pool.relationships?.quote_token?.data?.id;
      return {
        ...pool,
        includedBase: included.find((item) => item.id === baseId),
        includedQuote: included.find((item) => item.id === quoteId),
      };
    })
    .filter((pool) => {
      const terms = [
        normalizeSearchTerm(pool.includedBase?.attributes?.symbol ?? ''),
        normalizeSearchTerm(pool.includedQuote?.attributes?.symbol ?? ''),
        normalizeSearchTerm(pool.includedBase?.attributes?.address ?? ''),
        normalizeSearchTerm(pool.includedQuote?.attributes?.address ?? ''),
        normalizeSearchTerm(pool.attributes.name),
      ];
      return terms.some((term) => term.includes(normalizeSearchTerm(tokenIn))) &&
        terms.some((term) => term.includes(normalizeSearchTerm(tokenOut)));
    })
    .sort((a, b) => {
      const aScore = toNumber(a.attributes.reserve_in_usd) + toNumber(a.attributes.volume_usd?.h24);
      const bScore = toNumber(b.attributes.reserve_in_usd) + toNumber(b.attributes.volume_usd?.h24);
      return bScore - aScore;
    })
    .slice(0, 12);
}
