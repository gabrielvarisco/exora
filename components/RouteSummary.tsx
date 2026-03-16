import { money, percent } from "@/lib/format";
import { routeBadge } from "@/lib/scoring";
import { RouteCandidate } from "@/lib/types";

export default function RouteSummary({ bestRoute, tokenOut }: { bestRoute?: RouteCandidate; tokenOut: string }) {
  if (!bestRoute) {
    return (
      <div className="glass-card result-empty">
        <h3>No route yet</h3>
        <p>Run the analyzer to compare live public pool candidates for your trade.</p>
      </div>
    );
  }

  return (
    <div className="glass-card result-summary">
      <div className="summary-head">
        <div>
          <span className="eyebrow">Best route</span>
          <h3>{bestRoute.dex}</h3>
        </div>
        <span className={`score-pill score-${bestRoute.confidence}`}>{routeBadge(bestRoute.executionScore)}</span>
      </div>

      <div className="summary-grid">
        <div>
          <span>Estimated output</span>
          <strong>{money(bestRoute.estimatedOutput, 4)} {tokenOut}</strong>
        </div>
        <div>
          <span>Execution score</span>
          <strong>{bestRoute.executionScore}/100</strong>
        </div>
        <div>
          <span>Slippage</span>
          <strong>{percent(bestRoute.slippage)}</strong>
        </div>
        <div>
          <span>Gas burden</span>
          <strong>${money(bestRoute.gasUsd)}</strong>
        </div>
      </div>

      {bestRoute.warning ? <p className="route-warning">{bestRoute.warning}</p> : null}
    </div>
  );
}
