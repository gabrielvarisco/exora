"use client";

import { getSupportedChainsFromEnv, type SupportedChainKey } from "@/lib/chains";

type Props = {
  value: SupportedChainKey;
  onChange: (value: SupportedChainKey) => void;
};

export default function ChainSelector({ value, onChange }: Props) {
  const chains = getSupportedChainsFromEnv();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SupportedChainKey)}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
    >
      {chains.map((chain) => (
        <option key={chain.key} value={chain.key} className="bg-slate-950 text-white">
          {chain.label}
        </option>
      ))}
    </select>
  );
}
