import Link from "next/link";
import WalletConnectButton from "@/components/WalletConnectButton";

export default function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark">↔</span>
          <span>
            <strong>Exora</strong>
            <small>DEX Execution Optimizer</small>
          </span>
        </Link>

        <nav className="header-nav">
          <Link href="/analyzer">Analyzer</Link>
          <Link href="/history">History</Link>
          <Link href="/alerts">Alerts</Link>
        </nav>

        <div className="header-actions">
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
