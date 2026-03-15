'use client';

import Link from 'next/link';
import type { HistoryItem } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

export function RouteHistory({ items }: { items: HistoryItem[] }) {
  if (!items.length) {
    return <div className="panel content-panel">No saved analyses yet. Run the analyzer first.</div>;
  }

  return (
    <div className="stack-sm">
      {items.map((item) => (
        <div key={item.id} className="panel content-panel history-row">
          <div>
            <div className="card-title">{item.summary.tokenIn} → {item.summary.tokenOut} · {item.summary.chain}</div>
            <div className="text-muted small">{item.summary.amountIn} input · {timeAgo(item.createdAt)}</div>
          </div>
          <div className="history-metrics">
            <span>Best: {item.summary.bestRoute?.dexId ?? '—'}</span>
            <span>Score: {item.summary.bestRoute?.executionScore ?? '—'}</span>
          </div>
          <Link href="/analyzer" className="btn btn-secondary btn-sm">Analyze again</Link>
        </div>
      ))}
    </div>
  );
}
