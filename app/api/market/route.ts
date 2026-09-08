import { NextResponse } from "next/server";

const BINANCE_URLS = [
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  "https://api1.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  "https://api2.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
];

export async function GET() {
  for (const url of BINANCE_URLS) {
    try {
      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) continue;

      const data = await response.json();
      const price = Number(data.price);

      if (data.symbol === "BTCUSDT" && Number.isFinite(price) && price > 0) {
        return NextResponse.json({
          symbol: "BTCUSDT",
          price,
        });
      }
    } catch {
      continue;
    }
  }

  return NextResponse.json(
    { error: "Unable to retrieve BTCUSDT market data." },
    { status: 502 }
  );
}
