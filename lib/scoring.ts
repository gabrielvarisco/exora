import { RouteCandidate } from "@/lib/types";

export function normalize(value: number, min: number, max: number) {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function computeExecutionScore(input: {
  liquidityUsd: number;
  volume24hUsd: number;
  priceImpact: number;
  slippage: number;
  gasUsd: number;
}) {
  const liquidityScore = normalize(Math.log10(Math.max(input.liquidityUsd, 1)), 3, 8) * 30;
  const volumeScore = normalize(Math.log10(Math.max(input.volume24hUsd, 1)), 3, 8) * 20;
  const impactPenalty = (1 - normalize(input.priceImpact, 0, 0.05)) * 20;
  const slippagePenalty = (1 - normalize(input.slippage, 0, 0.05)) * 20;
  const gasPenalty = (1 - normalize(input.gasUsd, 0, 40)) * 10;
  return Math.max(0, Math.min(100, Math.round(liquidityScore + volumeScore + impactPenalty + slippagePenalty + gasPenalty)));
}

export function getConfidence(score: number): RouteCandidate["confidence"] {
  if (score >= 80) return "high";
  if (score >= 60) return "medium";
  return "low";
}

export function routeBadge(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Watchable";
  return "Thin liquidity";
}
