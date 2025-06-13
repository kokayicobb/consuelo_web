// File: app/api/automations/flows/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { activePieces } from '@/components/Unified Commerce Dashboard/lib/automations';

// This handler is for GET /api/automations/flows
export async function GET(request: NextRequest) {
  console.log('✅ Correct file is running: GET /api/automations/flows');
  
  try {
    console.log('🔄 Attempting to list flows');
    const result = await activePieces.listFlows();
    console.log(`📊 API Response Status: ${result.success ? 'Success' : 'Failed'}`);
    
    if (!result.success) {
      console.error('❌ Error from activePieces.listFlows:', JSON.stringify(result.error, null, 2));
      return NextResponse.json(result, { status: 500 });
    }
    
    console.log(`📊 Successfully retrieved ${result.data || 0} flows`);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('🚨 Critical Error in GET /api/automations/flows:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to list automations' } },
      { status: 500 }
    );
  }
}

// This handler is for POST /api/automations/flows
export async function POST(request: NextRequest) {
  console.log('✅ Correct file is running: POST /api/automations/flows');
  
  try {
    console.log('📥 Attempting to parse request body');
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }
    
    console.log('🔄 Attempting to create flow with name:', body.displayName || 'Untitled Automation');
    const result = await activePieces.createFlow({
      displayName: body.displayName || 'Untitled Automation',
      // Add any other required properties from body
    });
    
    console.log(`📊 API Response Status: ${result.success ? 'Success' : 'Failed'}`);
    
    if (!result.success) {
      console.error('❌ Error from activePieces.createFlow:', JSON.stringify(result.error, null, 2));
      return NextResponse.json(result, { status: 400 });
    }
    
    console.log('✨ Successfully created new flow');
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('🚨 Critical Error in POST /api/automations/flows:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to create automation' } },
      { status: 500 }
    );
  }
}