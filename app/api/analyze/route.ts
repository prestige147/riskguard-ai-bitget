import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const trade = await request.json();

    const {
      direction,
      entry,
      stopLoss,
      takeProfit,
      riskPercent,
      balance,
      dailyLoss,
    } = trade;

    const riskAmount = balance * (riskPercent / 100);

    const riskDistance =
      direction === "LONG"
        ? entry - stopLoss
        : stopLoss - entry;

    const rewardDistance =
      direction === "LONG"
        ? takeProfit - entry
        : entry - takeProfit;

    const rr =
      riskDistance > 0
        ? rewardDistance / riskDistance
        : 0;

    const checks = {
      risk: riskPercent > 0 && riskPercent <= 1,
      rr: rr >= 2.99,
      stopLoss: riskDistance > 0,
      dailyLoss: dailyLoss <= balance * 0.05,
      positionSize: riskDistance > 0,
    };

    const approved = Object.values(checks).every(Boolean);

    return NextResponse.json({
      approved,
      riskMessage: approved
        ? "Trade passed all RiskGuard safety checks."
        : "Trade blocked by RiskGuard safety rules.",
      metrics: {
        riskAmount: Number(riskAmount.toFixed(2)),
        rr: Number(rr.toFixed(2)),
        riskDistance: Number(riskDistance.toFixed(2)),
        rewardDistance: Number(rewardDistance.toFixed(2)),
      },
      checks,
      execution: "SIMULATED",
      exchange: "Bitget",
    });
  } catch {
    return NextResponse.json(
      {
        approved: false,
        riskMessage: "Risk analysis failed safely.",
      },
      { status: 500 }
    );
  }
}