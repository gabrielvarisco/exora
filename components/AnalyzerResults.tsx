"use client";

type AnalyzerResultsProps = {
  result?: unknown;
};

export default function AnalyzerResults({ result }: AnalyzerResultsProps) {
  if (!result) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mb-4">
          <p className="text-sm text-slate-400">Analyzer results</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">
            No analysis result yet
          </h2>
        </div>

        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-base text-slate-300">
            Run a route analysis to populate this panel.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Future results can include output estimate, route source, gas and execution quality.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="mb-4">
        <p className="text-sm text-slate-400">Analyzer results</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          Analysis completed
        </h2>
      </div>

      <pre className="overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
