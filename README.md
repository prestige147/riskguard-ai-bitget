# RiskGuard AI

> **AI trading with a safety layer.**

RiskGuard AI is a Binance Agent OS hackathon project that demonstrates how an AI-assisted trading workflow can be made safer through deterministic controls and explicit human approval. It observes live BTCUSDT market data, produces a concise analysis, proposes a demo LONG setup, and sends that setup through RiskGuard before any simulated approval is recorded.

## The problem

AI trading agents can move quickly from market observation to an action without making risk constraints visible or enforceable. A useful agent needs more than a signal: it needs a safety layer that can reject invalid or over-risky proposals and keep a person in control.

## The solution

RiskGuard AI separates market analysis from execution authorization:

- Live BTCUSDT data supplies the current reference price.
- The dashboard derives a transparent demo LONG setup from that price.
- A deterministic RiskGuard validator checks the setup.
- The user must explicitly approve a passing setup.
- Approval records a simulated action only; no live order is submitted.

The dark dashboard makes the analysis, risk checks, approval state, and agent activity visible in one place.

## How the agent works

```text
OBSERVE → ANALYZE → VALIDATE → REQUEST APPROVAL → ACT
```

1. **OBSERVE** - Receives the current BTCUSDT price.
2. **ANALYZE** - Presents a concise market view with bias, confidence, reasoning, and a risk warning. The current implementation uses a conservative neutral assessment because a single ticker price does not establish trend, volume, or momentum.
3. **VALIDATE** - Sends the proposed LONG setup to the existing RiskGuard API.
4. **REQUEST APPROVAL** - Waits for the user to approve or reject the validated demo setup.
5. **ACT** - Records `SIMULATED — APPROVED` in Demo Mode after approval. This is not a Binance order.

The dashboard also shows each stage in the Agent Activity Log. If RiskGuard blocks the setup, VALIDATE is marked `BLOCKED` and the workflow does not progress to ACT.

## The RiskGuard safety layer

RiskGuard is deterministic and remains authoritative over the AI analysis. The current demo configuration enforces:

- **Maximum risk per trade:** 1% of the demo account balance.
- **Minimum risk/reward:** 2.0.
- **Maximum daily loss:** $500.
- **Current demo loss:** $120, shown as `$120 / $500`.
- **User approval:** A passing setup still requires an explicit user action before simulated execution is recorded.
- **AI cannot override RiskGuard:** Invalid stop-loss/take-profit relationships, insufficient risk/reward, or the daily-loss limit result in a blocked response.

The demo setup uses the live BTCUSDT price as its entry/reference price, a stop loss 2% below entry, and a take profit 4.5% above entry. This produces a 2.25 risk/reward ratio under normal arithmetic and is still submitted to the validator rather than being trusted automatically.

## Binance integration

Binance Agent OS / MCP was configured and authenticated in VS Code through the project MCP configuration.

The current dashboard's live BTCUSDT market price is retrieved through Binance's public, read-only market endpoint:

```text
GET https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT
```

The Binance MCP market-data call returned `401 Unauthorized` from the app environment, so the dashboard uses the public ticker endpoint for the current read-only price path. The application does **not** claim to execute trades through MCP, and no MCP trading action is wired into the dashboard.

## Demo Mode and safety limitations

RiskGuard AI is intentionally a demonstration:

- **Demo Mode is always enabled** in the dashboard.
- The Approve Trade button only records simulated approval after RiskGuard passes.
- No real Binance trades are executed.
- No withdrawals are supported.
- No Binance API keys are required, stored, or used.
- No real-money account, balances, or positions are managed.
- The analysis is intentionally limited by the available ticker snapshot and should not be treated as financial advice.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Binance public read-only market data endpoint
- Binance Agent OS / MCP configuration in VS Code

## Run locally

Requirements: Node.js and npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful commands:

```bash
npm run lint
npm run build
npm start
```

## Project routes

- `app/page.tsx` - Dashboard, live market display, analysis, RiskGuard state, approval flow, and Agent Activity Log.
- `app/api/market/route.ts` - Validated read-only BTCUSDT ticker proxy.
- `app/api/analyze/route.ts` - Deterministic LONG setup validation.
- `.vscode/mcp.json` - Binance Agent OS / MCP server configuration.

## Future improvements

- Add authenticated MCP market-data access when the deployment environment supports it.
- Use a broader read-only market snapshot, including historical candles, volume, volatility, and spread.
- Persist auditable analysis and RiskGuard decisions.
- Make risk settings configurable for a sandbox account while preserving hard safety limits.
- Add automated tests for blocked setups, stale data, and approval-state transitions.
- Add richer observability for the agent pipeline without enabling live execution.

