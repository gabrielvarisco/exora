# Exora — Production MVP

Exora is a **DEX Execution Optimizer** focused on **execution intelligence** rather than generic market dashboards.

It compares real public-data route candidates and helps the user decide **where execution quality looks strongest before swapping**.

## What is included

This bundle ships a complete MVP covering the roadmap through Sprint 9, with pragmatic limitations clearly exposed in the UI:

- Landing page
- `/analyzer` live route analyzer
- Execution score engine
- Decision summary
- Recent analysis history
- Tracked pairs and alerts UI
- Execution handoff button
- Vercel-ready Next.js app

## What uses real data

The analyzer uses **real public market/pool data** from:

- DEX Screener API
- GeckoTerminal API

These sources provide pool, liquidity, volume and pricing context.

## Important limitations

This MVP does **not** compute fully executable multi-hop routing from an aggregator such as 1inch or 0x.

Why:
- DEX Screener and GeckoTerminal provide public market/pool data, not full execution routing.
- Gas is estimated heuristically by chain + route quality, not by on-chain simulation.
- Alerts are application-level monitoring based on refreshed analyses, not background on-chain indexing.

That means the product is honest about what it knows:
- **real pool data**
- **estimated execution quality**
- **no fake numbers**

## Install

```bash
npm install
npm run dev
```

Open:

```bash
http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a new GitHub repository
2. Import the repo into Vercel
3. Deploy with default settings

No environment variables are required for the MVP.

## Recommended first test

Use liquid, common pairs first:
- Ethereum / WETH / USDC
- Base / WETH / USDC
- Arbitrum / WETH / USDC

When possible, prefer **token contract addresses** over symbols for higher precision.

## Monetization readiness

The app includes a simple monetization config in `lib/monetization.ts`.

Current MVP behavior:
- analysis is free
- execution handoff is external
- future fee architecture is prepared conceptually

## Roadmap status in this bundle

- Sprint 1 — Foundation & live launch ✅
- Sprint 2 — Real route data ✅
- Sprint 3 — Execution scoring engine ✅
- Sprint 4 — Professional UI ✅
- Sprint 5 — Execution intelligence ✅
- Sprint 6 — Route monitoring ✅
- Sprint 7 — Alerts ✅
- Sprint 8 — Execution integration ✅
- Sprint 9 — Production launch prep ✅
