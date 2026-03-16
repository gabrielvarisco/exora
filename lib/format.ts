export function money(value: number, max = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: max,
    minimumFractionDigits: 0
  }).format(value);
}

export function percent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function shortAddress(value?: string) {
  if (!value) return "";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function chainLabel(chainId?: number) {
  const labels: Record<number, string> = {
    1: "Ethereum",
    8453: "Base",
    42161: "Arbitrum",
    137: "Polygon",
    56: "BSC"
  };
  return chainId ? labels[chainId] ?? `Chain ${chainId}` : "No chain";
}
