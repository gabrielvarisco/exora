"use client";

type RouteSummaryCardProps = {
  title?: string;
  value?: string;
};

export function RouteSummaryCard({
  title = "Route summary",
  value = "No data",
}: RouteSummaryCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
      <p className="text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">{value}</h2>
    </div>
  );
}