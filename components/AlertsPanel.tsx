"use client";

type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity?: "low" | "medium" | "high";
};

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  if (!alerts.length) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Risk monitoring</p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              No alerts yet
            </h2>
          </div>

          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            Client-side only
          </span>
        </div>

        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-base text-slate-300">
            Alerts will appear here when Exora detects high slippage, weak liquidity or route risk.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            This panel is ready for future monitoring logic and saved warning rules.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
        >
          <p className="text-sm text-slate-400">
            {alert.severity ? alert.severity.toUpperCase() : "INFO"}
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {alert.title}
          </h3>
          <p className="mt-2 text-sm text-slate-300">{alert.description}</p>
        </div>
      ))}
    </div>
  );
}
