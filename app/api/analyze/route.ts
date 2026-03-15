import { NextResponse } from 'next/server';
import { buildExecutionAnalysis } from '@/lib/quote-engine';
import type { SupportedChain } from '@/lib/types';

interface AnalyzeRequestBody {
  chain?: SupportedChain;
  tokenIn?: string;
  tokenOut?: string;
  amountIn?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AnalyzeRequestBody;

    if (!body.chain || !body.tokenIn || !body.tokenOut || !body.amountIn || body.amountIn <= 0) {
      return NextResponse.json(
        { error: 'Invalid request. chain, tokenIn, tokenOut and positive amountIn are required.' },
        { status: 400 },
      );
    }

    const result = await buildExecutionAnalysis({
      chain: body.chain,
      tokenIn: body.tokenIn.trim(),
      tokenOut: body.tokenOut.trim(),
      amountIn: Number(body.amountIn),
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected analyzer failure.' },
      { status: 500 },
    );
  }
}
