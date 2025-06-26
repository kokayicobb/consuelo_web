// app/api/kpi/route.ts
import { KPIService } from '@/components/Unified Commerce Dashboard/lib/service/service-layer';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'revenue';
    const period = searchParams.get('period') || 'monthly';
    const limit = parseInt(searchParams.get('limit') || '12');

    const result = await KPIService.getKPIData(type, period, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch KPI data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      summary: result.summary,
      type,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('KPI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, period = 'monthly', limit = 12 } = body;

    if (!type) {
      return NextResponse.json(
        { error: 'KPI type is required' },
        { status: 400 }
      );
    }

    const result = await KPIService.getKPIData(type, period, limit);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch KPI data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      summary: result.summary,
      type,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('KPI API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}