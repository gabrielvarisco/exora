export type ChainKey = "ethereum" | "base" | "arbitrum" | "polygon" | "bsc";

export interface TokenOption {
  symbol: string;
  name: string;
  chain: ChainKey;
  address?: string;
  logo?: string;
}

export interface RouteCandidate {
  id: string;
  dex: string;
  chain: ChainKey;
  pairAddress: string;
  baseSymbol: string;
  quoteSymbol: string;
  liquidityUsd: number;
  volume24hUsd: number;
  priceImpact: number;
  slippage: number;
  gasUsd: number;
  estimatedOutput: number;
  executionScore: number;
  confidence: "high" | "medium" | "low";
  warning?: string;
}

export interface AnalyzeResponse {
  pairLabel: string;
  routes: RouteCandidate[];
  bestRoute?: RouteCandidate;
  summary: string;
  sourceNote: string;
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  chain: ChainKey;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  bestDex?: string;
  executionScore?: number;
  estimatedOutput?: number;
  summary: string;
}

export interface TrackedAlert {
  id: string;
  pair: string;
  chain: ChainKey;
  message: string;
  severity: "info" | "warning" | "success";
  createdAt: string;
}
