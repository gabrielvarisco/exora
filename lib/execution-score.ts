import { clamp } from '@/lib/utils';

interface ScoreInput {
  liquidityUsd: number;
  volume24hUsd: number;
  priceImpactPct: number;
  slippagePct: number;
  gasUsd: number;
}

export function calculateExecutionScore(input: ScoreInput) {
  const liquidityScore = clamp(Math.log10(Math.max(input.liquidityUsd, 1)) * 14, 0, 34);
  const volumeScore = clamp(Math.log10(Math.max(input.volume24hUsd, 1)) * 10, 0, 24);
  const priceImpactPenalty = clamp(input.priceImpactPct * 8, 0, 20);
  const slippagePenalty = clamp(input.slippagePct * 6.5, 0, 14);
  const gasPenalty = clamp(input.gasUsd * 1.2, 0, 10);

  const score = clamp(liquidityScore + volumeScore + 42 - priceImpactPenalty - slippagePenalty - gasPenalty, 0, 100);

  if (score >= 82) return { score: Math.round(score), label: 'Excellent' as const, confidence: 'High' as const };
  if (score >= 68) return { score: Math.round(score), label: 'Good' as const, confidence: 'High' as const };
  if (score >= 50) return { score: Math.round(score), label: 'Watch' as const, confidence: 'Medium' as const };
  return { score: Math.round(score), label: 'Risky' as const, confidence: 'Low' as const };
}
