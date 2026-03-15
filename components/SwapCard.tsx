"use client";

type SwapCardProps = {
  chain: string;
  tokenIn: string;
  tokenOut: string;
  amount: string;
  onChainChange: (value: string) => void;
  onTokenInChange: (value: string) => void;
  onTokenOutChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onFlip: () => void;
  onAnalyze: () => void;
  isLoading: boolean;
};

const CHAINS = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Base", value: "base" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Polygon", value: "polygon" },
  { label: "BSC", value: "bsc" },
];

export default function SwapCard({
  chain,
  tokenIn,
  tokenOut,
  amount,
  onChainChange,
  onTokenInChange,
  onTokenOutChange,
  onAmountChange,
  onFlip,
  onAnalyze,
  isLoading,
}: SwapCardProps) {
  return (
    <div className="mx-auto w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Exora Analyzer
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            Compare execution before swap
          </h2>
        </div>

        <select
          value={chain}
          onChange={(e) => onChainChange(e.target.value)}
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
        >
          {CHAINS.map((item) => (
            <option key={item.value} value={item.value} className="bg-slate-900">
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Sell</span>
            <span>Token In</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <input
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              placeholder="0.0"
              inputMode="decimal"
              className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-slate-500"
            />

            <input
              value={tokenIn}
              onChange={(e) => onTokenInChange(e.target.value.toUpperCase())}
              placeholder="ETH"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-lg font-medium text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={onFlip}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10"
          >
            ↓
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Buy</span>
            <span>Token Out</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <div className="flex items-center text-3xl font-semibold text-slate-500">
              ?
            </div>

            <input
              value={tokenOut}
              onChange={(e) => onTokenOutChange(e.target.value.toUpperCase())}
              placeholder="USDC"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-lg font-medium text-white outline-none placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isLoading}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
      >
        {isLoading ? "Analyzing..." : "Analyze Best Route"}
      </button>

      <p className="mt-3 text-center text-xs text-slate-400">
        Real public market data only. When coverage is limited, Exora shows that clearly.
      </p>
    </div>
  );
}
