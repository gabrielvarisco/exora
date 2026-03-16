export default function DecisionPanel({ summary, note }: { summary: string; note: string }) {
  return (
    <div className="glass-card decision-card">
      <h3>Decision summary</h3>
      <p>{summary}</p>
      <div className="callout-note">{note}</div>
    </div>
  );
}
