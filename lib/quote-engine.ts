import { searchDexScreenerPairs } from '@/lib/dexscreener-client';
import { searchGeckoTerminalPools } from '@/lib/geckoterminal-client';
import { getBaseGasUsd } from '@/lib/chains';
import { calculateExecutionScore } from '@/lib/execution-score';
import { createAnalysisSummary } from '@/lib/route-summary';
import type { AnalysisSummary, RouteCandidate, SupportedChain } from '@/lib/types';
import { clamp, normalizeSearchTerm, round, toNumber } from '@/lib/utils';

interface BuildAnalysisInput {
  chain: SupportedChain;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
}

function deriveDirection(baseSymbol: string, quoteSymbol: string, tokenIn: string, tokenOut: string) {
  const base = normalizeSearchTerm(baseSymbol);
  const quote = normalizeSearchTerm(quoteSymbol);
  const inTerm = normalizeSearchTerm(tokenIn);
  const outTerm = normalizeSearchTerm(tokenOut);

  if (base === inTerm && quote === outTerm) return 'in-to-out' as const;
  if (base === outTerm && quote === inTerm) return 'out-to-in' as const;
  return 'unknown' as const;
}

function estimateTradeMetrics(params: {
  amountIn: number;
  liquidityUsd: number;
  volume24hUsd: number;
  gasUsd: number;
  rawRate: number | null;
}) {
  const notionalUsd = params.rawRate && params.rawRate > 0 ? params.amountIn * params.rawRate : params.amountIn;
  const liquidityFactor = params.liquidityUsd > 0 ? notionalUsd / params.liquidityUsd : 1;
  const volumeFactor = params.volume24hUsd > 0 ? notionalUsd / params.volume24hUsd : 1;

  const priceImpactPct = clamp(liquidityFactor * 85, 0.05, 15);
  const slippagePct = clamp(priceImpactPct * 0.55 + volumeFactor * 18, 0.05, 8);
  const gasMultiplier = clamp(1 + liquidityFactor * 0.1 + volumeFactor * 0.05, 1, 1.4);

  return {
    priceImpactPct: round(priceImpactPct, 2),
    slippagePct: round(slippagePct, 2),
    gasUsd: round(params.gasUsd * gasMultiplier, 2),
  };
}

function buildRouteFromDex(params: {
  chain: SupportedChain;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  item: Awaited<ReturnType<typeof searchDexScreenerPairs>>[number];
}): RouteCandidate {
  const direction = deriveDirection(params.item.baseToken.symbol, params.item.quoteToken.symbol, params.tokenIn, params.tokenOut);
  const priceNative = toNumber(params.item.priceNative, NaN);
  let estimatedOutput: number | null = null;
  let outputSymbol = params.tokenOut.toUpperCase();
  let priceRatio: number | null = Number.isFinite(priceNative) ? priceNative : null;

  if (direction === 'in-to-out' && Number.isFinite(priceNative) && priceNative > 0) {
    estimatedOutput = params.amountIn * priceNative;
    outputSymbol = params.item.quoteToken.symbol;
  } else if (direction === 'out-to-in' && Number.isFinite(priceNative) && priceNative > 0) {
    estimatedOutput = params.amountIn / priceNative;
    outputSymbol = params.item.baseToken.symbol;
    priceRatio = 1 / priceNative;
  }

  const liquidityUsd = toNumber(params.item.liquidity?.usd);
  const volume24hUsd = toNumber(params.item.volume?.h24);
  const metrics = estimateTradeMetrics({
    amountIn: params.amountIn,
    liquidityUsd,
    volume24hUsd,
    gasUsd: getBaseGasUsd(params.chain),
    rawRate: priceRatio,
  });

  const score = calculateExecutionScore({
    liquidityUsd,
    volume24hUsd,
    priceImpactPct: metrics.priceImpactPct,
    slippagePct: metrics.slippagePct,
    gasUsd: metrics.gasUsd,
  });

  return {
    id: `dex-${params.item.pairAddress}`,
    source: 'dexscreener',
    chain: params.chain,
    dexId: params.item.dexId,
    pairAddress: params.item.pairAddress,
    pairLabel: `${params.item.baseToken.symbol}/${params.item.quoteToken.symbol}`,
    url: params.item.url,
    baseToken: params.item.baseToken,
    quoteToken: params.item.quoteToken,
    liquidityUsd,
    volume24hUsd,
    priceRatio,
    direction,
    estimatedOutput: estimatedOutput ? round(estimatedOutput * (1 - metrics.slippagePct / 100), 6) : null,
    estimatedOutputSymbol: outputSymbol,
    priceImpactPct: metrics.priceImpactPct,
    slippagePct: metrics.slippagePct,
    gasUsd: metrics.gasUsd,
    executionScore: score.score,
    scoreLabel: score.label,
    confidence: score.confidence,
    warnings: direction === 'unknown' ? ['Par encontrado, mas a direção do swap não foi confirmada com total precisão.'] : [],
    notes: ['Fonte: DEX Screener'],
    freshness: 'Live',
  };
}

