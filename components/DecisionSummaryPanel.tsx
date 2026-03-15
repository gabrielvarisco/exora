import type { AnalysisSummary } from '@/lib/types';

export function DecisionSummaryPanel({ summary }: { summary: AnalysisSummary }) {
  return (
    <div className="panel content-panel stack-sm">
      <div className="label">Decision summary</div>
      <p className="summary-copy">{summary.textualSummary}</p>
      <div className="list-stack">
        {summary.decisionSummary.map((item) => <div key={item} className="list-item">{item}</div>)}
      </div>
      <div className="coverage-box">
        {summary.coverageNotes.map((note) => <div key={note} className="coverage-note">{note}</div>)}
      </div>
    </div>
  );
}
