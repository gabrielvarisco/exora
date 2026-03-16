"use client";

import { useAccount, useBalance, useChainId } from "wagmi";

export default function WalletStatus() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const { data } = useBalance({
    address,
  });

  if (!isConnected || !address) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">

      {/* Chain */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
        Chain: {chainId}
      </div>

      {/* Balance */}
      {data && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
          {Number(data.formatted).toFixed(4)} {data.symbol}
        </div>
      )}

      {/* Address */}
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-1">
        {address.slice(0, 6)}...{address.slice(-4)}
      </div>

    </div>
  );
}
