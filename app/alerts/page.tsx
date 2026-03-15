'use client';

import { useMemo } from 'react';
import { AlertsPanel } from '@/components/AlertsPanel';
import { generateAlerts } from '@/lib/alerts-engine';
import { useHistory } from '@/hooks/useHistory';

export default function AlertsPage() {
  const { history, tracked } = useHistory();
  const alerts = useMemo(() => generateAlerts(tracked, history.map((item) => item.summary)), [history, tracked]);

  return (
    <main className="section">
      <div className="container stack">
        <div>
          <span className="kicker">Sprint 7 — Alerts</span>
          <h1 className="heading-lg" style={{ marginTop: 16 }}>Route alerts</h1>
          <p className="text-muted" style={{ marginTop: 10, maxWidth: 860 }}>
            Alerts are generated from tracked pairs versus refreshed analyses already saved in the app. This MVP does not run background on-chain monitoring.
          </p>
        </div>
        <AlertsPanel alerts={alerts} />
      </div>
    </main>
  );
}
