"use client";

type AlertItem = {
  id: string;
  title: string;
  description: string;
  severity?: "low" | "medium" | "high";
};

export default function AlertsList({ alerts }: { alerts: AlertItem[] }) {
  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-base text-slate-300">No alerts yet.</p>
        <p className="mt-2 text-sm text-slate-500">
          Run analyses to generate future alert items.
        </p>
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
