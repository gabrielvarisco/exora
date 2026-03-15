import type { SupportedChain } from '@/lib/types';

export const SUPPORTED_CHAINS: { value: SupportedChain; label: string; gasUsd: number }[] = [
  { value: 'ethereum', label: 'Ethereum', gasUsd: 11.5 },
  { value: 'arbitrum', label: 'Arbitrum', gasUsd: 0.65 },
  { value: 'base', label: 'Base', gasUsd: 0.45 },
  { value: 'bsc', label: 'BNB Chain', gasUsd: 0.32 },
  { value: 'polygon', label: 'Polygon', gasUsd: 0.28 },
  { value: 'optimism', label: 'Optimism', gasUsd: 0.52 },
  { value: 'solana', label: 'Solana', gasUsd: 0.04 },
];

export const GECKO_NETWORK_MAP: Record<SupportedChain, string> = {
  ethereum: 'eth',
  arbitrum: 'arbitrum',
  base: 'base',
  bsc: 'bsc',
  polygon: 'polygon_pos',
  optimism: 'optimism',
  solana: 'solana',
};

export function getBaseGasUsd(chain: SupportedChain) {
  return SUPPORTED_CHAINS.find((item) => item.value === chain)?.gasUsd ?? 1;
}
