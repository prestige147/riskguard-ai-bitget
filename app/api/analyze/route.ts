import { NextResponse } from "next/server";

type TradeSetup = {
  direction: "LONG";
  entry: number;
  stopLoss: number;
  takeProfit: number;
};

function isTradeSetup(value: unknown): value is TradeSetup {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const trade = value as Record<string, unknown>;
  return (
    trade.direction === "LONG" &&
    typeof trade.entry === "number" &&
    typeof trade.stopLoss === "number" &&
    typeof trade.takeProfit === "number" &&
    [trade.entry, trade.stopLoss, trade.takeProfit].every(Number.isFinite)
  );
}

function evaluateTrade(
  setup: TradeSetup,
  settings: {
    accountBalance: number;
    riskPercent: number;
    minimumRiskReward: number;
    maximumDailyLoss: number;
  },
  dailyLoss: number
) {
  const riskAmount =
    settings.accountBalance * (settings.riskPercent / 100);

  const priceRisk =
    setup.direction === "LONG"
      ? setup.entry - setup.stopLoss
      : setup.stopLoss - setup.entry;

  const reward =
    setup.direction === "LONG"
      ? setup.takeProfit - setup.entry
      : setup.entry - setup.takeProfit;

  if (priceRisk <= 0) {
    return {
      approved: false,
      reason: "Invalid stop-loss configuration.",
    };
  }

  if (reward <= 0) {
    return {
      approved: false,
      reason: "Invalid take-profit configuration.",
    };
  }

  const riskReward = reward / priceRisk;

  if (riskReward < settings.minimumRiskReward) {
    return {
      approved: false,
      riskReward,
      reason: `Risk/reward ${riskReward.toFixed(
        2
      )} is below minimum ${settings.minimumRiskReward}.`,
    };
  }

  if (dailyLoss >= settings.maximumDailyLoss) {
    return {
      approved: false,
      riskReward,
      reason: "Maximum daily loss has been reached.",
    };
  }

  return {
    approved: true,
    riskAmount,
    riskReward,
    reason: "Trade passed all RiskGuard checks.",
  };
}

export async function POST(request: Request) {
  const body = await request.json();
  const trade = body?.trade as unknown;

  if (!isTradeSetup(trade)) {
    return NextResponse.json(
      { error: "A valid LONG trade setup is required." },
      { status: 400 }
    );
  }

  const settings = {
    accountBalance: 10000,
    riskPercent: 1,
    minimumRiskReward: 2,
    maximumDailyLoss: 500,
  };

  const result = evaluateTrade(trade, settings, 120);

  return NextResponse.json({
    trade,
    riskGuard: result,
  });
}