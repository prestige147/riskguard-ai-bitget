import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const price = body.price;
    const change24h = body.change24h;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: "You are a crypto analyst. Reply only with valid JSON, no markdown."
        },
        {
          role: "user",
          content: "BTC is at " + price + " with 24h change of " + change24h + "%. Return a JSON object with keys: sentiment (bullish, bearish, or neutral), summary (a short string), and confidence (a number from 0 to 100)."
        }
      ]
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new Error("No response from model");
    }

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}