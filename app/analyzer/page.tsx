'use client';

import { useState } from 'react';
import { AnalyzerForm } from '@/components/AnalyzerForm';
import { AnalyzerResults } from '@/components/AnalyzerResults';
import type { AnalysisSummary } from '@/lib/types';
import { saveAnalysis } from '@/lib/history-store';

export default function AnalyzerPage() {
  const [result, setResult] = useState<AnalysisSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="section">
      <div className="container stack">
        <div>
          <span className="kicker">DEX Execution Optimizer</span>
          <h1 className="heading-lg" style={{ marginTop: 16 }}>Analyzer</h1>
          <p className="text-muted" style={{ maxWidth: 860, marginTop: 10 }}>
            Compare live route candidates from public pool sources and identify the strongest estimated execution option for a given swap.
          </p>
        </div>

        <div className="analyzer-layout">
          <AnalyzerForm
            onStart={() => {
              setIsLoading(true);
              setError(null);
            }}
            onComplete={(payload) => {
              setResult(payload);
              saveAnalysis(payload);
              setError(null);
              setIsLoading(false);
            }}
            onError={(message) => {
              setError(message);
              setIsLoading(false);
            }}
          />

          <AnalyzerResults result={result} error={error} isLoading={isLoading} />
        </div>
      </div>
    </main>
  );
}
