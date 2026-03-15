import type { RouteCandidate } from '@/lib/types';

export function ExecutionScoreCard({ route }: { route: RouteCandidate }) {
  return (
    <div className="panel content-panel stack-sm">
      <div className="label">Execution score</div>
      <div className="score-circle">{route.executionScore}</div>
      <div className="score-meta">
        <div><strong>{route.scoreLabel}</strong></div>
        <div className="text-muted">Confidence {route.confidence}</div>
      </div>
      <div className="text-muted small">
        Score combines liquidity depth, 24h volume, estimated price impact, slippage pressure and gas burden.
      </div>
    </div>
  );
}
