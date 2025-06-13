// File: app/api/automations/[flowId]/route.ts

import { activePieces } from '@/components/Unified Commerce Dashboard/lib/automations';
import { NextRequest, NextResponse } from 'next/server';


interface RouteParams {
  params: {
    flowId: string;
  };
}

// This handler is for GET /api/automations/SOME_ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { flowId } = params;
  console.log(`✅ Correct file is running: GET /api/automations/${flowId}`);
  console.log(`🔍 Debug - flowId value: "${flowId}"`);

  // Return 400 if flowId is undefined or "undefined"
  if (!flowId || flowId === "undefined") {
    console.error(`❌ Invalid flowId: "${flowId}"`);
    return NextResponse.json(
      { success: false, error: { message: 'Invalid or missing flow ID' } },
      { status: 400 }
    );
  }

  try {
    console.log(`🔄 Attempting to get flow with ID: ${flowId}`);
    const result = await activePieces.getFlow(flowId);
    console.log(`📊 API Response:`, JSON.stringify(result, null, 2));
    
    if (!result.success) {
      const status = result.error?.statusCode === 404 ? 404 : 400;
      console.error(`❌ Error from activePieces.getFlow:`, JSON.stringify(result.error, null, 2));
      return NextResponse.json(result, { status });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`🚨 Critical error in GET /api/automations/${flowId}:`, error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to get automation', details: error.message } },
      { status: 500 }
    );
  }
}

// This handler is for POST /api/automations/SOME_ID
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { flowId } = params;
  console.log(`✅ Correct file is running: POST /api/automations/${flowId}`);
  console.log(`🔍 Debug - flowId value: "${flowId}"`);

  // Return 400 if flowId is undefined or "undefined"
  if (!flowId || flowId === "undefined") {
    console.error(`❌ Invalid flowId: "${flowId}"`);
    return NextResponse.json(
      { success: false, error: { message: 'Invalid or missing flow ID' } },
      { status: 400 }
    );
  }

  try {
    console.log(`📥 Attempting to parse request body`);
    let body;
    try {
      body = await request.json();
      console.log(`📦 Request body:`, JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error(`❌ Failed to parse request body:`, parseError);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }

    console.log(`🔄 Attempting to update flow with ID: ${flowId}`);
    const result = await activePieces.updateFlow(flowId, body);
    console.log(`📊 API Response:`, JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error(`❌ Error from activePieces.updateFlow:`, JSON.stringify(result.error, null, 2));
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`🚨 Critical error in POST /api/automations/${flowId}:`, error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update automation', details: error.message } },
      { status: 500 }
    );
  }
}

// This handler is for DELETE /api/automations/SOME_ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { flowId } = params;
  console.log(`✅ Correct file is running: DELETE /api/automations/${flowId}`);
  console.log(`🔍 Debug - flowId value: "${flowId}"`);

  // Return 400 if flowId is undefined or "undefined"
  if (!flowId || flowId === "undefined") {
    console.error(`❌ Invalid flowId: "${flowId}"`);
    return NextResponse.json(
      { success: false, error: { message: 'Invalid or missing flow ID' } },
      { status: 400 }
    );
  }

  try {
    console.log(`🔄 Attempting to delete flow with ID: ${flowId}`);
    const result = await activePieces.deleteFlow(flowId);
    console.log(`📊 API Response:`, JSON.stringify(result, null, 2));
    
    if (!result.success) {
      console.error(`❌ Error from activePieces.deleteFlow:`, JSON.stringify(result.error, null, 2));
      return NextResponse.json(result, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error(`🚨 Critical error in DELETE /api/automations/${flowId}:`, error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete automation', details: error.message } },
      { status: 500 }
    );
  }
}