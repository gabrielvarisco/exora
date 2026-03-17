import type { SupportedChainKey } from "@/lib/chains";
import { getChainByKey } from "@/lib/chains";

type ZeroExBaseParams = {
  chain: SupportedChainKey;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker?: string;
};

type ZeroExQuoteParams = ZeroExBaseParams & {
  slippageBps?: string;
};

async function fetchZeroEx(path: string, params: URLSearchParams) {
  const apiKey = process.env.ZEROX_API_KEY;

  if (!apiKey) {
    throw new Error("ZEROX_API_KEY is missing");
  }

  const response = await fetch(`https://api.0x.org${path}?${params.toString()}`, {
    method: "GET",
    headers: {
      "0x-api-key": apiKey,
      "0x-version": "v2",
    },
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`0x error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}

export async function getZeroExPrice({
  chain,
  sellToken,
  buyToken,
  sellAmount,
  taker,
}: ZeroExBaseParams) {
  const selectedChain = getChainByKey(chain);

  if (!selectedChain) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  const params = new URLSearchParams({
    chainId: String(selectedChain.zeroExChainId),
    sellToken,
    buyToken,
    sellAmount,
  });

  if (taker) {
    params.set("taker", taker);
  }

  return fetchZeroEx("/swap/allowance-holder/price", params);
}

export async function getZeroExQuote({
  chain,
  sellToken,
  buyToken,
  sellAmount,
  taker,
  slippageBps = "100",
}: ZeroExQuoteParams) {
  const selectedChain = getChainByKey(chain);

  if (!selectedChain) {
    throw new Error(`Unsupported chain: ${chain}`);
  }

  if (!taker) {
    throw new Error("taker is required for executable quote");
  }

  const params = new URLSearchParams({
    chainId: String(selectedChain.zeroExChainId),
    sellToken,
    buyToken,
    sellAmount,
    taker,
    slippageBps,
  });

  return fetchZeroEx("/swap/allowance-holder/quote", params);
}