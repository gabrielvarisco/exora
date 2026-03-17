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
    onComplete?.({ chain, sellSymbol, buySymbol, amount });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-[#10182b]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value as SupportedChainKey)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        >
          {SUPPORTED_CHAINS.map((item) => (
            <option key={item.key} value={item.key} className="bg-slate-950 text-white">
              {item.label}
            </option>
          ))}
        </select>

        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder="0.01"
        />

        <input
          value={sellSymbol}
          onChange={(e) => setSellSymbol(e.target.value.toUpperCase())}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder="ETH"
        />

        <input
          value={buySymbol}
          onChange={(e) => setBuySymbol(e.target.value.toUpperCase())}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
          placeholder="USDC"
        />
      </div>

      <button
        type="submit"
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-semibold text-slate-950"
      >
        Start analysis
      </button>
    </form>
  );
}