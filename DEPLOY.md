# Deploying PrivyPay

Next.js 16 app; deploys cleanly on **Vercel**. `next build` is the production build (verified).

## 1. Push, then import the repo
The code lives on GitHub (`nofazechris/PrivyPay`). In Vercel: **Add New → Project → Import** the repo.
Framework preset is auto-detected (Next.js). Build command `next build`, output handled by Vercel.
Pick the branch to deploy as production (`main`, or set `stage-6-celo` as the production branch).

## 2. Environment variables (Project → Settings → Environment Variables)
Set these for **Production** (and Preview if you use it). `.env*` is gitignored, so nothing is
committed — you enter them here. Copy names from `.env.example`.

**Required for the core app**
- `DATABASE_URL` — Supabase Postgres connection string
- `PRIVY_APP_ID`, `PRIVY_APP_SECRET`, `NEXT_PUBLIC_PRIVY_APP_ID`
- `CELO_NETWORK` (`sepolia` for now), `CELO_SEPOLIA_RPC_URL` (and `CELO_RPC_URL` for mainnet), `CELO_USDC_ADDRESS`
- `NEXT_PUBLIC_SITE_URL` — the deployed origin, e.g. `https://privypay.vercel.app`
- `APP_ENV` = `production`

**AI agent (in-app)** — until set, the agent uses the safe rule-based fallback
- `AI_PROVIDER` = `openai`, `AI_API_KEY` = your OpenAI key, `AI_MODEL` (optional, e.g. `gpt-4o-mini`)

**MCP (ChatGPT/Claude)** — required to enable the MCP endpoint
- `MCP_SECRET` = any non-empty value (feature flag that turns `/api/mcp` on)

**Delegated server signing (autonomous confirm + recurring execution)** — optional
- `PRIVY_AUTHORIZATION_KEY` = Privy authorization private key (register the keypair in the Privy
  dashboard, enable delegated actions). Without it, `confirm_payment` and the recurring worker
  safely fall back / skip.

**Recurring cron** — required for the schedule to run
- `CRON_SECRET` = any non-empty value. Vercel Cron automatically calls `/api/cron/recurring`
  hourly (see `vercel.json`) and sends `Authorization: Bearer $CRON_SECRET`, which the endpoint
  checks. Without it the endpoint is disabled (404).

## 3. Privy dashboard
Add the deployed origin (`https://<your-domain>`) to Privy's **allowed origins / redirect URLs**,
or login and embedded wallets won't work on the live site.

## 4. After deploy
- **MCP endpoint** is public at `https://<your-domain>/api/mcp` — paste it + a generated token
  (Connected → Connect ChatGPT/Claude) into the agent's custom connector.
- **Recurring** runs on the Vercel Cron schedule in `vercel.json` (hourly). Hobby plan limits
  cron frequency to once/day — bump to Pro for finer schedules, or adjust the schedule there.
- Run DB migrations against the production database if it's a fresh one: `npm run db:migrate`
  with that `DATABASE_URL` (the current Supabase DB already has all tables).
