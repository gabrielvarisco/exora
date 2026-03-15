export type SupportedChain =
  | 'ethereum'
  | 'arbitrum'
  | 'base'
  | 'bsc'
  | 'polygon'
  | 'optimism'
  | 'solana';

export type RouteSource = 'dexscreener' | 'geckoterminal';

export interface TokenReference {
  address?: string;
  symbol: string;
  name?: string;
}

export interface RouteCandidate {
  id: string;
  source: RouteSource;
  chain: SupportedChain;
  dexId: string;
  pairAddress: string;
  pairLabel: string;
  url?: string;
  baseToken: TokenReference;
  quoteToken: TokenReference;
  liquidityUsd: number;
  volume24hUsd: number;
  priceRatio: number | null;
  direction: 'in-to-out' | 'out-to-in' | 'unknown';
  estimatedOutput: number | null;
  estimatedOutputSymbol: string;
  priceImpactPct: number;
  slippagePct: number;
  gasUsd: number;
  executionScore: number;
  scoreLabel: 'Excellent' | 'Good' | 'Watch' | 'Risky';
  confidence: 'High' | 'Medium' | 'Low';
  warnings: string[];
  notes: string[];
  freshness: 'Live' | 'Cached';
}

export interface AnalysisSummary {
  chain: SupportedChain;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  bestRoute: RouteCandidate | null;
  alternativeRoutes: RouteCandidate[];
  routeCount: number;
  textualSummary: string;
  decisionSummary: string[];
  coverageNotes: string[];
  analyzedAt: string;
  emptyReason?: string;
}

export interface HistoryItem {
  id: string;
  pairKey: string;
  createdAt: string;
  summary: AnalysisSummary;
}

export interface TrackedPair {
  id: string;
  chain: SupportedChain;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  createdAt: string;
  lastBestDex?: string;
  lastSlippagePct?: number;
}

export interface AlertItem {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  pairKey: string;
  createdAt: string;
}
