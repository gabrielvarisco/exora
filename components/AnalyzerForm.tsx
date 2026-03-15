'use client';

import { useState } from 'react';
import { SUPPORTED_CHAINS } from '@/lib/chains';
import type { AnalysisSummary, SupportedChain } from '@/lib/types';

interface AnalyzerFormProps {
  onStart: () => void;
  onComplete: (payload: AnalysisSummary) => void;
  onError: (message: string) => void;
}

export function AnalyzerForm({ onStart, onComplete, onError }: AnalyzerFormProps) {
  const [chain, setChain] = useState<SupportedChain>('ethereum');
  const [tokenIn, setTokenIn] = useState('WETH');
  const [tokenOut, setTokenOut] = useState('USDC');
  const [amountIn, setAmountIn] = useState('1');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onStart();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chain, tokenIn, tokenOut, amountIn: Number(amountIn) }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? 'Analyzer request failed.');
      onComplete(payload as AnalysisSummary);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unexpected analyzer error.');
    }
  }

  return (
    <form className="panel content-panel form-grid" onSubmit={handleSubmit}>
      <div>
        <div className="label">Chain</div>
        <select className="field" value={chain} onChange={(event) => setChain(event.target.value as SupportedChain)}>
          {SUPPORTED_CHAINS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </div>

      <div>
        <div className="label">Token in</div>
        <input className="field" value={tokenIn} onChange={(event) => setTokenIn(event.target.value)} placeholder="WETH or contract address" />
      </div>

      <div>
        <div className="label">Token out</div>
        <input className="field" value={tokenOut} onChange={(event) => setTokenOut(event.target.value)} placeholder="USDC or contract address" />
      </div>

      <div>
        <div className="label">Amount</div>
        <input className="field" type="number" min="0" step="any" value={amountIn} onChange={(event) => setAmountIn(event.target.value)} />
      </div>

      <div className="form-footnote">
        Prefer contract addresses for higher precision. Symbols can be ambiguous across chains.
      </div>

      <button type="submit" className="btn btn-primary full-width">Analyze routes</button>
    </form>
  );
}
