"use client";

import { useState } from "react";
import { SUPPORTED_CHAINS, type SupportedChainKey } from "@/lib/chains";

type AnalyzerFormProps = {
  onStart?: () => void;
  onComplete?: (payload: {
    chain: SupportedChainKey;
    sellSymbol: string;
    buySymbol: string;
    amount: string;
  }) => void;
};

export default function AnalyzerForm({
  onStart,
  onComplete,
}: AnalyzerFormProps) {
  const [chain, setChain] = useState<SupportedChainKey>("base");
  const [sellSymbol, setSellSymbol] = useState("ETH");
  const [buySymbol, setBuySymbol] = useState("USDC");
  const [amount, setAmount] = useState("0.01");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    onStart?.();
    onComplete?.({
      chain,
      sellSymbol,
      buySymbol,
      amount,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
          Exora form
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-white">
          Manual route input
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Chain</span>
          <select
            value={chain}
            onChange={(e) => setChain(e.target.value as SupportedChainKey)}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          >
            {SUPPORTED_CHAINS.map((item) => (
              <option
                key={item.key}
                value={item.key}
                className="bg-slate-950 text-white"
              >
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Amount</span>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Sell token</span>
          <input
            value={sellSymbol}
            onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
            placeholder="ETH"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-slate-300">Buy token</span>
          <input
            value={buySymbol}
            onChange={(e) => setBuySymbol(e.target.value.toUpperCase())}
            placeholder="USDC"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-semibold text-slate-950 transition hover:opacity-95"
      >
        Start analysis
      </button>
    </form>
  );
}
