# RiskGuard AI — Bitget

## The Safety Layer for AI Trading

RiskGuard AI is an AI trading safety layer designed for Bitget.

The system sits between an AI trading agent and exchange execution. The AI can propose a trade, but RiskGuard independently validates the trade against predefined risk rules before execution can proceed.

## Core Flow

OBSERVE → ANALYZE → VALIDATE → APPROVE → ACT

## How It Works

1. **Observe**
   - Retrieves market information from Bitget public market data.

2. **Analyze**
   - An AI trading workflow proposes a trade.

3. **Validate**
   - RiskGuard checks:
     - Risk percentage
     - Stop-loss validity
     - Take-profit validity
     - Risk-to-reward ratio
     - Daily loss limit
     - Position sizing

4. **Approve**
   - A human approval step is required.

5. **Act**
   - The current hackathon demo uses simulated execution.

## Safety Principle

> AI can propose the trade. RiskGuard decides whether the trade satisfies the safety rules.

The AI cannot override RiskGuard's risk controls.

## Bitget Integration

The project uses Bitget public market data for the BTCUSDT market.

Authenticated trading is intentionally disabled in the demo to prevent real-money execution.

## Risk Rules

Default demo configuration:

- Account balance: $10,000
- Maximum risk per trade: 1%
- Minimum R:R: 3:1
- Maximum daily loss: $500
- Stop loss required
- Position size must be valid

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Bitget public market API
- Deterministic risk-validation engine

## Why RiskGuard?

AI trading agents can make decisions quickly, but speed does not guarantee safe execution.

RiskGuard provides an independent safety layer between an AI agent and an exchange.

The goal is simple:

**AI proposes. RiskGuard validates. Humans approve.**

## Demo

The application runs in demo mode.

No real funds are traded and no withdrawal functionality is enabled.

## Hackathon

Built for the Bitget AI × Crypto Hackathon — Genesis Season 2.

Track: Agentic Trading