import Link from 'next/link';
import { ArrowRightLeft } from 'lucide-react';

export function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          <span className="logo-mark"><ArrowRightLeft size={18} /></span>
          <span>Exora</span>
        </Link>

        <nav className="nav">
          <Link className="btn btn-secondary btn-sm" href="/">Home</Link>
          <Link className="btn btn-secondary btn-sm" href="/history">History</Link>
          <Link className="btn btn-secondary btn-sm" href="/alerts">Alerts</Link>
          <Link className="btn btn-primary btn-sm" href="/analyzer">Open Analyzer</Link>
        </nav>
      </div>
    </header>
  );
}
