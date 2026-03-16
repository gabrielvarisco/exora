import { NextResponse } from "next/server";
import { computeExecutionScore, getConfidence } from "@/lib/scoring";
import { AnalyzeResponse, ChainKey, RouteCandidate } from "@/lib/types";

const GAS_BY_DEX: Record<string, number> = {
  uniswap: 13,
  sushiswap: 14,
  pancakeswap: 10,
  aerodrome: 9,
  camelot: 11,
  traderjoe: 12,
  balancer: 18,
  curve: 16
};

async function fetchDexPairs(query: string) {
  const url = `https://api.dexscreener.com/latest/dex/search/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch public DEX data");
  return response.json();
}

function parseNum(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function pickTokenPrice(pairs: any[], symbol: string, chain: ChainKey) {
  const matches = pairs.filter((pair) => {
    const chainMatch = String(pair.chainId).toLowerCase() === chain;
    const base = String(pair.baseToken?.symbol ?? "").toUpperCase();
    const quote = String(pair.quoteToken?.symbol ?? "").toUpperCase();
    return chainMatch && (base === symbol.toUpperCase() || quote === symbol.toUpperCase());
  });

  const best = matches.sort((a, b) => parseNum(b.liquidity?.usd) - parseNum(a.liquidity?.usd))[0];
  if (!best) return 0;

  const base = String(best.baseToken?.symbol ?? "").toUpperCase();
  const quote = String(best.quoteToken?.symbol ?? "").toUpperCase();
  if (base === symbol.toUpperCase()) return parseNum(best.priceUsd);
  if (quote === symbol.toUpperCase()) {
    const basePrice = parseNum(best.priceUsd);
    const ratio = parseNum(best.priceNative);
    return ratio > 0 ? basePrice / ratio : 0;
  }
  return 0;
}

export async function POST(request: Request) {
  try {
    const { chain, tokenIn, tokenOut, amount } = (await request.json()) as {
      chain: ChainKey;
      tokenIn: string;
      tokenOut: string;
      amount: string;
    };

    const tradeSize = parseNum(amount);
    if (!chain || !tokenIn || !tokenOut || tradeSize <= 0) {
      return NextResponse.json({ error: "Missing or invalid analyzer input." }, { status: 400 });
    }

    const [pairSearch, tokenSearch] = await Promise.all([
      fetchDexPairs(`${tokenIn} ${tokenOut}`),
      fetchDexPairs(`${tokenIn} ${tokenOut} ${chain}`)
    ]);

    const allPairs = [...(pairSearch.pairs ?? []), ...(tokenSearch.pairs ?? [])];
    const tokenInUsd = pickTokenPrice(allPairs, tokenIn, chain);
    const tokenOutUsd = pickTokenPrice(allPairs, tokenOut, chain);

    const filtered = allPairs.filter((pair) => {
      const chainMatch = String(pair.chainId).toLowerCase() === chain;
      const symbols = [String(pair.baseToken?.symbol ?? "").toUpperCase(), String(pair.quoteToken?.symbol ?? "").toUpperCase()];
      return chainMatch && symbols.includes(tokenIn.toUpperCase()) && symbols.includes(tokenOut.toUpperCase());
    });

    const deduped = new Map<string, any>();
    filtered.forEach((pair) => {
      const key = `${pair.dexId}-${pair.pairAddress}`;
      if (!deduped.has(key)) deduped.set(key, pair);
    });

    const routes: RouteCandidate[] = Array.from(deduped.values()).map((pair) => {
      const liquidityUsd = parseNum(pair.liquidity?.usd);
      const volume24hUsd = parseNum(pair.volume?.h24);
      const priceImpact = Math.min(0.06, tradeSize / Math.max(liquidityUsd, 1) * 1.8);
      const slippage = Math.min(0.08, tradeSize / Math.max(liquidityUsd, 1) * 2.2);
      const gasUsd = GAS_BY_DEX[String(pair.dexId).toLowerCase()] ?? 12;
      const output = tokenInUsd > 0 && tokenOutUsd > 0
        ? tradeSize * (tokenInUsd / tokenOutUsd) * (1 - priceImpact - slippage) - gasUsd / Math.max(tokenOutUsd, 1)
        : 0;
      const executionScore = computeExecutionScore({ liquidityUsd, volume24hUsd, priceImpact, slippage, gasUsd });

      return {
        id: `${pair.dexId}-${pair.pairAddress}`,
        dex: String(pair.dexId ?? "unknown"),
        chain,
        pairAddress: String(pair.pairAddress ?? ""),
        baseSymbol: String(pair.baseToken?.symbol ?? ""),
        quoteSymbol: String(pair.quoteToken?.symbol ?? ""),
        liquidityUsd,
        volume24hUsd,
        priceImpact,
        slippage,
        gasUsd,
        estimatedOutput: Math.max(0, output),
        executionScore,
        confidence: getConfidence(executionScore),
        warning: liquidityUsd < tradeSize * 20 ? "Trade size is large relative to visible liquidity." : undefined
      };
    }).sort((a, b) => b.executionScore - a.executionScore || b.estimatedOutput - a.estimatedOutput).slice(0, 6);

    const bestRoute = routes[0];

    const response: AnalyzeResponse = {
      pairLabel: `${tokenIn}/${tokenOut}`,
      routes,
      bestRoute,
      summary: bestRoute
        ? `${bestRoute.dex} looks strongest on ${chain} for ${tokenIn}/${tokenOut}, with visible liquidity support and the best overall execution score among public pool candidates.`
        : `No reliable public pool candidates were found for ${tokenIn}/${tokenOut} on ${chain}.`,
      sourceNote: "Uses public Dexscreener pool data. Quotes are execution estimates, not final signed router quotes."
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analyzer failed unexpectedly." },
      { status: 500 }
    );
  }
}
