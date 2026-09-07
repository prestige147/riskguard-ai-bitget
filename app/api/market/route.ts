import { NextResponse } from "next/server";

const BINANCE_TICKER_URL =
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";

type BinanceTicker = {
  symbol?: unknown;
  price?: unknown;
};

export async function GET() {
  const response = await fetch(BINANCE_TICKER_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Unable to retrieve BTCUSDT market data." },
      { status: 502 }
    );
  }

  const ticker = (await response.json()) as BinanceTicker;
  const price = typeof ticker.price === "string" ? Number(ticker.price) : NaN;

  if (ticker.symbol !== "BTCUSDT" || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "Binance returned an invalid BTCUSDT price." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    symbol: ticker.symbol,
    price,
  });
}
