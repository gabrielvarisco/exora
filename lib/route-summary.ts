import type { AnalysisSummary, RouteCandidate } from '@/lib/types';
import { formatPct, formatTokenAmount, formatUsd } from '@/lib/utils';

function buildWarnings(route: RouteCandidate) {
  const warnings = [...route.warnings];
  if (route.priceImpactPct > 2) warnings.push('Price impact acima de 2%.');
  if (route.slippagePct > 1.5) warnings.push('Slippage acima do ideal para este tamanho de trade.');
  if (route.liquidityUsd < 150_000) warnings.push('Liquidez limitada para o tamanho informado.');
  if (route.gasUsd > 8) warnings.push('Gas relativamente alto para esta rota.');
  return Array.from(new Set(warnings));
}

export function createAnalysisSummary(summary: AnalysisSummary): AnalysisSummary {
  if (!summary.bestRoute) {
    return {
      ...summary,
      textualSummary: 'Não encontramos rotas suficientes com dados públicos reais para montar uma recomendação confiável agora.',
      decisionSummary: [
        'Tente usar endereço de contrato em vez de símbolo.',
        'Valide se os ativos existem na chain selecionada.',
        'A cobertura do MVP depende de APIs públicas reais.',
      ],
    };
  }

  const best = summary.bestRoute;
  const warnings = buildWarnings(best);
  const textualSummary = `A melhor rota estimada agora é ${best.dexId} (${best.pairLabel}), com output estimado de ${formatTokenAmount(best.estimatedOutput)} ${best.estimatedOutputSymbol}, price impact de ${formatPct(best.priceImpactPct)}, slippage estimada de ${formatPct(best.slippagePct)} e gas de ${formatUsd(best.gasUsd)}.`;

  const decisionSummary = [
    `Execution score ${best.executionScore}/100 (${best.scoreLabel}).`,
    `Liquidez observada ${formatUsd(best.liquidityUsd)} e volume 24h ${formatUsd(best.volume24hUsd)}.`,
    warnings.length ? `Pontos de atenção: ${warnings.join(' ')}` : 'Sem alertas críticos para este tamanho de swap no momento.',
  ];

  return { ...summary, textualSummary, decisionSummary };
}
