import { money, percent } from "@/lib/format";
import { RouteCandidate } from "@/lib/types";

export default function RouteTable({ routes, tokenOut }: { routes: RouteCandidate[]; tokenOut: string }) {
  if (!routes.length) return null;

  return (
    <div className="glass-card table-card">
      <div className="table-head">
        <h3>Route comparison</h3>
        <span>{routes.length} candidates</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>DEX</th>
              <th>Output</th>
              <th>Liquidity</th>
              <th>Volume 24h</th>
              <th>Impact</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id}>
                <td>{route.dex}</td>
                <td>{money(route.estimatedOutput, 4)} {tokenOut}</td>
                <td>${money(route.liquidityUsd)}</td>
                <td>${money(route.volume24hUsd)}</td>
                <td>{percent(route.priceImpact)}</td>
                <td>{route.executionScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
