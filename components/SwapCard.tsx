"use client";

import { useAccount, useBalance } from "wagmi";
import { useState } from "react";

export default function SwapCard() {

  const { address } = useAccount();

  const { data: balance } = useBalance({
    address,
  });

  const [amount, setAmount] = useState("");

  return (
    <div className="w-[420px] rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-xl">

      <p className="mb-6 text-sm text-slate-400">
        Compare execution before swap
      </p>

      {/* SELL */}
      <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs text-slate-400">
              Sell
            </p>

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="mt-1 w-full bg-transparent text-2xl outline-none"
            />

          </div>

          <div className="rounded-xl bg-slate-700 px-4 py-2 text-sm">
            ETH
          </div>

        </div>

        {balance && (
          <p className="mt-2 text-xs text-slate-400">
            Balance: {Number(balance.formatted).toFixed(4)} {balance.symbol}
          </p>
        )}

      </div>

      {/* ARROW */}
      <div className="flex justify-center py-4 text-slate-400">
        ↓
      </div>

      {/* BUY */}
      <div className="rounded-2xl border border-white/10 bg-slate-800 p-4">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs text-slate-400">
              Buy
            </p>

            <p className="mt-1 text-2xl text-slate-400">
              ?
            </p>

          </div>

          <div className="rounded-xl bg-slate-700 px-4 py-2 text-sm">
            USDC
          </div>

        </div>

      </div>

      {/* BUTTON */}
      <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3 font-medium">
        Analyze Best Route
      </button>

    </div>
  );
}
