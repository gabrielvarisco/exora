import { formatPct, formatTokenAmount, formatUsd } from '@/lib/utils';
import type { RouteCandidate } from '@/lib/types';
import { ExecuteSwapButton } from '@/components/ExecuteSwapButton';

export function RouteSummaryCard({ route }: { route: RouteCandidate }) {
  return (
    <div className="panel content-panel stack-sm">
      <div className="card-head">
        <div>
          <div className="label">Best estimated route</div>
          <h2 className="card-title">{route.dexId} · {route.pairLabel}</h2>
        </div>
        <span className={`badge ${route.scoreLabel === 'Excellent' ? 'success' : route.scoreLabel === 'Good' ? 'success' : route.scoreLabel === 'Watch' ? 'warning' : 'danger'}`}>{route.scoreLabel}</span>
      </div>

      <div className="stats-grid">
        <div className="stat"><span>Estimated output</span><strong>{formatTokenAmount(route.estimatedOutput)} {route.estimatedOutputSymbol}</strong></div>
        <div className="stat"><span>Price impact</span><strong>{formatPct(route.priceImpactPct)}</strong></div>
        <div className="stat"><span>Slippage</span><strong>{formatPct(route.slippagePct)}</strong></div>
        <div className="stat"><span>Gas</span><strong>{formatUsd(route.gasUsd)}</strong></div>
        <div className="stat"><span>Liquidity</span><strong>{formatUsd(route.liquidityUsd)}</strong></div>
        <div className="stat"><span>24h volume</span><strong>{formatUsd(route.volume24hUsd)}</strong></div>
      </div>

      <div className="inline-note">Source freshness: {route.freshness}. Execution remains an estimate until routed through an executable swap engine.</div>
      <ExecuteSwapButton route={route} />
    </div>
  );
}
