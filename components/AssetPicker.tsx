"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
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

type TokenWithBalance = TokenOption & {
  formattedBalance: string;
  numericBalance: number;
  hasBalance: boolean;
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

function parseBalance(raw: string, decimals: number) {
  try {
    const formatted = formatUnits(BigInt(raw), decimals);
    const num = Number(formatted);

    if (!Number.isFinite(num) || num <= 0) {
      return { label: "0", numeric: 0 };
    }

    if (num < 0.000001) {
      return { label: "<0,000001", numeric: num };
    }

    return {
      label: num.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: num < 0.01 ? 6 : 4,
      }),
      numeric: num,
    };
  } catch {
    return { label: "0", numeric: 0 };
  }
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
  const { address } = useAccount();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const filteredBaseTokens = useMemo(() => {
    const exclude = new Set(excludeSymbols.map((s) => s.toLowerCase()));
    return tokens.filter((token) => !exclude.has(token.symbol.toLowerCase()));
  }, [tokens, excludeSymbols]);

  const nativeToken = filteredBaseTokens.find((token) =>
    isNativeTokenAddress(token.address)
  );

  const erc20Tokens = filteredBaseTokens.filter(
    (token) => !isNativeTokenAddress(token.address)
  );

  const nativeBalance = useBalance({
    address,
    chainId,
    query: {
      enabled: Boolean(address && nativeToken && chainId),
    },
  });

  const erc20Balances = useReadContracts({
    contracts: address
      ? erc20Tokens.map((token) => ({
          address: token.address as `0x${string}`,
          abi: erc20Abi,
          functionName: "balanceOf",
          args: [address],
          chainId,
        }))
      : [],
    query: {
      enabled: Boolean(address && erc20Tokens.length > 0 && chainId),
    },
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

  const tokensWithBalances = useMemo<TokenWithBalance[]>(() => {
    return filteredBaseTokens.map((token) => {
      if (isNativeTokenAddress(token.address)) {
        const raw = nativeBalance.data?.value?.toString() ?? "0";
        const parsed = parseBalance(raw, token.decimals);

        return {
          ...token,
          formattedBalance: parsed.label,
          numericBalance: parsed.numeric,
          hasBalance: parsed.numeric > 0,
        };
      }

      const index = erc20Tokens.findIndex(
        (item) => item.address.toLowerCase() === token.address.toLowerCase()
      );

      const result = index >= 0 ? erc20Balances.data?.[index] : undefined;

      const raw =
        result &&
        result.status === "success" &&
        typeof result.result === "bigint"
          ? result.result.toString()
          : "0";

      const parsed = parseBalance(raw, token.decimals);

      return {
        ...token,
        formattedBalance: parsed.label,
        numericBalance: parsed.numeric,
        hasBalance: parsed.numeric > 0,
      };
    });
  }, [filteredBaseTokens, nativeBalance.data, erc20Balances.data, erc20Tokens]);

  const searched = useMemo(() => {
    const q = search.trim().toLowerCase();

    const baseList =
      q.length === 0
        ? tokensWithBalances
        : tokensWithBalances.filter((token) => {
            const full = `${token.symbol} ${token.name}`.toLowerCase();
            return full.includes(q);
          });

    const owned = baseList.filter((token) => token.hasBalance);
    const rest = baseList.filter((token) => !token.hasBalance);

    return { owned, rest };
  }, [search, tokensWithBalances]);

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
              {searched.owned.length > 0 ? (
                <>
                  <div className="px-2 pb-2 pt-1 text-sm font-semibold text-slate-300">
                    Seus tokens
                  </div>

                  <div className="space-y-1 pb-3">
                    {searched.owned.map((token) => (
                      <button
                        key={`${chainKey}-${token.symbol}`}
                        type="button"
                        onClick={() => {
                          onChange(token.symbol);
                          setOpen(false);
                          setSearch("");
                        }}
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

                            <div className="text-xs text-slate-400">
                              {token.name}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-semibold text-white">
                            {token.formattedBalance}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            saldo detectado
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="px-2 pb-2 pt-1 text-sm font-semibold text-slate-300">
                {searched.owned.length > 0 ? "Todos os tokens" : "Tokens"}
              </div>

              <div className="space-y-1">
                {searched.rest.map((token) => (
                  <button
                    key={`${chainKey}-${token.symbol}`}
                    type="button"
                    onClick={() => {
                      onChange(token.symbol);
                      setOpen(false);
                      setSearch("");
                    }}
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

                        <div className="text-xs text-slate-400">
                          {token.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-300">
                        {token.formattedBalance}
                      </div>
                    </div>
                  </button>
                ))}

                {searched.owned.length === 0 && searched.rest.length === 0 ? (
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