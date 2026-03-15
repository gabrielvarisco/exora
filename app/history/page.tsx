'use client';

import { RouteHistory } from '@/components/RouteHistory';
import { useHistory } from '@/hooks/useHistory';

export default function HistoryPage() {
  const { history, tracked } = useHistory();

  return (
    <main className="section">
      <div className="container stack">
        <div>
          <span className="kicker">Sprint 6 — Route Monitoring</span>
          <h1 className="heading-lg" style={{ marginTop: 16 }}>Analysis history</h1>
          <p className="text-muted" style={{ marginTop: 10 }}>
            Recent analyses and tracked pairs are stored locally in the browser for this MVP.
          </p>
        </div>

        <div className="summary-grid">
          <div className="panel content-panel"><div className="label">Saved analyses</div><div className="big-number">{history.length}</div></div>
          <div className="panel content-panel"><div className="label">Tracked pairs</div><div className="big-number">{tracked.length}</div></div>
        </div>

        <RouteHistory items={history} />
      </div>
    </main>
  );
}
