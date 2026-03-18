"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import { erc20Abi, maxUint256, type Address } from "viem";
import { formatUnits as viemFormatUnits } from "viem";
import AssetPicker from "@/components/AssetPicker";
import NetworkPicker from "@/components/NetworkPicker";
import {
  getChainById,
  getChainByKey,
  getDefaultChainKey,
  type SupportedChainKey,
} from "@/lib/chains";
import {
  getDefaultBuySymbol,
  getDefaultSellSymbol,
  getTokenBySymbol,
  getTokensForChain,
} from "@/lib/tokens";

const NATIVE_TOKEN_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

type QuoteResponse = {
  chain: SupportedChainKey;
  sellToken: {
    symbol: string;
    decimals: number;
    address: string;
    name?: string;
  };
  buyToken: {
    symbol: string;
    decimals: number;
    address: string;
    name?: string;
  };
  quote: {
    buyAmount?: string;
    sellAmount?: string;
    totalNetworkFee?: string;
    allowanceTarget?: string;
    issues?: {
      allowance?: {
        actual?: string;
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
    transaction?: {
      to?: string;
      data?: string;
      value?: string;
      gas?: string;
      gasPrice?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
    };
  };
  error?: string;
};

function isNativeToken(address?: string) {
  return (address ?? "").toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
}

function formatTokenAmount(value?: string, decimals = 18) {
  if (!value) return "0";

  try {
    const formatted = viemFormatUnits(BigInt(value), decimals);
    const asNumber = Number(formatted);

    if (Number.isNaN(asNumber)) {
      return formatted;
    }

    if (asNumber === 0) return "0";
    if (asNumber < 0.000001) return "<0.000001";

    return asNumber.toLocaleString(undefined, {
      maximumFractionDigits: 6,
    });
  } catch {
    return "0";
  }
}

function formatBalanceLabel(formatted?: string, symbol?: string) {
  const amount = Number(formatted ?? "0");

  if (!Number.isFinite(amount) || amount <= 0) {
    return `Balance: 0 ${symbol ?? ""}`.trim();
  }

  if (amount < 0.000001) {
    return `Balance: <0.000001 ${symbol ?? ""}`.trim();
  }

  if (amount < 0.01) {
    return `Balance: ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 6,
    })} ${symbol ?? ""}`.trim();
  }

  return `Balance: ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })} ${symbol ?? ""}`.trim();
}

function sanitizeAmountInput(value: string) {
  const sanitized = value.replace(",", ".").replace(/[^\d.]/g, "");
  const parts = sanitized.split(".");

  if (parts.length <= 1) return sanitized;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

async function readJsonSafe(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(text || `Unexpected ${response.status} response`);
  }
}

export default function SwapCard() {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const publicClient = usePublicClient();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();

  const walletChain = getChainById(walletChainId);

  const [chain, setChain] = useState<SupportedChainKey>(
    walletChain?.key ?? getDefaultChainKey()
  );

  const tokens = useMemo(() => getTokensForChain(chain), [chain]);

  const [sellSymbol, setSellSymbol] = useState<string>(
    getDefaultSellSymbol(walletChain?.key ?? getDefaultChainKey())
  );
  const [buySymbol, setBuySymbol] = useState<string>(
    getDefaultBuySymbol(walletChain?.key ?? getDefaultChainKey())
  );
  const [amount, setAmount] = useState("0");
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quoteResult, setQuoteResult] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState("");
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | null>(null);
  const [swapHash, setSwapHash] = useState<`0x${string}` | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!walletChain?.key) return;
    if (walletChain.key === chain) return;

    setChain(walletChain.key);
    setSellSymbol(getDefaultSellSymbol(walletChain.key));
    setBuySymbol(getDefaultBuySymbol(walletChain.key));
    setQuoteResult(null);
    setError("");
    setSuccessMessage("");
  }, [walletChain?.key, chain]);

  const selectedChain = getChainByKey(chain);
  const sellToken = getTokenBySymbol(chain, sellSymbol);
  const buyToken = getTokenBySymbol(chain, buySymbol);

  const sellTokenIsNative = isNativeToken(sellToken?.address);

  const sellBalance = useBalance({
    address,
    chainId: selectedChain?.chainId,
    token:
      !sellTokenIsNative && sellToken
        ? (sellToken.address as `0x${string}`)
        : undefined,
    query: {
      enabled: Boolean(address && selectedChain?.chainId && sellToken),
    },
  });

  const allowanceSpender =
    quoteResult?.quote?.issues?.allowance?.spender ??
    quoteResult?.quote?.allowanceTarget;

  const actualAllowance = BigInt(
    quoteResult?.quote?.issues?.allowance?.actual ?? "0"
  );
  const quotedSellAmount = BigInt(quoteResult?.quote?.sellAmount ?? "0");

  const needsApproval = Boolean(
    quoteResult &&
      !sellTokenIsNative &&
      allowanceSpender &&
      quotedSellAmount > BigInt(0) &&
      actualAllowance < quotedSellAmount
  );

  async function ensureWalletOnSelectedChain() {
    if (!selectedChain) {
      throw new Error("Selected chain is invalid");
    }

    if (!isConnected || !address) {
      throw new Error("Connect your wallet first");
    }

    if (walletChainId !== selectedChain.chainId) {
      await switchChainAsync({ chainId: selectedChain.chainId });
    }
  }

  async function handleAnalyze() {
    setError("");
    setSuccessMessage("");
    setApprovalHash(null);
    setSwapHash(null);
    setQuoteResult(null);

    try {
      if (!selectedChain) {
        throw new Error("Invalid selected chain");
      }

      if (!address) {
        throw new Error("Connect your wallet first");
      }

      const normalizedAmount = amount.trim().replace(",", ".");

      if (!normalizedAmount || Number(normalizedAmount) <= 0) {
        throw new Error("Enter an amount greater than zero");
      }

      await ensureWalletOnSelectedChain();

      setIsLoadingQuote(true);

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chain,
          sellSymbol,
          buySymbol,
          amount: normalizedAmount,
          taker: address,
          slippageBps: "100",
        }),
      });

      const data = (await readJsonSafe(response)) as QuoteResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to get executable quote");
      }

      setQuoteResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected quote error");
    } finally {
      setIsLoadingQuote(false);
    }
  }

  async function handleApprove() {
    try {
      if (!sellToken || sellTokenIsNative) {
        throw new Error("Approval is only needed for ERC-20 tokens");
      }

      if (!allowanceSpender) {
        throw new Error("Missing allowance spender from quote");
      }

      await ensureWalletOnSelectedChain();

      setError("");
      setSuccessMessage("");
      setIsApproving(true);

      const hash = await writeContractAsync({
        address: sellToken.address as Address,
        abi: erc20Abi,
        functionName: "approve",
        args: [allowanceSpender as Address, maxUint256],
        chainId: selectedChain?.chainId,
      });

      setApprovalHash(hash);

      if (!publicClient) {
        throw new Error("Public client unavailable");
      }

      await publicClient.waitForTransactionReceipt({ hash });

      setSuccessMessage(`Approval confirmed for ${sellSymbol}.`);
      await handleAnalyze();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Approval failed");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleSwap() {
    try {
      if (!quoteResult?.quote?.transaction?.to || !quoteResult?.quote?.transaction?.data) {
        throw new Error("Missing executable transaction from quote");
      }

      await ensureWalletOnSelectedChain();

      setError("");
      setSuccessMessage("");
      setIsSwapping(true);

      const tx = quoteResult.quote.transaction;

      const hash = await sendTransactionAsync({
        chainId: selectedChain?.chainId,
        to: tx.to as Address,
        data: tx.data as `0x${string}`,
        value: tx.value ? BigInt(tx.value) : BigInt(0),
        gas: tx.gas ? BigInt(tx.gas) : undefined,
        gasPrice: tx.gasPrice ? BigInt(tx.gasPrice) : undefined,
        maxFeePerGas: tx.maxFeePerGas ? BigInt(tx.maxFeePerGas) : undefined,
        maxPriorityFeePerGas: tx.maxPriorityFeePerGas
          ? BigInt(tx.maxPriorityFeePerGas)
          : undefined,
      });

      setSwapHash(hash);

      if (!publicClient) {
        throw new Error("Public client unavailable");
      }

      await publicClient.waitForTransactionReceipt({ hash });

      setSuccessMessage(`Swap executed successfully. Tx: ${hash}`);
      await sellBalance.refetch();
      setQuoteResult(null);
      setAmount("0");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Swap failed");
    } finally {
      setIsSwapping(false);
    }
  }

  function handleFlip() {
    const currentSell = sellSymbol;
    setSellSymbol(buySymbol);
    setBuySymbol(currentSell);
    setQuoteResult(null);
    setError("");
    setSuccessMessage("");
  }

  async function handleChainChange(value: SupportedChainKey) {
    const nextChain = getChainByKey(value);
    if (!nextChain) return;

    setError("");
    setSuccessMessage("");
    setQuoteResult(null);
    setApprovalHash(null);
    setSwapHash(null);

    try {
      if (isConnected && walletChainId !== nextChain.chainId) {
        await switchChainAsync({ chainId: nextChain.chainId });
      }

      setChain(value);
      setSellSymbol(getDefaultSellSymbol(value));
      setBuySymbol(getDefaultBuySymbol(value));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to switch network";
      setError(message);
    }
  }

  function handleMax() {
    if (!sellBalance.data?.formatted) return;
    setAmount(sellBalance.data.formatted);
    setQuoteResult(null);
    setError("");
    setSuccessMessage("");
  }

  const buyDisplayValue = quoteResult?.quote?.buyAmount
    ? formatTokenAmount(quoteResult.quote.buyAmount, quoteResult.buyToken.decimals)
    : "0";

  const primaryButtonLabel = (() => {
    if (!isConnected) return "Conectar carteira";
    if (isSwitchingChain) return "Switching network...";
    if (isLoadingQuote) return "Loading executable quote...";
    if (!quoteResult) return "Analyze Best Route";
    if (isApproving) return `Approving ${sellSymbol}...`;
    if (needsApproval) return `Approve ${sellSymbol}`;
    if (isSwapping) return "Swapping...";
    return "Swap now";
  })();

  const primaryButtonAction = async () => {
    if (!isConnected) {
      setError("Connect your wallet first");
      return;
    }

    if (!quoteResult) {
      await handleAnalyze();
      return;
    }

    if (needsApproval) {
      await handleApprove();
      return;
    }

    await handleSwap();
  };

  const primaryButtonDisabled =
    isSwitchingChain || isLoadingQuote || isApproving || isSwapping;

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

        <NetworkPicker
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
                  setQuoteResult(null);
                  setError("");
                  setSuccessMessage("");
                }}
                placeholder="0"
                inputMode="decimal"
                className="w-full bg-transparent text-5xl font-semibold leading-none text-white outline-none placeholder:text-slate-500"
              />

              <div className="mt-2 flex items-center gap-3">
                <p className="text-sm text-slate-400">
                  {formatBalanceLabel(
                    sellBalance.data?.formatted,
                    sellBalance.data?.symbol ?? sellSymbol
                  )}
                </p>

                <button
                  type="button"
                  onClick={handleMax}
                  disabled={!sellBalance.data}
                  className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Max
                </button>
              </div>
            </div>

            <AssetPicker
              chainKey={chain}
              chainId={selectedChain?.chainId ?? 8453}
              value={sellToken}
              tokens={tokens}
              onChange={(symbol) => {
                setSellSymbol(symbol);
                if (symbol === buySymbol) {
                  const nextBuy = tokens.find((t) => t.symbol !== symbol);
                  if (nextBuy) setBuySymbol(nextBuy.symbol);
                }
                setQuoteResult(null);
                setError("");
                setSuccessMessage("");
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

            <AssetPicker
              chainKey={chain}
              chainId={selectedChain?.chainId ?? 8453}
              value={buyToken}
              tokens={tokens}
              excludeSymbols={[sellSymbol]}
              placeholder="Selecionar token"
              onChange={(symbol) => {
                setBuySymbol(symbol);
                setQuoteResult(null);
                setError("");
                setSuccessMessage("");
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={primaryButtonAction}
        disabled={primaryButtonDisabled}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-4 text-base font-semibold text-slate-950 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
      >
        {primaryButtonLabel}
      </button>

      {quoteResult && !needsApproval ? (
        <p className="mt-3 text-center text-xs text-cyan-300/80">
          Quote executável pronta. Pode enviar o swap agora.
        </p>
      ) : null}

      {approvalHash ? (
        <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs text-cyan-200 break-all">
          Approval tx: {approvalHash}
        </div>
      ) : null}

      {swapHash ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs text-emerald-200 break-all">
          Swap tx: {swapHash}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200 break-all">
          {error}
        </div>
      ) : null}

      {quoteResult ? (
        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm text-slate-400">Estimated buy amount</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {formatTokenAmount(
                quoteResult.quote.buyAmount,
                quoteResult.buyToken.decimals
              )}{" "}
              {buySymbol}
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Sell amount</p>
              <p className="mt-1 text-white">
                {formatTokenAmount(
                  quoteResult.quote.sellAmount,
                  quoteResult.sellToken.decimals
                )}{" "}
                {sellSymbol}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Network fee</p>
              <p className="mt-1 text-white">
                {quoteResult.quote.totalNetworkFee
                  ? formatTokenAmount(quoteResult.quote.totalNetworkFee, 18)
                  : "0"}
              </p>
            </div>
          </div>

          {!sellTokenIsNative ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-sm text-slate-400">Allowance target</p>
              <p className="mt-1 break-all text-xs text-slate-300">
                {allowanceSpender ?? "No allowance target returned"}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
