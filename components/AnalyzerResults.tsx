'use client';

import { useState } from 'react';
import { DecisionSummaryPanel } from '@/components/DecisionSummaryPanel';
import { ExecutionScoreCard } from '@/components/ExecutionScoreCard';
import { RouteComparisonTable } from '@/components/RouteComparisonTable';
import { RouteSummaryCard } from '@/components/RouteSummaryCard';
import { trackAnalysis } from '@/lib/history-store';
import type { AnalysisSummary } from '@/lib/types';

interface AnalyzerResultsProps {
  result: AnalysisSummary | null;
  error: string | null;
  isLoading: boolean;
}

export function AnalyzerResults({ result, error, isLoading }: AnalyzerResultsProps) {
  const [trackMessage, setTrackMessage] = useState<string | null>(null);

  if (isLoading) {
    return <div className="panel content-panel loading-state">Fetching real pool data and scoring execution quality...</div>;
  }

  if (error) {
    return <div className="panel content-panel error-state"><strong>Analyzer error</strong><div className="text-muted" style={{ marginTop: 8 }}>{error}</div></div>;
  }

  if (!result) {
    return <div className="panel content-panel empty-state"><strong>No analysis yet</strong><div className="text-muted" style={{ marginTop: 8 }}>Fill the form to compare live routes. A good first test is Ethereum, WETH, USDC, amount 1.</div></div>;
  }

  if (!result.bestRoute) {
    return <div className="panel content-panel empty-state"><strong>No usable route found</strong><div className="text-muted" style={{ marginTop: 8 }}>{result.emptyReason}</div></div>;
  }

  return (
    <div className="stack">
      <div className="summary-grid">
        <RouteSummaryCard route={result.bestRoute} />
        <ExecutionScoreCard route={result.bestRoute} />
      </div>
      <div className="panel content-panel inline-actions">
        <div>
          <div className="card-title">Track this pair</div>
          <div className="text-muted small">Save it locally for route monitoring and alerts.</div>
        </div>
        <button className="btn btn-secondary" onClick={() => {
          trackAnalysis(result);
          setTrackMessage('Pair tracked locally.');
        }}>Save to tracked pairs</button>
        {trackMessage ? <span className="text-muted small">{trackMessage}</span> : null}
      </div>
      <DecisionSummaryPanel summary={result} />
      <RouteComparisonTable routes={[result.bestRoute, ...result.alternativeRoutes]} />
    </div>
  );
}
