"use client";

type ExecuteSwapButtonProps = {
  route?: {
    source?: string;
  } | null;
};

export function ExecuteSwapButton({ route }: ExecuteSwapButtonProps) {
  const source = route?.source ?? "External source";

  return (
    <button
      type="button"
      disabled
      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-400 opacity-70"
      title="Direct execution is not enabled in this legacy component."
    >
      Execute via {source}
    </button>
  );
}