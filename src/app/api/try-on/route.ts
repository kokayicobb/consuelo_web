// src/app/api/try-on/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initiateTryOn } from '../tryOn';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await initiateTryOn(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status || 500 }
    );
  }
}

// OPTIONS handler is now handled by middleware
export const dynamic = 'force-dynamic'; // Required for Shopify app bridges