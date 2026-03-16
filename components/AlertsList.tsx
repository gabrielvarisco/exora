"use client";

import { useEffect, useState } from "react";
import { loadAlerts } from "@/lib/storage";
import { TrackedAlert } from "@/lib/types";

export default function AlertsList() {
  const [items, setItems] = useState<TrackedAlert[]>([]);

  useEffect(() => {
    setItems(loadAlerts());
  }, []);

  return (
    <div className="stack-page shell narrow-shell">
      <div className="page-copy">
        <span className="eyebrow">Monitoring</span>
        <h1>Alerts</h1>
        <p>Locally saved reminders generated after analysis runs with notable execution risk.</p>
      </div>

      <div className="stack-list">
        {items.length === 0 ? (
          <div className="glass-card empty-state">No alerts yet.</div>
        ) : (
          items.map((item) => (
            <div className={`glass-card alert-item alert-${item.severity}`} key={item.id}>
              <strong>{item.pair}</strong>
              <p>{item.message}</p>
              <span>{new Date(item.createdAt).toLocaleString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
