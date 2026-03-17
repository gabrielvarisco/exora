import type { SupportedChainKey } from "@/lib/chains";
import { getChainByKey } from "@/lib/chains";

type ZeroExPriceParams = {
  chain: SupportedChainKey;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker?: string;
};

export async function getZeroExPrice({
  chain,
  sellToken,
  buyToken,
  sellAmount,
  taker,
}: ZeroExPriceParams) {
  const apiKey = process.env.ZEROX_API_KEY;

  if (!apiKey) {
    throw new Error("ZEROX_API_KEY is missing");
  }

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

  const response = await fetch(
    `https://api.0x.org/swap/permit2/price?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "0x-api-key": apiKey,
        "0x-version": "v2",
      },
      cache: "no-store",
    },
  );

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`0x price error ${response.status}: ${text}`);
  }

  return JSON.parse(text);
}
