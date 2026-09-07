
"use client";

import { useEffect, useState } from "react";

type ActivityStatus = "complete" | "current" | "pending" | "blocked";

export default function Home() {
  const [approved, setApproved] = useState(false);
  const [riskMessage, setRiskMessage] = useState("");
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [marketError, setMarketError] = useState("");
  const [riskResult, setRiskResult] = useState<{
    approved: boolean;
    riskReward?: number;
    reason: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const loadMarketData = async () => {
      try {
        const response = await fetch("/api/market", { cache: "no-store" });
        const data = (await response.json()) as {
          price?: number;
          error?: string;
        };

        if (!response.ok || typeof data.price !== "number") {
          throw new Error(data.error ?? "Unable to retrieve market data.");
        }

        if (active) {
          setBtcPrice(data.price);
          setMarketError("");
          setApproved(false);
          setRiskResult(null);
          setRiskMessage("");
        }
      } catch (error) {
        if (active) {
          setMarketError(
            error instanceof Error
              ? error.message
              : "Unable to retrieve market data."
          );
        }
      }
    };

    loadMarketData();
    const interval = window.setInterval(loadMarketData, 30_000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const btcPriceLabel =
    btcPrice === null
      ? "Loading..."
      : `$${btcPrice.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  const entry = btcPrice;
  const stopLoss = entry === null ? null : entry * 0.98;
  const takeProfit = entry === null ? null : entry * 1.045;
  const marketAnalysis =
    btcPrice === null
      ? {
          bias: "NEUTRAL",
          confidence: 0,
          reasoning: "Waiting for the live BTCUSDT price snapshot.",
          riskWarning: "Market context is unavailable until live data arrives.",
        }
      : {
          bias: "NEUTRAL",
          confidence: 50,
          reasoning:
            "The live BTCUSDT snapshot supports a demo reference price, but a single price point does not confirm trend or momentum.",
          riskWarning:
            "BTC can move sharply; this demo analysis has no volume, volatility, or historical confirmation.",
        };
  const analysisDecision =
    riskResult === null
      ? "Potential LONG setup requires RiskGuard validation before approval."
      : riskResult.approved
        ? "RiskGuard passed the demo setup; human approval is still required."
        : `Trade blocked by RiskGuard: ${riskResult.reason}`;
  const activityStages: {
    name: string;
    detail: string;
    status: ActivityStatus;
  }[] =
    btcPrice === null
      ? [
          {
            name: "OBSERVE",
            detail: "Waiting for live BTCUSDT data",
            status: "current",
          },
          {
            name: "ANALYZE",
            detail: "Waiting for market analysis",
            status: "pending",
          },
          {
            name: "VALIDATE",
            detail: "Waiting for RiskGuard checks",
            status: "pending",
          },
          {
            name: "REQUEST APPROVAL",
            detail: "Waiting for validated setup",
            status: "pending",
          },
          {
            name: "ACT",
            detail: "Demo action pending",
            status: "pending",
          },
        ]
      : riskResult === null
        ? [
            {
              name: "OBSERVE",
              detail: "Live BTCUSDT data received",
              status: "complete",
            },
            {
              name: "ANALYZE",
              detail: "AI market analysis completed",
              status: "complete",
            },
            {
              name: "VALIDATE",
              detail: "RiskGuard checks pending",
              status: "pending",
            },
            {
              name: "REQUEST APPROVAL",
              detail: "Waiting for user approval",
              status: "current",
            },
            {
              name: "ACT",
              detail: "Demo action pending",
              status: "pending",
            },
          ]
        : riskResult.approved
          ? [
              {
                name: "OBSERVE",
                detail: "Live BTCUSDT data received",
                status: "complete",
              },
              {
                name: "ANALYZE",
                detail: "AI market analysis completed",
                status: "complete",
              },
              {
                name: "VALIDATE",
                detail: "RiskGuard checks completed",
                status: "complete",
              },
              {
                name: "REQUEST APPROVAL",
                detail: "User approval received",
                status: "complete",
              },
              {
                name: "ACT",
                detail: "SIMULATED — APPROVED",
                status: "current",
              },
            ]
          : [
              {
                name: "OBSERVE",
                detail: "Live BTCUSDT data received",
                status: "complete",
              },
              {
                name: "ANALYZE",
                detail: "AI market analysis completed",
                status: "complete",
              },
              {
                name: "VALIDATE",
                detail: "BLOCKED — RiskGuard checks failed",
                status: "blocked",
              },
              {
                name: "REQUEST APPROVAL",
                detail: "Approval unavailable",
                status: "blocked",
              },
              {
                name: "ACT",
                detail: "Not reached — no action taken",
                status: "blocked",
              },
            ];
  const formatPrice = (price: number | null) =>
    price === null
      ? "Loading..."
      : `$${price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              RiskGuard <span className="text-yellow-400">AI</span>
            </h1>
            <p className="text-sm text-gray-400">
              AI trading with a safety layer
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-green-800 bg-green-950 px-4 py-2 text-sm text-green-400">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            Demo Mode
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Pipeline */}
        <section className="grid grid-cols-5 gap-3">
          {[
            ["01", "MARKET DATA"],
            ["02", "AI ANALYSIS"],
            ["03", "RISKGUARD"],
            ["04", "APPROVAL"],
            ["05", "EXECUTION"],
          ].map(([number, title], index) => (
            <div
              key={title}
              className={`rounded-xl border p-4 ${
                index === 2
                  ? "border-yellow-500 bg-yellow-500/10"
                  : "border-gray-800 bg-[#11161c]"
              }`}
            >
              <p className="text-xs text-gray-500">{number}</p>
              <p className="mt-1 text-sm font-semibold">{title}</p>
            </div>
          ))}
        </section>

        {/* Market cards */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            ["BTC/USDT", btcPriceLabel, "+2.41%"],
            ["ETH/USDT", "$4,368.21", "+1.87%"],
            ["BNB/USDT", "$842.16", "+0.92%"],
          ].map(([symbol, price, change]) => (
            <div
              key={symbol}
              className="rounded-2xl border border-gray-800 bg-[#11161c] p-5"
            >
              <p className="text-sm text-gray-400">{symbol}</p>
              <p className="mt-2 text-2xl font-bold">{price}</p>
              <p className="mt-1 text-sm text-green-400">{change}</p>
            </div>
          ))}
          </section>
          {marketError && (
            <p className="text-sm text-red-400" role="alert">
              {marketError}
            </p>
          )}

        {/* Main dashboard */}
        <section className="grid gap-6 lg:grid-cols-3">
          {/* AI Analysis */}
          <div className="rounded-2xl border border-gray-800 bg-[#11161c] p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">AI Market Analysis</h2>
                <p className="text-sm text-gray-400">
                  Binance market observation
                </p>
              </div>

              <span className="rounded-md bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                LIVE SNAPSHOT
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-[#0b0e11] p-4">
                <p className="text-sm text-gray-400">Market Bias</p>
                <p className="mt-1 text-lg font-semibold text-blue-400">
                  {marketAnalysis.bias}
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({marketAnalysis.confidence}% confidence)
                  </span>
                </p>
              </div>

              <div className="rounded-xl bg-[#0b0e11] p-4">
                <p className="text-sm text-gray-400">AI Reasoning</p>
                <p className="mt-2 leading-7 text-gray-300">
                  {marketAnalysis.reasoning}
                </p>
              </div>

              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
                <p className="text-sm text-red-400">Key Risk Warning</p>
                <p className="mt-2 text-gray-300">
                  {marketAnalysis.riskWarning}
                </p>
              </div>

              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4">
                <p className="text-sm text-yellow-400">Agent Decision</p>
                <p className="mt-2 text-gray-300">
                  {analysisDecision}
                </p>
              </div>
            </div>
          </div>

          {/* RiskGuard */}
          <div className="rounded-2xl border border-yellow-500/40 bg-[#11161c] p-6">
            <h2 className="text-xl font-bold">RiskGuard</h2>
            <p className="mt-1 text-sm text-gray-400">
              Deterministic safety checks
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk / Trade</span>
                <span>1%</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Minimum R:R</span>
                <span>2.0</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Daily Loss</span>
                <span>$120 / $500</span>
              </div>

              <div className="border-t border-gray-800 pt-4">
                <div className="flex items-center justify-between">
                  <span>Risk Check</span>
                  <span
                    className={`rounded-md px-3 py-1 ${
                      riskResult === null
                        ? "bg-gray-500/10 text-gray-400"
                        : riskResult.approved
                          ? "bg-green-500/10 text-green-400"
                          : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {riskResult === null
                      ? "PENDING"
                      : riskResult.approved
                        ? "PASS"
                        : "BLOCKED"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-gray-500/5 p-4 text-sm text-gray-300">
              {riskResult?.reason ??
                "Submit the live demo setup for RiskGuard validation."}
              </div>
            </div>
          </div>
        </section>

        {/* Trade setup */}
        <section className="rounded-2xl border border-gray-800 bg-[#11161c] p-6">
          <h2 className="text-xl font-bold">Proposed Trade Setup</h2>

          <div className="mt-5 grid gap-4 md:grid-cols-6">
            {[
              ["Direction", "LONG"],
              ["Live BTCUSDT", btcPriceLabel],
              ["Entry", formatPrice(entry)],
              ["Stop Loss", formatPrice(stopLoss)],
              ["Take Profit", formatPrice(takeProfit)],
              [
                "Risk / Reward",
                stopLoss === null || entry === null
                  ? "Loading..."
                  : ((takeProfit! - entry) / (entry - stopLoss)).toFixed(2),
              ],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-[#0b0e11] p-4">
                <p className="text-xs text-gray-500">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
             onClick={async () => {
               if (entry === null || stopLoss === null || takeProfit === null) {
                 setRiskMessage(
                   "RiskGuard BLOCKED — Live BTCUSDT price is unavailable."
                 );
                 return;
               }

               const response = await fetch("/api/analyze", {
                 method: "POST",
                 headers: { "Content-Type": "application/json" },
                 body: JSON.stringify({
                   trade: {
                     direction: "LONG",
                     entry,
                     stopLoss,
                     takeProfit,
                   },
                 }),
               });

               const data = await response.json();

               if (!response.ok || !data.riskGuard) {
                 setApproved(false);
                 setRiskResult({
                   approved: false,
                   reason: data.error ?? "RiskGuard could not validate the setup.",
                 });
                 setRiskMessage(
                   `RiskGuard BLOCKED — ${data.error ?? "Validation failed."}`
                 );
                 return;
               }

               setRiskResult(data.riskGuard);
               if (data.riskGuard.approved) {
                 setApproved(true);
                 setRiskMessage(
                   `RiskGuard PASS — R:R ${data.riskGuard.riskReward.toFixed(2)}`
                 );
               } else {
                 setApproved(false);
                 setRiskMessage(
                   `RiskGuard BLOCKED — ${data.riskGuard.reason}`
                 );
               }
             }}
             className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
             {approved ? "✓ Trade Approved" : "Approve Trade"}
            </button>
            {riskMessage && (
  <div className="mt-3 rounded-lg border border-gray-700 bg-gray-900 p-3 text-sm text-gray-300">
    {riskMessage}
  </div>
)}

            <button className="rounded-xl border border-gray-700 px-6 py-3 font-semibold text-gray-300 hover:bg-gray-800">
              Reject
            </button>
          </div>
        </section>

        {/* Agent log */}
        <section className="rounded-2xl border border-gray-800 bg-[#11161c] p-6">
          <h2 className="text-xl font-bold">Agent Activity</h2>

          <div className="mt-4 space-y-3 font-mono text-sm">
            {activityStages.map((stage) => (
              <div
                key={stage.name}
                className={`rounded-lg border px-4 py-3 ${
                  stage.status === "current"
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
                    : stage.status === "blocked"
                      ? "border-red-500/40 bg-red-500/5 text-red-300"
                      : stage.status === "complete"
                        ? "border-green-500/20 bg-green-500/5 text-gray-300"
                        : "border-gray-800 text-gray-500"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <span>
                    <span className="mr-2">
                      {stage.status === "complete"
                        ? "✓"
                        : stage.status === "blocked"
                          ? "!"
                          : stage.status === "current"
                            ? "→"
                            : "·"}
                    </span>
                    {stage.name}
                  </span>
                  <span className="text-right text-xs">{stage.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}