function buildRouteFromGecko(params: {
  chain: SupportedChain;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  item: Awaited<ReturnType<typeof searchGeckoTerminalPools>>[number];
}): RouteCandidate {
  const baseSymbol = params.item.includedBase?.attributes?.symbol ?? 'BASE';
  const quoteSymbol = params.item.includedQuote?.attributes?.symbol ?? 'QUOTE';
  const direction = deriveDirection(baseSymbol, quoteSymbol, params.tokenIn, params.tokenOut);

  let priceRatio: number | null = null;
  if (direction === 'in-to-out') priceRatio = toNumber(params.item.attributes.base_token_price_quote_token, NaN);
  if (direction === 'out-to-in') priceRatio = toNumber(params.item.attributes.quote_token_price_base_token, NaN);
  if (!Number.isFinite(priceRatio)) priceRatio = null;

  const liquidityUsd = toNumber(params.item.attributes.reserve_in_usd);
  const volume24hUsd = toNumber(params.item.attributes.volume_usd?.h24);
  const metrics = estimateTradeMetrics({
    amountIn: params.amountIn,
    liquidityUsd,
    volume24hUsd,
    gasUsd: getBaseGasUsd(params.chain) * 1.08,
    rawRate: priceRatio,
  });
  const score = calculateExecutionScore({
    liquidityUsd,
    volume24hUsd,
    priceImpactPct: metrics.priceImpactPct,
    slippagePct: metrics.slippagePct,
    gasUsd: metrics.gasUsd,
  });

  return {
    id: `gecko-${params.item.id}`,
    source: 'geckoterminal',
    chain: params.chain,
    dexId: params.item.relationships?.dex?.data?.id ?? 'unknown-dex',
    pairAddress: params.item.attributes.address,
    pairLabel: `${baseSymbol}/${quoteSymbol}`,
    url: `https://www.geckoterminal.com/${params.chain}/pools/${params.item.attributes.address}`,
    baseToken: {
      address: params.item.includedBase?.attributes?.address,
      symbol: baseSymbol,
      name: params.item.includedBase?.attributes?.name,
    },
    quoteToken: {
      address: params.item.includedQuote?.attributes?.address,
      symbol: quoteSymbol,
      name: params.item.includedQuote?.attributes?.name,
    },
    liquidityUsd,
    volume24hUsd,
    priceRatio,
    direction,
    estimatedOutput: priceRatio ? round(params.amountIn * priceRatio * (1 - metrics.slippagePct / 100), 6) : null,
    estimatedOutputSymbol: direction === 'out-to-in' ? baseSymbol : quoteSymbol,
    priceImpactPct: metrics.priceImpactPct,
    slippagePct: metrics.slippagePct,
    gasUsd: metrics.gasUsd,
    executionScore: score.score,
    scoreLabel: score.label,
    confidence: score.confidence,
    warnings: direction === 'unknown' ? ['Pool encontrado, mas a direção exata do swap ainda precisa ser validada.'] : [],
    notes: ['Fonte: GeckoTerminal'],
    freshness: 'Cached',
  };
}

export async function buildExecutionAnalysis(input: BuildAnalysisInput): Promise<AnalysisSummary> {
  const [dexPairs, geckoPools] = await Promise.all([
    searchDexScreenerPairs(input.chain, input.tokenIn, input.tokenOut),
    searchGeckoTerminalPools(input.chain, input.tokenIn, input.tokenOut),
  ]);

  const routes: RouteCandidate[] = [
    ...dexPairs.map((item) => buildRouteFromDex({ ...input, item })),
    ...geckoPools.map((item) => buildRouteFromGecko({ ...input, item })),
  ]
    .filter((route) => route.liquidityUsd > 0 || route.volume24hUsd > 0)
    .sort((a, b) => b.executionScore - a.executionScore || (b.estimatedOutput ?? 0) - (a.estimatedOutput ?? 0));

  const bestRoute = routes[0] ?? null;

  return createAnalysisSummary({
    chain: input.chain,
    tokenIn: input.tokenIn,
    tokenOut: input.tokenOut,
    amountIn: input.amountIn,
    bestRoute,
    alternativeRoutes: bestRoute ? routes.slice(1, 8) : [],
    routeCount: routes.length,
    textualSummary: '',
    decisionSummary: [],
    coverageNotes: [
      'Dados vindos de APIs públicas: DEX Screener e GeckoTerminal.',
      'O output é uma estimativa de execução com base em preço relativo do pool, liquidez observada, volume e custo base de gas por chain.',
      'Se o token for buscado apenas por símbolo, pode haver ambiguidade. Para maior precisão, prefira endereço do contrato.',
      'Este MVP não usa roteamento executável de agregadores como 1inch ou 0x.',
    ],
    analyzedAt: new Date().toISOString(),
    emptyReason: routes.length === 0 ? 'Nenhuma rota elegível encontrada com dados públicos reais para este par na chain selecionada.' : undefined,
  });
}
