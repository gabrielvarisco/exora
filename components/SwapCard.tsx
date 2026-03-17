"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { formatUnits as viemFormatUnits } from "viem";
import ChainSelector from "@/components/ChainSelector";
import {
  getChainById,
  getChainByKey,
  getDefaultChainKey,
  type SupportedChainKey,
} from "@/lib/chains";
import {
  getTokenBySymbol,
  getTokensForChain,
  isNativeTokenAddress,
  type TokenOption,
} from "@/lib/tokens";

type PriceResponse = {
  chain: SupportedChainKey;
  sellToken: {
    symbol: string;
    decimals: number;
  };
  buyToken: {
    symbol: string;
    decimals: number;
  };
  price: {
    buyAmount?: string;
    sellAmount?: string;
    totalNetworkFee?: string;
    issues?: {
      allowance?: {
        spender?: string;
      };
      balance?: {
        token?: string;
        actual?: string;
        expected?: string;
      };
    };
    route?: {
      fills?: Array<{
        source?: string;
        proportionBps?: string;
      }>;
    };
  };
  error?: string;
};

type TokenPickerProps = {
  value?: TokenOption;
  tokens: TokenOption[];
  chainKey: SupportedChainKey;
  placeholder?: string;
  onChange: (symbol: string) => void;
};

function formatTokenAmount(value?: string, decimals = 18) {
  if (!value) return "0";

  try {
    const formatted = viemFormatUnits(BigInt(value), decimals);
    const asNumber = Number(formatted);

    if (Number.isNaN(asNumber)) {
      return formatted;
    }

    return asNumber.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  } catch {
    return "0";
  }
}

function sanitizeAmountInput(value: string) {
  const sanitized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parts = sanitized.split(".");

  if (parts.length <= 1) return sanitized;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

function networkPillClass(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "bg-cyan-400/15 text-cyan-300";
  if (chainKey === "ethereum") return "bg-violet-400/15 text-violet-300";
  return "bg-amber-400/15 text-amber-300";
}

function tokenIconClass(icon: TokenOption["icon"]) {
  switch (icon) {
    case "eth":
    case "weth":
      return "bg-violet-500 text-white";
    case "usdc":
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
      return "$";
    case "bnb":
      return "B";
    case "wbnb":
      return "W";
    default:
      return symbol.slice(0, 1).toUpperCase();
  }
}

function chainShortLabel(chainKey: SupportedChainKey) {
  if (chainKey === "base") return "Base";
  if (chainKey === "ethereum") return "ETH";
  return "BSC";
}

function TokenPill({
  token,
  chainKey,
}: {
  token?: TokenOption;
  chainKey: SupportedChainKey;
}) {
  if (!token) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-full bg-slate-700" />
        <span className="text-sm font-semibold text-white">Select</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${tokenIconClass(
          token.icon
        )}`}
      >
        {tokenIconLabel(token.icon, token.symbol)}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white">{token.symbol}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${networkPillClass(
            chainKey
          )}`}
        >
          {chainShortLabel(chainKey)}
        </span>
      </div>
    </div>
  );
}

