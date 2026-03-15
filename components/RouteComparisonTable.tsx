import type { RouteCandidate } from '@/lib/types';
import { formatPct, formatTokenAmount, formatUsd } from '@/lib/utils';

export function RouteComparisonTable({ routes }: { routes: RouteCandidate[] }) {
  return (
    <div className="panel content-panel">
      <div className="card-head" style={{ marginBottom: 16 }}>
        <div>
          <div className="label">Route comparison</div>
          <h3 className="card-title">Alternative execution paths</h3>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>DEX</th>
              <th>Pair</th>
              <th>Output</th>
              <th>Impact</th>
              <th>Slippage</th>
              <th>Gas</th>
              <th>Liquidity</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td>{route.dexId}</td>
                <td>{route.pairLabel}</td>
                <td>{formatTokenAmount(route.estimatedOutput)} {route.estimatedOutputSymbol}</td>
                <td>{formatPct(route.priceImpactPct)}</td>
                <td>{formatPct(route.slippagePct)}</td>
                <td>{formatUsd(route.gasUsd)}</td>
                <td>{formatUsd(route.liquidityUsd)}</td>
                <td>{route.executionScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
