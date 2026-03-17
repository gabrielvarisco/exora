"use client";

type AnalyzerResultsProps = {
  result?: unknown;
};

export default function AnalyzerResults({ result }: AnalyzerResultsProps) {
  if (!result) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <p className="text-sm text-slate-400">Analyzer results</p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          No analysis result yet
        </h2>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <p className="mb-4 text-sm text-slate-400">Analyzer results</p>
      <pre className="overflow-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-300">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}