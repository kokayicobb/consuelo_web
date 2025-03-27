// app/api/klaviyo/track/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const payload = await req.json();

  try {
    const response = await fetch("https://a.klaviyo.com/api/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Klaviyo API error: ${response.statusText}`);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Klaviyo tracking error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
