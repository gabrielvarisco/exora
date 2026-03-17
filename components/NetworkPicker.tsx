"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  getChainByKey,
  getSupportedChainsFromEnv,
  type SupportedChainKey,
} from "@/lib/chains";

type Props = {
  value: SupportedChainKey;
  onChange: (value: SupportedChainKey) => void;
  disabled?: boolean;
};

function networkPillClass(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "bg-cyan-400/15 text-cyan-300";
  if (chainKey === "ethereum") return "bg-violet-400/15 text-violet-300";
  return "bg-amber-400/15 text-amber-300";
}

function networkIconClass(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "bg-cyan-500 text-slate-950";
  if (chainKey === "ethereum") return "bg-violet-500 text-white";
  return "bg-amber-400 text-slate-950";
}

function networkIconLabel(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "B";
  if (chainKey === "ethereum") return "Ξ";
  return "BN";
}

function shortLabel(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "Base";
  if (chainKey === "ethereum") return "ETH";
  return "BSC";
}

export default function NetworkPicker({
  value,
  onChange,
  disabled = false,
}: Props) {
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const chains = useMemo(() => getSupportedChainsFromEnv(), []);

  const baseBalance = useBalance({
    address,
    chainId: 8453,
    query: { enabled: Boolean(address) },
  });

  const ethBalance = useBalance({
    address,
    chainId: 1,
    query: { enabled: Boolean(address) },
  });

  const bscBalance = useBalance({
    address,
    chainId: 56,
    query: { enabled: Boolean(address) },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selected = getChainByKey(value);

  function balanceFor(chainKey: SupportedChainKey) {
    if (chainKey === "base") return baseBalance.data;
    if (chainKey === "ethereum") return ethBalance.data;
    return bscBalance.data;
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${networkIconClass(
            value
          )}`}
        >
          {networkIconLabel(value)}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {selected?.label ?? "Network"}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${networkPillClass(
              value
            )}`}
          >
            {shortLabel(value)}
          </span>
        </div>

        <span className="text-sm text-slate-300">▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[300px] rounded-3xl border border-white/10 bg-[#101318] p-3 shadow-2xl shadow-black/50">
          <div className="mb-2 px-2 text-sm font-semibold text-white">
            Selecione uma rede
          </div>

          <div className="space-y-1">
            {chains.map((chain) => {
              const balance = balanceFor(chain.key);

              return (
                <button
                  key={chain.key}
                  type="button"
                  onClick={() => {
                    onChange(chain.key);
                    setOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${networkIconClass(
                        chain.key
                      )}`}
                    >
                      {networkIconLabel(chain.key)}
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-white">
                        {chain.label}
                      </div>
                      <div className="text-xs text-slate-400">
                        {chain.nativeSymbol}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {balance
                        ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}`
                        : `0 ${chain.nativeSymbol}`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {shortLabel(chain.key)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}