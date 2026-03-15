import type { AnalysisSummary, HistoryItem, TrackedPair } from '@/lib/types';
import { makePairKey } from '@/lib/utils';

const HISTORY_KEY = 'exora:history';
const TRACKED_KEY = 'exora:tracked';

function isBrowser() {
  return typeof window !== 'undefined';
}

export function getHistory(): HistoryItem[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? '[]') as HistoryItem[];
  } catch {
    return [];
  }
}

export function saveAnalysis(summary: AnalysisSummary) {
  if (!isBrowser()) return;
  const current = getHistory();
  const item: HistoryItem = {
    id: crypto.randomUUID(),
    pairKey: makePairKey(summary.chain, summary.tokenIn, summary.tokenOut, summary.amountIn),
    createdAt: new Date().toISOString(),
    summary,
  };
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify([item, ...current].slice(0, 30)));
}

export function getTrackedPairs(): TrackedPair[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(TRACKED_KEY) ?? '[]') as TrackedPair[];
  } catch {
    return [];
  }
}

export function trackAnalysis(summary: AnalysisSummary) {
  if (!isBrowser()) return;
  const current = getTrackedPairs();
  const id = makePairKey(summary.chain, summary.tokenIn, summary.tokenOut, summary.amountIn);
  const next: TrackedPair = {
    id,
    chain: summary.chain,
    tokenIn: summary.tokenIn,
    tokenOut: summary.tokenOut,
    amountIn: summary.amountIn,
    createdAt: new Date().toISOString(),
    lastBestDex: summary.bestRoute?.dexId,
    lastSlippagePct: summary.bestRoute?.slippagePct,
  };

  const deduped = [next, ...current.filter((item) => item.id !== id)].slice(0, 20);
  window.localStorage.setItem(TRACKED_KEY, JSON.stringify(deduped));
}
