"use client";

type DecisionSummaryPanelProps = {
  summary?: unknown;
};

export function DecisionSummaryPanel({
  summary,
}: DecisionSummaryPanelProps) {
  if (!summary) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Decision summary</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            No summary available yet
          </h2>
        </div>

        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-base text-slate-300">
            Run an analysis to generate a decision summary.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Decision summary</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          Summary generated
        </h2>
      </div>

      <pre className="overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
        {JSON.stringify(summary, null, 2)}
      </pre>
    </div>
  );
}