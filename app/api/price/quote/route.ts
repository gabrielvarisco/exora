import { NextResponse } from "next/server";
import { getZeroExQuote } from "@/lib/0x";
import { getTokenBySymbol } from "@/lib/tokens";
import { toBaseUnits } from "@/lib/amounts";
import type { SupportedChainKey } from "@/lib/chains";

type RequestBody = {
  chain: SupportedChainKey;
  sellSymbol: string;
  buySymbol: string;
  amount: string;
  taker: string;
  slippageBps?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    if (!body.chain || !body.sellSymbol || !body.buySymbol || !body.amount || !body.taker) {
      return NextResponse.json(
        { error: "Missing chain, sellSymbol, buySymbol, amount or taker" },
        { status: 400 }
      );
    }

    if (body.sellSymbol.toLowerCase() === body.buySymbol.toLowerCase()) {
      return NextResponse.json(
        { error: "Sell and buy tokens must be different" },
        { status: 400 }
      );
    }

    const sellToken = getTokenBySymbol(body.chain, body.sellSymbol);
    const buyToken = getTokenBySymbol(body.chain, body.buySymbol);

    if (!sellToken || !buyToken) {
      return NextResponse.json(
        { error: "Unsupported token pair for this chain" },
        { status: 400 }
      );
    }

    const sellAmount = toBaseUnits(body.amount, sellToken.decimals).toString();

    if (BigInt(sellAmount) <= BigInt(0)) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 }
      );
    }

    const quote = await getZeroExQuote({
      chain: body.chain,
      sellToken: sellToken.address,
      buyToken: buyToken.address,
      sellAmount,
      taker: body.taker,
      slippageBps: body.slippageBps ?? "100",
    });

    return NextResponse.json({
      chain: body.chain,
      sellToken,
      buyToken,
      quote,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected quote error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}