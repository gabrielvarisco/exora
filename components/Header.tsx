"use client";

import Link from "next/link";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            ↔
          </div>

          <div className="leading-tight">
            <p className="text-base font-semibold text-white">Exora</p>
            <p className="text-xs text-slate-400">DEX Execution Optimizer</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/analyzer"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Analyzer
          </Link>

          <Link
            href="/history"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            History
          </Link>

          <Link
            href="/alerts"
            className="text-sm font-medium text-slate-300 transition hover:text-white"
          >
            Alerts
          </Link>
        </nav>

        <div className="flex items-center">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
