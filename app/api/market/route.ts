import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.bitget.com/api/v2/spot/market/tickers?symbol=BTCUSDT',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Bitget API returned ' + response.status);
    }

    const json = await response.json();
    const ticker = json?.data?.[0];

    if (!ticker) {
      throw new Error('No ticker data from Bitget');
    }

    const price = parseFloat(ticker.lastPr);
    const change24h = parseFloat(ticker.change24h) * 100;

    return NextResponse.json({
      price: price,
      change24h: change24h,
      symbol: 'BTCUSDT',
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Market fetch failed' },
      { status: 500 }
    );
  }
}