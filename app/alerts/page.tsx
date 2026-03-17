export default function AlertsPage() {
  return (
    <main className="min-h-[calc(100vh-145px)] bg-slate-950 px-6 py-14 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">
            Monitoring
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Alerts
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Locally saved reminders generated after analysis runs with notable execution risk.
          </p>
        </div>

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
              This page is ready for future monitoring logic and saved warning rules.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
