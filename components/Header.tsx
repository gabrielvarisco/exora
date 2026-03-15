import Link from "next/link";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/analyzer" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/20">
            ↔
          </div>

          <div className="leading-tight">
            <p className="text-base font-semibold text-white">Exora</p>
            <p className="text-xs text-slate-400">DEX Execution Optimizer</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/analyzer" className="rounded-2xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
            Analyzer
          </Link>
          <Link href="/history" className="rounded-2xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
            History
          </Link>
          <Link href="/alerts" className="rounded-2xl px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white">
            Alerts
          </Link>
        </nav>

        <WalletConnectButton />
      </div>
    </header>
  );
}
