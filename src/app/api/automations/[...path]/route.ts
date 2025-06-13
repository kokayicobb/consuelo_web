// File: app/api/automations/[...path]/route.ts
// This is a catch-all route handler that will properly direct requests

import { NextRequest, NextResponse } from 'next/server';
import { activePieces } from '@/components/Unified Commerce Dashboard/lib/automations';

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(`✅ Catch-all route running: GET /api/automations/${path.join('/')}`);

  // Handle /api/automations/flows
  if (path.length === 1 && path[0] === 'flows') {
    console.log('📋 Handling flows listing');
    try {
      const result = await activePieces.listFlows();
      return NextResponse.json(result);
    } catch (error: any) {
      console.error('❌ Error listing flows:', error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to list flows' } },
        { status: 500 }
      );
    }
  }

  // Handle /api/automations/:flowId
  if (path.length === 1 && path[0] !== 'flows') {
    const flowId = path[0];
    console.log(`🔍 Handling get flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      const result = await activePieces.getFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error getting flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to get flow' } },
        { status: 500 }
      );
    }
  }

  // Handle /api/automations/:flowId/activate
  if (path.length === 2 && path[1] === 'activate') {
    const flowId = path[0];
    console.log(`🔍 Handling activate flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      // Assuming you have an activateFlow function
      const result = await activePieces.activateFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error activating flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to activate flow' } },
        { status: 500 }
      );
    }
  }
  
  // Handle /api/automations/:flowId/deactivate
  if (path.length === 2 && path[1] === 'deactivate') {
    const flowId = path[0];
    console.log(`🔍 Handling deactivate flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      // Assuming you have a deactivateFlow function
      const result = await activePieces.deactivateFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deactivating flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to deactivate flow' } },
        { status: 500 }
      );
    }
  }
  
  // If no route matches
  return NextResponse.json(
    { success: false, error: { message: `Route not found: /api/automations/${path.join('/')}` } },
    { status: 404 }
  );
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(`✅ Catch-all route running: POST /api/automations/${path.join('/')}`);

  // Handle /api/automations/flows (create flow)
	// Handle /api/automations/flows (create flow)
if (path.length === 1 && path[0] === 'flows') {
  console.log('📋 Handling flow creation');
  try {
    let body;
    try {
      body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid JSON in request body' } },
        { status: 400 }
      );
    }
    
    // Extract data from the request
    const createData = {
      displayName: body.displayName || 'Untitled Automation',
      // Store trigger type and description as metadata
      metadata: {
        description: body.description || '',
        triggerType: body.triggerType || null
      }
    };
    
    console.log('Creating flow with data:', createData);
    
    try {
      // Create the automation
      const result = await activePieces.createFlow(createData);
      
      if (!result.success) {
        console.error('❌ ActivePieces returned error:', result.error);
        return NextResponse.json(result, { status: result.error?.statusCode || 400 });
      }
      
      // If a trigger type was specified, update the flow with the appropriate trigger
      if (body.triggerType && result.data) {
        try {
          // For now, we'll just add the trigger type to the flow metadata
          // In a real implementation, you'd configure the actual trigger in n8n
          console.log(`🔄 Adding ${body.triggerType} trigger to flow ${result.data.id}`);
          
          // This is where you'd update the flow with the trigger configuration
          // For simplicity in this example, we'll just return the created flow
        } catch (triggerError: any) {
          console.warn(`⚠️ Failed to configure trigger, but flow was created:`, triggerError);
        }
      }
      
      console.log('✅ Flow created successfully:', result.data?.id);
      return NextResponse.json(result, { status: 201 });
    } catch (apiError: any) {
      console.error('❌ Unexpected error in activePieces.createFlow:', apiError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: apiError.message || 'Failed to create flow',
            error: 'API processing error' 
          } 
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('❌ Error creating flow:', error);
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to create flow' } },
      { status: 500 }
    );
  }
}

  // Handle /api/automations/:flowId (update flow)
  if (path.length === 1 && path[0] !== 'flows') {
    const flowId = path[0];
    console.log(`🔍 Handling update flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      let body;
      try {
        body = await request.json();
        console.log('Request body:', JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error('❌ Failed to parse request body:', parseError);
        return NextResponse.json(
          { success: false, error: { message: 'Invalid JSON in request body' } },
          { status: 400 }
        );
      }
      
      // Update flow with status change if provided
      let updateData: any = {
        displayName: body.displayName,
      };
      
      if (body.status === 'ENABLED' || body.status === 'DISABLED') {
        updateData.active = body.status === 'ENABLED';
      }
      
      const result = await activePieces.updateFlow(flowId, updateData);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error updating flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to update flow' } },
        { status: 500 }
      );
    }
  }
  
  // Handle /api/automations/:flowId/activate
  if (path.length === 2 && path[1] === 'activate') {
    const flowId = path[0];
    console.log(`🔍 Handling activate flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      const result = await activePieces.activateFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error activating flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to activate flow' } },
        { status: 500 }
      );
    }
  }
  
  // Handle /api/automations/:flowId/deactivate
  if (path.length === 2 && path[1] === 'deactivate') {
    const flowId = path[0];
    console.log(`🔍 Handling deactivate flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      const result = await activePieces.deactivateFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deactivating flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to deactivate flow' } },
        { status: 500 }
      );
    }
  }
  
  // If no route matches
  return NextResponse.json(
    { success: false, error: { message: `Route not found: /api/automations/${path.join('/')}` } },
    { status: 404 }
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(`✅ Catch-all route running: DELETE /api/automations/${path.join('/')}`);

  // Handle /api/automations/:flowId (delete flow)
  if (path.length === 1) {
    const flowId = path[0];
    console.log(`🔍 Handling delete flow: ${flowId}`);
    
    if (!flowId || flowId === 'undefined') {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: 'Invalid or missing flow ID' } },
        { status: 400 }
      );
    }
    
    try {
      const result = await activePieces.deleteFlow(flowId);
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deleting flow ${flowId}:`, error);
      return NextResponse.json(
        { success: false, error: { message: error.message || 'Failed to delete flow' } },
        { status: 500 }
      );
    }
  }
  
  // If no route matches
  return NextResponse.json(
    { success: false, error: { message: `Route not found: /api/automations/${path.join('/')}` } },
    { status: 404 }
  );
}