function TokenPicker({
  value,
  tokens,
  chainKey,
  placeholder = "Selecionar token",
  onChange,
}: TokenPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-[164px] items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-left transition hover:bg-white/10"
      >
        {value ? (
          <TokenPill token={value} chainKey={chainKey} />
        ) : (
          <span className="text-sm font-medium text-white">{placeholder}</span>
        )}

        <span className="text-sm text-slate-300">▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[260px] rounded-2xl border border-white/10 bg-[#121826] p-2 shadow-2xl shadow-black/40">
          {tokens.map((token) => (
            <button
              key={`${chainKey}-${token.symbol}`}
              type="button"
              onClick={() => {
                onChange(token.symbol);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${tokenIconClass(
                    token.icon
                  )}`}
                >
                  {tokenIconLabel(token.icon, token.symbol)}
                </div>

                <div>
                  <div className="text-sm font-semibold text-white">
                    {token.symbol}
                  </div>
                  <div className="text-xs text-slate-400">{token.name}</div>
                </div>
              </div>

              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${networkPillClass(
                  chainKey
                )}`}
              >
                {chainShortLabel(chainKey)}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function SwapCard() {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();

  const walletChain = getChainById(walletChainId);

  const [chain, setChain] = useState<SupportedChainKey>(
    walletChain?.key ?? getDefaultChainKey()
  );

  const tokens = useMemo(() => getTokensForChain(chain), [chain]);

  const [sellSymbol, setSellSymbol] = useState<string>(
    getTokensForChain(chain)[0]?.symbol ?? ""
  );
  const [buySymbol, setBuySymbol] = useState<string>(
    getTokensForChain(chain)[1]?.symbol ?? ""
  );
  const [amount, setAmount] = useState("0");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!walletChain?.key) return;
    if (walletChain.key === chain) return;

    const nextTokens = getTokensForChain(walletChain.key);

    setChain(walletChain.key);
    setSellSymbol(nextTokens[0]?.symbol ?? "");
    setBuySymbol(nextTokens[1]?.symbol ?? "");
    setResult(null);
    setError("");
  }, [walletChain?.key, chain]);

  const selectedChain = getChainByKey(chain);
  const sellToken = getTokenBySymbol(chain, sellSymbol);
  const buyToken = getTokenBySymbol(chain, buySymbol);

  const sellTokenIsNative = isNativeTokenAddress(sellToken?.address);

  const sellBalance = useBalance({
    address,
    chainId: selectedChain?.chainId,
    token: !sellTokenIsNative && sellToken
      ? (sellToken.address as `0x${string}`)
      : undefined,
    query: {
      enabled: Boolean(address && selectedChain?.chainId && sellToken),
    },
  });

  async function handleAnalyze() {
    setError("");
    setResult(null);

    try {
      setIsLoading(true);

      const response = await fetch("/api/price", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chain,
          sellSymbol,
          buySymbol,
          amount,
          taker: address,
        }),
      });

      const data = (await response.json()) as PriceResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to get price");
      }

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected price error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFlip() {
    const currentSell = sellSymbol;
    setSellSymbol(buySymbol);
    setBuySymbol(currentSell);
    setResult(null);
    setError("");
  }

  async function handleChainChange(value: SupportedChainKey) {
    const nextChain = getChainByKey(value);
    if (!nextChain) return;

    setError("");

    try {
      if (isConnected && walletChainId !== nextChain.chainId) {
        await switchChainAsync({ chainId: nextChain.chainId });
      }

      const nextTokens = getTokensForChain(value);

      setChain(value);
      setSellSymbol(nextTokens[0]?.symbol ?? "");
      setBuySymbol(nextTokens[1]?.symbol ?? "");
      setResult(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to switch network";
      setError(message);
    }
  }

  const sellDisplayValue = amount === "" ? "0" : amount;
  const buyDisplayValue = result?.price?.buyAmount
    ? formatTokenAmount(result.price.buyAmount, result.buyToken.decimals)
    : "0";

  return (
    <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Exora Analyzer
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Real multi-chain route pricing
          </h2>
        </div>

        <ChainSelector
          value={chain}
          onChange={handleChainChange}
          disabled={isSwitchingChain}
        />
      </div>

      <div className="space-y-3">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Vender</span>
            <span>{isConnected ? "Carteira conectada" : "Carteira opcional"}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <input
                value={amount}
                onChange={(e) => {
                  setAmount(sanitizeAmountInput(e.target.value));
                  setResult(null);
                  setError("");
                }}
                placeholder="0"
                inputMode="decimal"
                className="w-full bg-transparent text-5xl font-semibold leading-none text-white outline-none placeholder:text-slate-500"
              />

              <p className="mt-2 text-sm text-slate-400">
                {sellBalance.data
                  ? `Balance: ${Number(sellBalance.data.formatted).toFixed(4)} ${sellBalance.data.symbol}`
                  : `Balance: 0 ${sellSymbol || ""}`}
              </p>
            </div>

            <TokenPicker
              value={sellToken}
              tokens={tokens}
              chainKey={chain}
              onChange={(symbol) => {
                setSellSymbol(symbol);
                setResult(null);
                setError("");
              }}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-[#161d2d] text-xl text-white transition hover:bg-white/10"
          >
            ↓
          </button>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Comprar</span>
            <span>Output estimado</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-5xl font-semibold leading-none text-slate-300">
                {buyDisplayValue}
              </div>

              <p className="mt-2 text-sm text-slate-500">
                {buyToken ? buyToken.name : "Selecionar token"}
              </p>
            </div>

            <TokenPicker
              value={buyToken}
              tokens={tokens.filter((token) => token.symbol !== sellSymbol)}
              chainKey={chain}
              placeholder="Selecionar token"
              onChange={(symbol) => {
                setBuySymbol(symbol);
                setResult(null);
                setError("");
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={isLoading || isSwitchingChain}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
      >
        {isSwitchingChain
          ? "Switching network..."
          : isLoading
            ? "Analyzing..."
            : isConnected
              ? "Analyze Best Route"
              : "Conectar carteira"}
      </button>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Estimated buy amount</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {formatTokenAmount(result.price.buyAmount, result.buyToken.decimals)}{" "}
              {buySymbol}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Sell amount</p>
              <p className="mt-1 text-white">
                {formatTokenAmount(result.price.sellAmount, result.sellToken.decimals)}{" "}
                {sellSymbol}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Network fee</p>
              <p className="mt-1 text-white">
                {result.price.totalNetworkFee
                  ? formatTokenAmount(result.price.totalNetworkFee, 18)
                  : "0"}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Allowance spender</p>
            <p className="mt-1 break-all text-xs text-slate-300">
              {result.price.issues?.allowance?.spender ??
                "Not required for native token"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Route sources</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {result.price.route?.fills?.length ? (
                result.price.route.fills.map((fill, index) => (
                  <span
                    key={`${fill.source ?? "source"}-${index}`}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-300"
                  >
                    {fill.source ?? "Unknown"}
                    {fill.proportionBps ? ` · ${fill.proportionBps} bps` : ""}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">
                  No route breakdown returned.
                </span>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}