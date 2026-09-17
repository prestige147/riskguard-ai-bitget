import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.bitget.com/api/v3/market/tickers?category=SPOT&symbol=BTCUSDT",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`Bitget returned ${response.status}`);
    }

    const json = await response.json();
    const ticker = json?.data?.[0];

    if (!ticker?.lastPrice) {
      throw new Error("No BTCUSDT price returned by Bitget");
    }

    return NextResponse.json({
      symbol: "BTCUSDT",
      price: Number(ticker.lastPrice),
      change24h: Number(ticker.price24hPcnt ?? 0) * 100,
      source: "Bitget",
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Bitget market error:", error);

    return NextResponse.json({
      symbol: "BTCUSDT",
      price: 0,
      change24h: 0,
      source: "Bitget",
      error: "Live market data unavailable",
      timestamp: Date.now(),
    });
  }
}
