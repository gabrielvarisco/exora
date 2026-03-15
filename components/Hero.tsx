import Link from 'next/link';
import { ShieldCheck, Radar, Sparkles, ArrowUpRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="section">
      <div className="container hero-layout">
        <div>
          <span className="kicker">DEX Execution Intelligence</span>
          <h1 className="heading-xl">Find the best swap route before you execute.</h1>
          <p className="hero-copy">
            Exora compares real public pool signals across DEX venues and helps the user decide where execution looks stronger, safer and more capital-efficient.
          </p>
          <div className="hero-actions">
            <Link href="/analyzer" className="btn btn-primary">Launch analyzer <ArrowUpRight size={16} /></Link>
            <a href="#how-it-works" className="btn btn-secondary">See how it works</a>
          </div>
        </div>

        <div className="panel panel-strong hero-card">
          <div className="badge success">Real data only</div>
          <div className="hero-card-grid">
            <div className="metric-box"><div className="metric-label">What Exora optimizes</div><div className="metric-value">Execution quality</div></div>
            <div className="metric-box"><div className="metric-label">Core inputs</div><div className="metric-value">Routes, slippage, gas</div></div>
            <div className="metric-box"><div className="metric-label">Monetization model</div><div className="metric-value">Fee only on execution</div></div>
          </div>
          <div className="callout">
            <ShieldCheck size={16} />
            <div>
              <strong>No fake data</strong>
              <p>If a chain, token or route is not covered by the public APIs, the interface says that clearly instead of inventing numbers.</p>
            </div>
          </div>
          <div className="callout">
            <Radar size={16} />
            <div>
              <strong>Decision-first product</strong>
              <p>This is not another market dashboard. The product exists to improve swap execution decisions.</p>
            </div>
          </div>
          <div className="callout">
            <Sparkles size={16} />
            <div>
              <strong>Launch-ready MVP</strong>
              <p>Analyzer, history, alerts UI and execution handoff already included in this version.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
