"use client";

type ExecutionScoreCardProps = {
  score?: number | null;
};

export default function ExecutionScoreCard({
  score,
}: ExecutionScoreCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <p className="text-sm text-slate-400">Execution score</p>
      <h2 className="mt-2 text-3xl font-semibold text-white">
        {typeof score === "number" ? score : "--"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Legacy score card placeholder.
      </p>
    </div>
  );
}