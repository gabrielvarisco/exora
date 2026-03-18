"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useBalance, useReadContract } from "wagmi";
import type { SupportedChainKey } from "@/lib/chains";
import type { TokenOption } from "@/lib/tokens";
import { isNativeTokenAddress } from "@/lib/tokens";

type Props = {
  chainKey: SupportedChainKey;
  chainId: number;
  value?: TokenOption;
  tokens: TokenOption[];
  onChange: (symbol: string) => void;
  placeholder?: string;
  excludeSymbols?: string[];
};

function tokenIconClass(icon: TokenOption["icon"]) {
  switch (icon) {
    case "eth":
    case "weth":
      return "bg-violet-500 text-white";
    case "usdc":
    case "usdt":
      return "bg-blue-500 text-white";
    case "bnb":
    case "wbnb":
      return "bg-amber-400 text-slate-950";
    default:
      return "bg-slate-600 text-white";
  }
}

function tokenIconLabel(icon: TokenOption["icon"], symbol: string) {
  switch (icon) {
    case "eth":
      return "Ξ";
    case "weth":
      return "W";
    case "usdc":
    case "usdt":
      return "$";
    case "bnb":
      return "B";
    case "wbnb":
      return "W";
    default:
      return symbol.slice(0, 1).toUpperCase();
  }
}

function networkPillClass(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "bg-cyan-400/15 text-cyan-300";
  if (chainKey === "ethereum") return "bg-violet-400/15 text-violet-300";
  return "bg-amber-400/15 text-amber-300";
}

function chainShortLabel(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "Base";
  if (chainKey === "ethereum") return "ETH";
  return "BSC";
}

function formatCompactBalance(formatted?: string) {
  const num = Number(formatted ?? "0");

  if (!Number.isFinite(num) || num === 0) return "0";
  if (num < 0.000001) return "<0,000001";

  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 0.01 ? 6 : 4,
  });
}

function TokenRow({
  chainKey,
  chainId,
  token,
  onSelect,
}: {
  chainKey: SupportedChainKey;
  chainId: number;
  token: TokenOption;
  onSelect: (symbol: string) => void;
}) {
  const { address } = useAccount();
  const isNative = isNativeTokenAddress(token.address);

  const nativeBalance = useBalance({
    address,
    chainId,
    query: {
      enabled: Boolean(address && chainId && isNative),
    },
  });

  const erc20Balance = useReadContract({
    address: !isNative ? (token.address as `0x${string}`) : undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId,
    query: {
      enabled: Boolean(address && chainId && !isNative),
    },
  });

  let formatted = "0";
  if (isNative) {
    formatted = nativeBalance.data?.formatted ?? "0";
  } else if (typeof erc20Balance.data === "bigint") {
    formatted = formatUnits(erc20Balance.data, token.decimals);
  }

  const amount = formatCompactBalance(formatted);
  const numeric = Number(formatted);
  const hasBalance = Number.isFinite(numeric) && numeric > 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(token.symbol)}
      className="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left transition hover:bg-white/5"
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${tokenIconClass(
            token.icon
          )}`}
        >
          {tokenIconLabel(token.icon, token.symbol)}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              {token.symbol}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${networkPillClass(
                chainKey
              )}`}
            >
              {chainShortLabel(chainKey)}
            </span>
          </div>

          <div className="text-xs text-slate-400">{token.name}</div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm font-semibold text-white">{amount}</div>
        <div className="text-[11px] text-slate-500">
          {hasBalance ? "saldo detectado" : ""}
        </div>
      </div>
    </button>
  );
}

export default function AssetPicker({
  chainKey,
  chainId,
  value,
  tokens,
  onChange,
  placeholder = "Selecionar token",
  excludeSymbols = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredBaseTokens = useMemo(() => {
    const exclude = new Set(excludeSymbols.map((s) => s.toLowerCase()));
    return tokens.filter((token) => !exclude.has(token.symbol.toLowerCase()));
  }, [tokens, excludeSymbols]);

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

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return filteredBaseTokens;

    return filteredBaseTokens.filter((token) => {
      const full = `${token.symbol} ${token.name}`.toLowerCase();
      return full.includes(q);
    });
  }, [search, filteredBaseTokens]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex min-w-[176px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10"
      >
        {value ? (
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${tokenIconClass(
                value.icon
              )}`}
            >
              {tokenIconLabel(value.icon, value.symbol)}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">
                {value.symbol}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${networkPillClass(
                  chainKey
                )}`}
              >
                {chainShortLabel(chainKey)}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-sm font-medium text-white">{placeholder}</span>
        )}

        <span className="text-sm text-slate-300">▾</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-16">
          <div className="w-full max-w-[420px] rounded-3xl border border-white/10 bg-[#101318] shadow-2xl shadow-black/60">
            <div className="flex items-center justify-between px-5 pb-3 pt-4">
              <div className="text-xl font-semibold text-white">
                Selecione um token
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-2xl text-slate-400 transition hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="px-4 pb-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Procurar tokens"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-3 pb-4">
              <div className="px-2 pb-2 pt-1 text-sm font-semibold text-slate-300">
                Tokens
              </div>

              <div className="space-y-1">
                {searched.map((token) => (
                  <TokenRow
                    key={`${chainKey}-${token.symbol}`}
                    chainKey={chainKey}
                    chainId={chainId}
                    token={token}
                    onSelect={(symbol) => {
                      onChange(symbol);
                      setOpen(false);
                      setSearch("");
                    }}
                  />
                ))}

                {searched.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-slate-400">
                    Nenhum token encontrado.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
