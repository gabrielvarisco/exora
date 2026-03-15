import type { AlertItem, AnalysisSummary, TrackedPair } from '@/lib/types';
import { makePairKey } from '@/lib/utils';

export function generateAlerts(tracked: TrackedPair[], analyses: AnalysisSummary[]): AlertItem[] {
  const alerts: AlertItem[] = [];

  for (const trackedPair of tracked) {
    const pairKey = makePairKey(trackedPair.chain, trackedPair.tokenIn, trackedPair.tokenOut, trackedPair.amountIn);
    const latest = analyses.find((item) => makePairKey(item.chain, item.tokenIn, item.tokenOut, item.amountIn) === pairKey);
    if (!latest?.bestRoute) continue;

    if (trackedPair.lastBestDex && trackedPair.lastBestDex !== latest.bestRoute.dexId) {
      alerts.push({
        id: `${pairKey}:dex`,
        severity: 'info',
        title: 'Best route changed',
        description: `A melhor rota saiu de ${trackedPair.lastBestDex} para ${latest.bestRoute.dexId}.`,
        pairKey,
        createdAt: new Date().toISOString(),
      });
    }

    if (typeof trackedPair.lastSlippagePct === 'number' && latest.bestRoute.slippagePct - trackedPair.lastSlippagePct > 0.5) {
      alerts.push({
        id: `${pairKey}:slippage`,
        severity: latest.bestRoute.slippagePct > 2 ? 'critical' : 'warning',
        title: 'Slippage worsened',
        description: `A slippage estimada subiu para ${latest.bestRoute.slippagePct.toFixed(2)}%.`,
        pairKey,
        createdAt: new Date().toISOString(),
      });
    }

    if (latest.bestRoute.liquidityUsd < 100_000) {
      alerts.push({
        id: `${pairKey}:liquidity`,
        severity: 'warning',
        title: 'Low liquidity watch',
        description: 'A melhor rota atual está apoiada em liquidez limitada para este tamanho de swap.',
        pairKey,
        createdAt: new Date().toISOString(),
      });
    }
  }

  return alerts;
}
