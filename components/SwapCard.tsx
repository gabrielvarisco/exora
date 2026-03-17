"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getTokensForChain } from "@/lib/tokens";

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

function formatTokenAmount(value?: string, decimals = 18) {
  if (!value) return "-";

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
    return "-";
  }
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
  const [amount, setAmount] = useState("0.01");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PriceResponse | null>(null);
  const [error, setError] = useState("");

  // 1) Sempre que a wallet trocar de rede, sincroniza o analyzer
  useEffect(() => {
    if (!walletChain?.key) return;
    if (walletChain.key === chain) return;

    const nextTokens = getTokensForChain(walletChain.key);

    setChain(walletChain.key);
    setSellSymbol(nextTokens[0]?.symbol ?? "");
    setBuySymbol(nextTokens[1]?.symbol ?? "");
    setResult(null);
    setError("");
  }, [walletChain?.key]);

  // 2) Balance preso na chain do analyzer
  const selectedChain = getChainByKey(chain);

  const nativeBalance = useBalance({
    address,
    chainId: selectedChain?.chainId,
    query: {
      enabled: Boolean(address && selectedChain?.chainId),
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
      // 3) Se a wallet estiver conectada, trocar no card troca a wallet também
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

  return (
    <div className="w-full max-w-xl rounded-[28px] border border-white/10 bg-[#0f172a]/80 p-5 shadow-2xl shadow-black/30 backdrop-blur">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">
            Exora Analyzer
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
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
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Sell</span>
            <span>
              {isConnected ? "Wallet connected" : "Wallet optional for price"}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              inputMode="decimal"
              className="w-full bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-slate-500"
            />

            <select
              value={sellSymbol}
              onChange={(e) => setSellSymbol(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-lg font-medium text-white outline-none"
            >
              {tokens.map((token) => (
                <option
                  key={token.symbol}
                  value={token.symbol}
                  className="bg-slate-900 text-white"
                >
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-2 text-xs text-slate-400">
            {nativeBalance.data
              ? `Native balance: ${Number(nativeBalance.data.formatted).toFixed(4)} ${nativeBalance.data.symbol}`
              : `Native balance: --`}
          </p>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleFlip}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10"
          >
            ↓
          </button>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
            <span>Buy</span>
            <span>Route output</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_160px]">
            <div className="flex items-center text-3xl font-semibold text-slate-400">
              {result?.price?.buyAmount
                ? formatTokenAmount(result.price.buyAmount, result.buyToken.decimals)
                : "?"}
            </div>

            <select
              value={buySymbol}
              onChange={(e) => setBuySymbol(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right text-lg font-medium text-white outline-none"
            >
              {tokens.map((token) => (
                <option
                  key={token.symbol}
                  value={token.symbol}
                  className="bg-slate-900 text-white"
                >
                  {token.symbol}
                </option>
              ))}
            </select>
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
            : "Analyze Best Route"}
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
                  : "-"}
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