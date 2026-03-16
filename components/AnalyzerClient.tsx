"use client";

import { useEffect, useMemo, useState } from "react";
import { getDefaultPair, getTokensForChain } from "@/lib/token-list";
import { AnalyzeResponse, ChainKey, TokenOption } from "@/lib/types";
import TokenSelectorModal from "@/components/TokenSelectorModal";
import RouteSummary from "@/components/RouteSummary";
import RouteTable from "@/components/RouteTable";
import DecisionPanel from "@/components/DecisionPanel";
import { saveAlert, saveHistoryItem } from "@/lib/storage";
import { useAccount, useBalance, useChainId } from "wagmi";
import { chainLabel, shortAddress } from "@/lib/format";

const CHAINS: { label: string; value: ChainKey }[] = [
  { label: "Ethereum", value: "ethereum" },
  { label: "Base", value: "base" },
  { label: "Arbitrum", value: "arbitrum" },
  { label: "Polygon", value: "polygon" },
  { label: "BSC", value: "bsc" }
];

export default function AnalyzerClient() {
  const [chain, setChain] = useState<ChainKey>("ethereum");
  const [tokenIn, setTokenIn] = useState<TokenOption>(() => getTokensForChain("ethereum")[0]);
  const [tokenOut, setTokenOut] = useState<TokenOption>(() => getTokensForChain("ethereum")[1]);
  const [amount, setAmount] = useState("1");
  const [selecting, setSelecting] = useState<"in" | "out" | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const { data: balance } = useBalance({ address });

  useEffect(() => {
    const defaults = getDefaultPair(chain);
    const list = getTokensForChain(chain);
    const nextIn = list.find((item) => item.symbol === defaults.tokenIn) ?? list[0];
    const nextOut = list.find((item) => item.symbol === defaults.tokenOut) ?? list[1] ?? list[0];
    setTokenIn(nextIn);
    setTokenOut(nextOut);
  }, [chain]);

  const walletContext = useMemo(() => {
    if (!isConnected || !address) return null;
    return {
      address: shortAddress(address),
      chain: chainLabel(walletChainId),
      balance: balance ? `${Number(balance.formatted).toFixed(4)} ${balance.symbol}` : "Balance unavailable"
    };
  }, [address, balance, isConnected, walletChainId]);

  async function analyze() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chain, tokenIn: tokenIn.symbol, tokenOut: tokenOut.symbol, amount })
      });
      const data = (await response.json()) as AnalyzeResponse & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Analyzer failed");
      setResult(data);

      saveHistoryItem({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        chain,
        tokenIn: tokenIn.symbol,
        tokenOut: tokenOut.symbol,
        amount,
        bestDex: data.bestRoute?.dex,
        executionScore: data.bestRoute?.executionScore,
        estimatedOutput: data.bestRoute?.estimatedOutput,
        summary: data.summary
      });

      if (data.bestRoute && data.bestRoute.slippage > 0.02) {
        saveAlert({
          id: crypto.randomUUID(),
          pair: `${tokenIn.symbol}/${tokenOut.symbol}`,
          chain,
          message: `High slippage risk detected on ${data.bestRoute.dex}. Consider reducing size or waiting for better depth.`,
          severity: "warning",
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown analyzer error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="shell analyzer-shell">
      <div className="page-copy analyzer-copy">
        <span className="eyebrow">Execution intelligence</span>
        <h1>Analyze the best swap route before you execute.</h1>
        <p>
          One clean terminal for route quality, slippage risk, gas burden and decision support. Built to feel familiar to
          active DEX users without turning into a noisy dashboard.
        </p>
      </div>

      <div className="analyzer-layout">
        <section className="trade-column glass-card">
          <div className="trade-head">
            <div>
              <span className="eyebrow">Exora terminal</span>
              <h2>Compare execution before swap</h2>
            </div>
            <select className="chain-select" value={chain} onChange={(e) => setChain(e.target.value as ChainKey)}>
              {CHAINS.map((item) => (
                <option value={item.value} key={item.value}>{item.label}</option>
              ))}
            </select>
          </div>

          <div className="token-panel">
            <span>Sell</span>
            <div className="token-panel-main">
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0" />
              <button type="button" className="token-button" onClick={() => setSelecting("in")}>{tokenIn.symbol}</button>
            </div>
          </div>

          <button type="button" className="switch-button" onClick={() => {
            setTokenIn(tokenOut);
            setTokenOut(tokenIn);
          }}>↓</button>

          <div className="token-panel">
            <span>Buy</span>
            <div className="token-panel-main">
              <div className="output-placeholder">{result?.bestRoute ? result.bestRoute.estimatedOutput.toFixed(4) : "?"}</div>
              <button type="button" className="token-button" onClick={() => setSelecting("out")}>{tokenOut.symbol}</button>
            </div>
          </div>

          <button type="button" className="primary-btn full-width" onClick={analyze} disabled={loading}>
            {loading ? "Analyzing routes..." : "Analyze Best Route"}
          </button>

          {walletContext ? (
            <div className="wallet-inline">
              <span>{walletContext.chain}</span>
              <span>{walletContext.balance}</span>
              <span>{walletContext.address}</span>
            </div>
          ) : (
            <div className="wallet-inline wallet-muted">
              Connect a wallet to surface network context and balances.
            </div>
          )}

          {error ? <div className="error-box">{error}</div> : null}
        </section>

        <section className="insight-column">
          <RouteSummary bestRoute={result?.bestRoute} tokenOut={tokenOut.symbol} />
          {result ? <DecisionPanel summary={result.summary} note={result.sourceNote} /> : null}
        </section>
      </div>

      {result ? <RouteTable routes={result.routes} tokenOut={tokenOut.symbol} /> : null}

      <TokenSelectorModal
        chain={chain}
        title={selecting === "in" ? "Select token in" : "Select token out"}
        open={Boolean(selecting)}
        onClose={() => setSelecting(null)}
        onSelect={(token) => (selecting === "in" ? setTokenIn(token) : setTokenOut(token))}
      />
    </div>
  );
}
