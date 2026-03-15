'use client';

import { useEffect, useState } from 'react';
import type { HistoryItem, TrackedPair } from '@/lib/types';
import { getHistory, getTrackedPairs } from '@/lib/history-store';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [tracked, setTracked] = useState<TrackedPair[]>([]);

  useEffect(() => {
    setHistory(getHistory());
    setTracked(getTrackedPairs());
  }, []);

  const refresh = () => {
    setHistory(getHistory());
    setTracked(getTrackedPairs());
  };

  return { history, tracked, refresh };
}
