import Link from 'next/link';
import { Hero } from '@/components/Hero';

export default function HomePage() {
  return (
    <main>
      <Hero />

      <section id="how-it-works" className="section">
        <div className="container feature-grid">
          <div className="panel content-panel">
            <div className="kicker">Execution intelligence</div>
            <h2 className="heading-lg" style={{ marginTop: 16 }}>Route quality before execution.</h2>
            <p className="text-muted" style={{ marginTop: 12 }}>
              Exora evaluates available public pool venues and estimates which route looks strongest for the trade size you want right now.
            </p>
          </div>
          <div className="panel content-panel">
            <div className="kicker">What it compares</div>
            <div className="bullet-stack">
              <div>Estimated output</div>
              <div>Price impact</div>
              <div>Slippage risk</div>
              <div>Gas burden</div>
              <div>Liquidity depth</div>
              <div>Execution score</div>
            </div>
          </div>
          <div className="panel content-panel">
            <div className="kicker">Honest MVP scope</div>
            <p className="text-muted">
              Real public data in, execution estimate out. No fake routes. No invented coverage. Execution handoff is external until a quote router is added later.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container panel panel-strong content-panel cta-row">
          <div>
            <div className="kicker">Ready now</div>
            <h2 className="heading-lg" style={{ marginTop: 12 }}>Run the analyzer, save route history and monitor tracked pairs.</h2>
            <p className="text-muted" style={{ marginTop: 10, maxWidth: 760 }}>
              This production MVP includes the core product loop: analyze, compare, decide, track and execute through the selected source.
            </p>
          </div>
          <Link href="/analyzer" className="btn btn-primary">Open analyzer</Link>
        </div>
      </section>
    </main>
  );
}
