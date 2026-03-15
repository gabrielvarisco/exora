"use client";

import { useMemo, useState } from "react";
import SwapCard from "@/components/SwapCard";

type RouteResult = {
  dex: string;
  output: number;
  gas: number;
  slippage: number;
  liquidity: number;
  volume: number;
};

type AnalyzeResponse = {
  routes?: RouteResult[];
  error?: string;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

function getExecutionScore(route: RouteResult) {
  let score = 50;

  if (route.liquidity >= 1_000_000) score += 20;
  else if (route.liquidity >= 250_000) score += 12;
  else if (route.liquidity >= 50_000) score += 6;

  if (route.volume >= 1_000_000) score += 12;
  else if (route.volume >= 250_000) score += 8;
  else if (route.volume >= 50_000) score += 4;

  if (route.slippage <= 0.0025) score += 10;
  else if (route.slippage <= 0.005) score += 6;
  else if (route.slippage <= 0.01) score += 2;
  else score -= 6;

  if (route.gas <= 8) score += 8;
  else if (route.gas <= 15) score += 4;
  else score -= 4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Decent";
  if (score >= 40) return "Weak";
  return "High risk";
}

export default function AnalyzerClient() {
  const [chain, setChain] = useState("ethereum");
  const [tokenIn, setTokenIn] = useState("ETH");
  const [tokenOut, setTokenOut] = useState("USDC");
  const [amount, setAmount] = useState("1");
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    setError("");
    setRoutes([]);

    if (!tokenIn || !tokenOut || !amount) {
      setError("Fill chain, token pair and amount before analyzing.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chain,
          tokenIn,
          tokenOut,
          amount,
        }),
      });

      const data: AnalyzeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze routes.");
      }

      if (!data.routes || data.routes.length === 0) {
        setError("No real route candidates found for this pair in the current public data coverage.");
        return;
      }

      const sorted = [...data.routes].sort((a, b) => b.output - a.output);
      setRoutes(sorted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected analyzer error.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFlip() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  }

  const bestRoute = useMemo(() => {
    if (!routes.length) return null;
    return routes[0];
  }, [routes]);

  const bestScore = useMemo(() => {
    if (!bestRoute) return null;
    return getExecutionScore(bestRoute);
  }, [bestRoute]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#12213f_0%,#050816_45%,#03060f_100%)] text-white">
      <section className="mx-auto max-w-6xl px-4 pb-20 pt-10">
        <div className="mb-10 text-center">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-[0.24em] text-cyan-300">
            Execution intelligence
          </div>

          <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Analyze the best swap route before you execute
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 md:text-lg">
            Exora keeps the interface simple like a swap terminal, but shows route quality,
            slippage risk, gas tradeoffs and execution score before decision time.
          </p>
        </div>

        <SwapCard
          chain={chain}
          tokenIn={tokenIn}
          tokenOut={tokenOut}
          amount={amount}
          onChainChange={setChain}
          onTokenInChange={setTokenIn}
          onTokenOutChange={setTokenOut}
          onAmountChange={setAmount}
          onFlip={handleFlip}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />

        {error ? (
          <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {bestRoute ? (
          <div className="mx-auto mt-10 max-w-5xl space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Best route</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">{bestRoute.dex}</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Highest estimated output among current route candidates.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Estimated output</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {formatMoney(bestRoute.output)} {tokenOut}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Public-data estimate based on pool liquidity and route assumptions.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <p className="text-sm text-slate-400">Execution score</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">
                  {bestScore}/100
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {bestScore !== null ? getScoreLabel(bestScore) : "-"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Route comparison</h2>
                  <span className="text-sm text-slate-400">{routes.length} candidates</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-white/10 text-slate-400">
                      <tr>
                        <th className="px-3 py-3 font-medium">DEX</th>
                        <th className="px-3 py-3 font-medium">Output</th>
                        <th className="px-3 py-3 font-medium">Slippage</th>
                        <th className="px-3 py-3 font-medium">Gas</th>
                        <th className="px-3 py-3 font-medium">Liquidity</th>
                        <th className="px-3 py-3 font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routes.map((route) => {
                        const score = getExecutionScore(route);

                        return (
                          <tr key={`${route.dex}-${route.output}`} className="border-b border-white/5">
                            <td className="px-3 py-4 text-white">{route.dex}</td>
                            <td className="px-3 py-4 text-white">
                              {formatMoney(route.output)} {tokenOut}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              {formatPercent(route.slippage)}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              ${route.gas.toFixed(2)}
                            </td>
                            <td className="px-3 py-4 text-slate-300">
                              ${formatMoney(route.liquidity)}
                            </td>
                            <td className="px-3 py-4">
                              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                                {score}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-xl font-semibold text-white">Decision summary</h2>

                <div className="mt-4 space-y-4 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-medium text-white">Recommended action</p>
                    <p className="mt-2">
                      Best current candidate is <span className="font-semibold text-cyan-300">{bestRoute.dex}</span>,
                      with the strongest estimated output for this pair.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-medium text-white">Slippage view</p>
                    <p className="mt-2">
                      Estimated slippage is <span className="font-semibold text-white">{formatPercent(bestRoute.slippage)}</span>.
                      {bestRoute.slippage > 0.01
                        ? " This is elevated and may indicate thinner execution quality."
                        : " This is within a relatively acceptable range for an estimated public-data route model."}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="font-medium text-white">Liquidity context</p>
                    <p className="mt-2">
                      Route depth shows approximately <span className="font-semibold text-white">${formatMoney(bestRoute.liquidity)}</span> in tracked liquidity,
                      which helps support execution confidence.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-amber-100">
                    This is execution intelligence based on real public pool data, not a final on-chain executable quote.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
