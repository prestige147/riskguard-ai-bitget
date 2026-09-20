"use client";

import { useEffect, useState } from "react";

type AIAnalysis = {
  bias: "BULLISH" | "BEARISH" | "NEUTRAL";
  direction: "LONG" | "SHORT" | "NO_TRADE";
  confidence: number;
  reasoning: string;
  riskWarning: string;
};

type RiskAnalysis = {
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
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
  const [approved, setApproved] = useState(false);

  const balance = 10000;
  const riskPercent = 1;
  const dailyLoss = 120;
  const entry = price || 100000;

  const direction =
    aiAnalysis?.direction === "SHORT" ? "SHORT" : "LONG";

  const stopLoss =
    direction === "LONG" ? entry * 0.99 : entry * 1.01;

  const takeProfit =
    direction === "LONG" ? entry * 1.03 : entry * 0.97;

  async function loadMarket() {
    try {
      setLoading(true);
      const response = await fetch("/api/market", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Market request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Bitget market data:", data);

      if (typeof data.price === "number") {
        setPrice(data.price);
        setChange(typeof data.change24h === "number" ? data.change24h : 0);
      } else {
        throw new Error("Invalid market price received");
      }
    } catch (error) {
      console.error("Market error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function analyzeTrade() {
    setAnalyzing(true);
    setApproved(false);
    setAnalysis(null);

    try {
      const aiResponse = await fetch("/api/analyze-market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price: entry, change24h: change }),
      });

      const aiData = await aiResponse.json();

      if (!aiResponse.ok || aiData.error) {
        throw new Error(aiData.error || "AI market analysis failed");
      }

      setAiAnalysis(aiData);

      if (aiData.direction === "NO_TRADE") {
        setAnalysis({
          approved: false,
          riskMessage: "AI did not produce a sufficiently confident trading direction.",
        });
        return;
      }

      const riskResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          direction: aiData.direction,
          entry,
          stopLoss: aiData.direction === "SHORT" ? entry * 1.01 : entry * 0.99,
          takeProfit: aiData.direction === "SHORT" ? entry * 0.97 : entry * 1.03,
          riskPercent,
          balance,
          dailyLoss,
        }),
      });

      const riskData = await riskResponse.json();

      if (!riskResponse.ok) {
        throw new Error(riskData.riskMessage || "Risk validation failed");
      }

      setAnalysis(riskData);
      setApproved(Boolean(riskData.approved));
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis({
        approved: false,
        riskMessage:
          error instanceof Error ? error.message : "Analysis failed safely.",
      });
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    loadMarket();
    const interval = setInterval(loadMarket, 10000);
    return () => clearInterval(interval);
  }, []);

  const checks: Array<[string, boolean | undefined]> = [
    ["Risk within limit", analysis?.checks?.risk],
    ["R:R requirement passed", analysis?.checks?.rr],
    ["Stop loss valid", analysis?.checks?.stopLoss],
    ["Daily loss limit passed", analysis?.checks?.dailyLoss],
    ["Position size acceptable", analysis?.checks?.positionSize],
  ];

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 font-black">
              R
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">RISKGUARD AI</h1>
              <p className="text-sm text-gray-400">The Safety Layer for AI Trading</p>
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
                    ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
                    : "Unavailable"}
                </div>
                <div className={change >= 0 ? "text-sm text-green-400" : "text-sm text-red-400"}>
                  {change >= 0 ? "+" : ""}
                  {change.toFixed(2)}% 24h
                </div>
              </div>
            </div>

            {aiAnalysis && (
              <div className="mb-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">GROQ / LLAMA</p>
                    <h3 className="text-lg font-bold">AI Market Analysis</h3>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      aiAnalysis.bias === "BULLISH"
                        ? "bg-green-500/10 text-green-400"
                        : aiAnalysis.bias === "BEARISH"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {aiAnalysis.bias}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-black/20 p-3">
                    <div className="text-xs text-gray-500">AI Direction</div>
                    <div className="mt-1 font-bold">{aiAnalysis.direction}</div>
                  </div>
                  <div className="rounded-xl bg-black/20 p-3">
                    <div className="text-xs text-gray-500">Confidence</div>
                    <div className="mt-1 font-bold">{aiAnalysis.confidence}%</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-gray-500">AI Reasoning</div>
                  <p className="mt-1 text-sm text-gray-300">{aiAnalysis.reasoning}</p>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-gray-500">Risk Warning</div>
                  <p className="mt-1 text-sm text-gray-400">{aiAnalysis.riskWarning}</p>
                </div>
              </div>
            )}

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <Metric label="Entry" value={`$${entry.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <Metric label="Stop Loss" value={`$${stopLoss.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
              <Metric label="Take Profit" value={`$${takeProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-400">AI Proposed Trade</span>
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400">
                  {aiAnalysis?.direction || "WAITING"}
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
                <div className={`font-black ${approved ? "text-green-400" : "text-red-400"}`}>
                  {approved ? "TRADE APPROVED" : "TRADE BLOCKED"}
                </div>
                <p className="mt-2 text-sm text-gray-300">{analysis.riskMessage}</p>
                {analysis.metrics && (
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                    <span>
                      R:R: <b className="text-white">{analysis.metrics.rr}</b>
                    </span>
                    <span>
                      Risk: <b className="text-white">${analysis.metrics.riskAmount}</b>
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
            <h2 className="text-xl font-bold">AI Trading Safety Pipeline</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Activity title="AI analyzes" text="Groq / Llama" />
            <Activity
              title="AI proposes"
              text={aiAnalysis ? `${aiAnalysis.direction} BTCUSDT` : "Awaiting analysis"}
            />
            <Activity title="RiskGuard checks" text="Risk + R:R + limits" />
            <Activity title="Human approval" text="Required before execution" />
          </div>
        </section>

        <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-blue-500/20 bg-blue-500/[0.05] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Ready to validate this AI proposal?</p>
            <p className="text-sm text-gray-400">
              The AI proposes. RiskGuard independently validates. Humans approve.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setAiAnalysis(null);
                setAnalysis(null);
                setApproved(false);
              }}
              className="rounded-xl border border-white/10 px-5 py-3 font-bold text-gray-300 hover:bg-white/5"
            >
              REJECT
            </button>
            <button
              onClick={analyzeTrade}
              disabled={analyzing || !price}
              className="rounded-xl bg-blue-500 px-6 py-3 font-black text-white hover:bg-blue-400 disabled:opacity-50"
            >
              {analyzing ? "AI ANALYZING..." : "ANALYZE & VALIDATE"}
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 font-bold">{value}</div>
    </div>
  );
}

function Activity({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-sm font-bold">{title}</div>
      <div className="mt-1 text-xs text-gray-500">{text}</div>
    </div>
  );
}