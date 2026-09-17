"use client";

import { useEffect, useState } from "react";

type Analysis = {
  approved: boolean;
  riskMessage: string;
  metrics?: {
    riskAmount: number;
    riskDistance: number;
    rewardDistance: number;
    rr: number;
    positionSize: number;
  };
  checks?: {
    risk: boolean;
    rr: boolean;
    stopLoss: boolean;
    dailyLoss: boolean;
    positionSize: boolean;
  };
};

export default function Home() {
  const [price, setPrice] = useState(0);
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [approved, setApproved] = useState(false);

  const balance = 10000;
  const riskPercent = 1;
  const dailyLoss = 120;

  const entry = price || 100000;
  const stopLoss = entry * 0.99;
  const takeProfit = entry * 1.03;

  async function loadMarket() {
    try {
      const response = await fetch("/api/market", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.price) {
        setPrice(data.price);
        setChange(data.change24h);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeTrade() {
    setAnalyzing(true);
    setApproved(false);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direction: "LONG",
          entry,
          stopLoss,
          takeProfit,
          riskPercent,
          balance,
          dailyLoss,
        }),
      });

      const data = await response.json();
      setAnalysis(data);
      setApproved(Boolean(data.approved));
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    loadMarket();

    const interval = setInterval(loadMarket, 10000);

    return () => clearInterval(interval);
  }, []);

  const checks = [
    ["Risk within limit", analysis?.checks?.risk],
    ["R:R requirement passed", analysis?.checks?.rr],
    ["Stop loss present", analysis?.checks?.stopLoss],
    ["Daily loss limit passed", analysis?.checks?.dailyLoss],
    ["Position size acceptable", analysis?.checks?.positionSize],
  ];

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">

        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-black">
                R
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight">
                  RISKGUARD AI
                </h1>
                <p className="text-sm text-gray-400">
                  The Safety Layer for AI Trading
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-sm font-bold text-blue-400">
            BITGET • DEMO MODE
          </div>
        </header>

        <section className="mb-8 grid gap-4 md:grid-cols-5">
          {[
            ["01", "OBSERVE"],
            ["02", "ANALYZE"],
            ["03", "VALIDATE"],
            ["04", "APPROVE"],
            ["05", "ACT"],
          ].map(([number, label], index) => (
            <div
              key={label}
              className={`rounded-2xl border p-4 ${
                index < 3
                  ? "border-blue-500/30 bg-blue-500/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="text-xs text-gray-500">{number}</div>
              <div className="mt-1 font-bold">{label}</div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">LIVE MARKET</p>
                <h2 className="text-2xl font-bold">BTCUSDT</h2>
              </div>

              <div className="text-right">
                <div className="text-3xl font-black">
                  {loading
                    ? "Loading..."
                    : price
                    ? `$${price.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}`
                    : "Unavailable"}
                </div>

                <div
                  className={
                    change >= 0
                      ? "text-sm text-green-400"
                      : "text-sm text-red-400"
                  }
                >
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}% 24h
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Metric
                label="Entry"
                value={`$${entry.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`}
              />

              <Metric
                label="Stop Loss"
                value={`$${stopLoss.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`}
              />

              <Metric
                label="Take Profit"
                value={`$${takeProfit.toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}`}
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-400">AI Proposed Trade</span>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                  LONG
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Metric label="Risk" value="1.00%" />
                <Metric label="Target R:R" value="3.00+" />
                <Metric label="Daily Loss" value="$120 / $500" />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="mb-6">
              <p className="text-sm text-gray-500">RISKGUARD</p>
              <h2 className="text-2xl font-bold">Validation</h2>
            </div>

            <div className="space-y-3">
              {checks.map(([label, passed]) => (
                <div
                  key={String(label)}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <span className="text-sm text-gray-300">{label}</span>

                  <span
                    className={
                      passed
                        ? "font-bold text-green-400"
                        : analysis
                        ? "font-bold text-red-400"
                        : "font-bold text-gray-500"
                    }
                  >
                    {passed ? "✓" : analysis ? "✕" : "—"}
                  </span>
                </div>
              ))}
            </div>

            {analysis && (
              <div
                className={`mt-5 rounded-2xl border p-4 ${
                  approved
                    ? "border-green-500/30 bg-green-500/10"
                    : "border-red-500/30 bg-red-500/10"
                }`}
              >
                <div
                  className={`font-black ${
                    approved ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {approved ? "TRADE APPROVED" : "TRADE BLOCKED"}
                </div>

                <p className="mt-2 text-sm text-gray-300">
                  {analysis.riskMessage}
                </p>

                {analysis.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <span>
                      R:R:{" "}
                      <b className="text-white">
                        {analysis.metrics.rr}
                      </b>
                    </span>

                    <span>
                      Risk:{" "}
                      <b className="text-white">
                        ${analysis.metrics.riskAmount}
                      </b>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5">
            <p className="text-sm text-gray-500">AGENT ACTIVITY</p>
            <h2 className="text-xl font-bold">
              AI Trading Safety Pipeline
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Activity
              title="AI proposes"
              text="Long BTCUSDT"
            />

            <Activity
              title="RiskGuard checks"
              text="Risk + R:R + limits"
            />

            <Activity
              title="Human approval"
              text="Required before execution"
            />

            <Activity
              title="Exchange"
              text="Bitget simulated execution"
            />
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-blue-500/20 bg-blue-500/[0.05] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Ready to validate this trade?</p>
            <p className="text-sm text-gray-400">
              RiskGuard can disagree with the AI. It cannot override its
              safety rules.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setAnalysis(null);
                setApproved(false);
              }}
              className="rounded-xl border border-white/10 px-5 py-3 font-bold text-gray-300 hover:bg-white/5"
            >
              REJECT
            </button>

            <button
              onClick={analyzeTrade}
              disabled={analyzing}
              className="rounded-xl bg-blue-500 px-6 py-3 font-black text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {analyzing ? "VALIDATING..." : "APPROVE TRADE"}
            </button>
          </div>
        </section>

        <footer className="mt-8 text-center text-xs text-gray-600">
          RiskGuard AI • Bitget Hackathon Demo • No real funds are traded
        </footer>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function Activity({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{text}</div>
    </div>
  );
}
