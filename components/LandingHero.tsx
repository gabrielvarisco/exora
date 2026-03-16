import Link from "next/link";

export default function LandingHero() {
  return (
    <section className="landing-hero shell">
      <div className="landing-copy">
        <span className="eyebrow">Execution intelligence</span>
        <h1>Find the best swap route before you execute.</h1>
        <p>
          Exora compares visible DEX liquidity, slippage risk, gas burden and execution quality so you can choose the
          strongest route with confidence.
        </p>
        <div className="hero-actions">
          <Link href="/analyzer" className="primary-btn">Open Analyzer</Link>
          <Link href="/history" className="secondary-btn">View History</Link>
        </div>
      </div>

      <div className="landing-panel glass-card">
        <div className="metric-grid">
          <div>
            <span>Purpose</span>
            <strong>Execution-first</strong>
          </div>
          <div>
            <span>Focus</span>
            <strong>Routes · Slippage · Gas</strong>
          </div>
          <div>
            <span>Monetization</span>
            <strong>Execution fee later</strong>
          </div>
          <div>
            <span>Data policy</span>
            <strong>No fake coverage</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
