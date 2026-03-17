import SwapCard from "@/components/SwapCard";

export default function AnalyzerPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-cyan-300">
            Execution intelligence
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Compare real swap pricing before execution
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Exora now prices routes through 0x across Base, Ethereum and BNB
            Chain.
          </p>
        </div>

        <div className="flex justify-center">
          <SwapCard />
        </div>
      </div>
    </main>
  );
}
