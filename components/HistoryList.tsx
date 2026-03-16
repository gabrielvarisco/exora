"use client";

import { useEffect, useState } from "react";
import { loadHistory } from "@/lib/storage";
import { SavedAnalysis } from "@/lib/types";
import { money } from "@/lib/format";

export default function HistoryList() {
  const [items, setItems] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  return (
    <div className="stack-page shell narrow-shell">
      <div className="page-copy">
        <span className="eyebrow">Recent analyses</span>
        <h1>Route history</h1>
        <p>Review previous analyzer runs saved locally in the browser.</p>
      </div>

      <div className="stack-list">
        {items.length === 0 ? (
          <div className="glass-card empty-state">No saved analyses yet.</div>
        ) : (
          items.map((item) => (
            <div className="glass-card history-item" key={item.id}>
              <div>
                <strong>{item.tokenIn}/{item.tokenOut}</strong>
                <span>{item.chain}</span>
              </div>
              <div>
                <strong>{item.bestDex ?? "—"}</strong>
                <span>Best venue</span>
              </div>
              <div>
                <strong>{item.executionScore ?? 0}</strong>
                <span>Score</span>
              </div>
              <div>
                <strong>{item.estimatedOutput ? money(item.estimatedOutput, 4) : "—"}</strong>
                <span>Output</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
