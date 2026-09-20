import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const trade = await request.json();

    const rawDirection = String(trade.direction || "")
      .trim()
      .toUpperCase();

    const entryPrice = Number(trade.entry);
    const stopPrice = Number(trade.stopLoss);
    const targetPrice = Number(trade.takeProfit);
    const riskPct = Number(trade.riskPercent);
    const accountBalance = Number(trade.balance);
    const currentDailyLoss = Number(trade.dailyLoss);

    // Accept normal directions and common AI labels
    let direction: "LONG" | "SHORT" | null = null;

    if (
      rawDirection === "LONG" ||
      rawDirection === "BULLISH"
    ) {
      direction = "LONG";
    }

    if (
      rawDirection === "SHORT" ||
      rawDirection === "BEARISH"
    ) {
      direction = "SHORT";
    }

    // If the AI direction is missing, infer it from the trade levels.
    // Stop below entry + target above entry = LONG.
    // Stop above entry + target below entry = SHORT.
    if (!direction) {
      if (stopPrice < entryPrice && targetPrice > entryPrice) {
        direction = "LONG";
      } else if (stopPrice > entryPrice && targetPrice < entryPrice) {
        direction = "SHORT";
      }
    }

    if (
      !direction ||
      !Number.isFinite(entryPrice) ||
      !Number.isFinite(stopPrice) ||
      !Number.isFinite(targetPrice) ||
      !Number.isFinite(riskPct) ||
      !Number.isFinite(accountBalance) ||
      !Number.isFinite(currentDailyLoss)
    ) {
      return NextResponse.json(
        {
          approved: false,
          riskMessage: "Invalid trade data received.",
        },
        { status: 400 }
      );
    }

    const riskAmount = accountBalance * (riskPct / 100);

    const riskDistance =
      direction === "LONG"
        ? entryPrice - stopPrice
        : stopPrice - entryPrice;

    const rewardDistance =
      direction === "LONG"
        ? targetPrice - entryPrice
        : entryPrice - targetPrice;

    const rr =
      riskDistance > 0
        ? rewardDistance / riskDistance
        : 0;

    const positionSize =
      riskDistance > 0
        ? riskAmount / riskDistance
        : 0;

    const checks = {
      risk: riskPct > 0 && riskPct <= 1,
      rr: rr >= 2.99,
      stopLoss: riskDistance > 0,
      dailyLoss: currentDailyLoss <= accountBalance * 0.05,
      positionSize: positionSize > 0,
    };

    const approved = Object.values(checks).every(Boolean);

    return NextResponse.json({
      approved,

      riskMessage: approved
        ? "Trade passed all RiskGuard safety checks."
        : "Trade blocked by RiskGuard safety rules.",

      direction,

      metrics: {
        riskAmount: Number(riskAmount.toFixed(2)),
        rr: Number(rr.toFixed(2)),
        riskDistance: Number(riskDistance.toFixed(2)),
        rewardDistance: Number(rewardDistance.toFixed(2)),
        positionSize: Number(positionSize.toFixed(6)),
      },

      checks,

      execution: "SIMULATED",
      exchange: "Bitget",
    });
  } catch (error) {
    console.error("RiskGuard error:", error);

    return NextResponse.json(
      {
        approved: false,
        riskMessage: "Risk analysis failed safely.",
      },
      { status: 500 }
    );
  }
}