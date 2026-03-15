'use client';

import type { AlertItem } from '@/lib/types';

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  if (!alerts.length) {
    return <div className="panel content-panel">No active alerts yet. Track a pair from the analyzer and refresh alerts after new analyses.</div>;
  }

  return (
    <div className="stack-sm">
      {alerts.map((alert) => (
        <div key={alert.id} className="panel content-panel">
          <div className="card-head">
            <div>
              <div className="card-title">{alert.title}</div>
              <div className="text-muted small">{alert.pairKey}</div>
            </div>
            <span className={`badge ${alert.severity === 'critical' ? 'danger' : alert.severity === 'warning' ? 'warning' : 'success'}`}>{alert.severity}</span>
          </div>
          <p className="summary-copy">{alert.description}</p>
        </div>
      ))}
    </div>
  );
}
