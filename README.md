# Exora Pro Rebuild

A cleaner rebuild of Exora as a DEX execution optimizer with one cohesive analyzer screen, wallet modal integration, saved history, alerts, and a route comparison flow based on public DEX data.

## Included

- Landing page
- Analyzer page with a single professional trade terminal
- RainbowKit wallet modal for multi-wallet / WalletConnect QR flows
- Token selector modal
- Route analysis API using public Dexscreener pool data
- Execution score model
- Local history and alerts pages

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Required env

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

If you do not provide a WalletConnect project id, the app falls back to a demo placeholder id. For production, add a real value locally and in Vercel.

## Notes

- Route outputs are estimates, not signed router quotes.
- The app uses public pool visibility and scores execution quality from liquidity, volume, impact, slippage and gas assumptions.
- Wallet connect is handled by RainbowKit.

## Deploy to Vercel

- Import the repository in Vercel
- Add `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Deploy
