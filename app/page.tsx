import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-145px)] bg-slate-950 text-white">
      <section className="mx-auto flex max-w-6xl items-center justify-between gap-12 px-6 py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-cyan-300">
            Execution intelligence
          </p>

          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            Find the best swap route before you execute
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Exora compares visible DEX liquidity, slippage risk, gas burden and
            execution quality so you can choose the strongest route with
            confidence.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/analyzer"
              className="rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 font-medium text-slate-950 transition hover:opacity-95"
            >
              Open Analyzer
            </Link>

            <Link
              href="/history"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-medium text-white transition hover:bg-white/10"
            >
              View History
            </Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-slate-400">Purpose</p>
              <p className="mt-2 text-xl font-semibold text-white">
                Execution-first
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-slate-400">Focus</p>
              <p className="mt-2 text-xl font-semibold text-white">
                Routes · Slippage · Gas
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-sm text-slate-400">Data policy</p>
              <p className="mt-2 text-xl font-semibold text-white">
                No fake coverage
              </p>
            </div>
          </div>
        </div>

        <div className="hidden w-full max-w-md lg:block">
          <div className="rounded-[32px] border border-white/10 bg-[#10182b]/90 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
                Exora preview
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Decision before execution
              </h2>
            </div>

            <div className="space-y-3">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Sell</span>
                  <span>Token in</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-semibold text-white">1</span>
                  <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">
                    ETH
                  </span>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white">
                  ↓
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-300">
                  <span>Buy</span>
                  <span>Token out</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-semibold text-slate-300">?</span>
                  <span className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-white">
                    USDC
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/analyzer"
              className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-center text-base font-semibold text-slate-950 transition hover:opacity-95"
            >
              Analyze Best Route
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
