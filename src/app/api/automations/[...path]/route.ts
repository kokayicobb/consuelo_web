// File: app/api/automations/[...path]/route.ts
// Fixed version that properly passes trigger data to the service layer

import { NextRequest, NextResponse } from "next/server";
import { activePieces } from "@/components/Unified Commerce Dashboard/lib/automations";

interface RouteParams {
  params: {
    path: string[];
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(
    `✅ Catch-all route running: GET /api/automations/${path.join("/")}`,
  );

  // Handle /api/automations/flows
  if (path.length === 1 && path[0] === "flows") {
    console.log("📋 Handling flows listing");
    try {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get("limit") || "100");
      const cursor = searchParams.get("cursor") || undefined;
      const active = searchParams.get("active") === "true" ? true : undefined;

      const result = await activePieces.listFlows({
        limit,
        cursor,
        active,
      });
      return NextResponse.json(result);
    } catch (error: any) {
      console.error("❌ Error listing flows:", error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to list flows" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId
  if (path.length === 2 && path[0] === "flows") {
    const flowId = path[1];
    console.log(`🔍 Handling get flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.getFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 404 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error getting flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to get flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/activate
  if (path.length === 3 && path[0] === "flows" && path[2] === "activate") {
    const flowId = path[1];
    console.log(`🚀 Handling activate flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.activateFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error activating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to activate flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/deactivate
  if (path.length === 3 && path[0] === "flows" && path[2] === "deactivate") {
    const flowId = path[1];
    console.log(`🛑 Handling deactivate flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.deactivateFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deactivating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to deactivate flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/runs
  if (path.length === 3 && path[0] === "flows" && path[2] === "runs") {
    const flowId = path[1];
    console.log(`📊 Handling get flow runs: ${flowId}`);

    try {
      const searchParams = request.nextUrl.searchParams;
      const limit = parseInt(searchParams.get("limit") || "100");
      const cursor = searchParams.get("cursor") || undefined;
      const status = searchParams.get("status") || undefined;

      const result = await activePieces.listFlowRuns({
        workflowId: flowId,
        limit,
        cursor,
        status,
      });
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error getting flow runs for ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to get flow runs" },
        },
        { status: 500 },
      );
    }
  }

  // If no route matches
  return NextResponse.json(
    {
      success: false,
      error: { message: `Route not found: /api/automations/${path.join("/")}` },
    },
    { status: 404 },
  );
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(
    `✅ Catch-all route running: POST /api/automations/${path.join("/")}`,
  );

  // Handle /api/automations/flows (create flow)
  if (path.length === 1 && path[0] === "flows") {
    console.log("📋 Handling flow creation");
    try {
      let body;
      try {
        body = await request.json();
        console.log("Request body:", JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error("❌ Failed to parse request body:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: { message: "Invalid JSON in request body" },
          },
          { status: 400 },
        );
      }

      // Create flow data with trigger
      const createData = {
        displayName: body.displayName || "Untitled Automation",
        metadata: body.metadata || {},
        trigger: body.trigger, // Pass the trigger directly!
      };

      console.log(
        "Creating flow with data:",
        JSON.stringify(createData, null, 2),
      );

      const result = await activePieces.createFlow(createData);

      if (!result.success) {
        console.error("❌ ActivePieces returned error:", result.error);
        return NextResponse.json(result, {
          status: result.error?.statusCode || 400,
        });
      }

      console.log("✅ Flow created successfully:", result.data?.id);
      return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
      console.error("❌ Error creating flow:", error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to create flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId (update flow)
  if (path.length === 2 && path[0] === "flows") {
    const flowId = path[1];
    console.log(`🔄 Handling update flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      let body;
      try {
        body = await request.json();
        console.log("Update request body:", JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error("❌ Failed to parse request body:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: { message: "Invalid JSON in request body" },
          },
          { status: 400 },
        );
      }

      // Pass all update data including trigger
      const updateData = {
        displayName: body.displayName,
        active: body.active,
        trigger: body.trigger,
        nodes: body.nodes,
        connections: body.connections,
        settings: body.settings,
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log(
        "Updating flow with data:",
        JSON.stringify(updateData, null, 2),
      );
      const result = await activePieces.updateFlow(flowId, updateData);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error updating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to update flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/activate
  if (path.length === 3 && path[0] === "flows" && path[2] === "activate") {
    const flowId = path[1];
    console.log(`🚀 Handling activate flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.activateFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error activating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to activate flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/deactivate
  if (path.length === 3 && path[0] === "flows" && path[2] === "deactivate") {
    const flowId = path[1];
    console.log(`🛑 Handling deactivate flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.deactivateFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deactivating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to deactivate flow" },
        },
        { status: 500 },
      );
    }
  }

  // Handle /api/automations/flows/:flowId/test
  if (path.length === 3 && path[0] === "flows" && path[2] === "test") {
    const flowId = path[1];
    console.log(`🧪 Handling test flow: ${flowId}`);

    try {
      const body = await request.json();
      const result = await activePieces.testWebhookTrigger(
        flowId,
        body.data || {},
      );
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error testing flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to test flow" },
        },
        { status: 500 },
      );
    }
  }

  // If no route matches
  return NextResponse.json(
    {
      success: false,
      error: { message: `Route not found: /api/automations/${path.join("/")}` },
    },
    { status: 404 },
  );
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(
    `✅ Catch-all route running: PUT /api/automations/${path.join("/")}`,
  );

  // Handle /api/automations/flows/:flowId
  if (path.length === 2 && path[0] === "flows") {
    const flowId = path[1];
    console.log(`🔄 Handling update flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      let body;
      try {
        body = await request.json();
        console.log("Update request body:", JSON.stringify(body, null, 2));
      } catch (parseError) {
        console.error("❌ Failed to parse request body:", parseError);
        return NextResponse.json(
          {
            success: false,
            error: { message: "Invalid JSON in request body" },
          },
          { status: 400 },
        );
      }

      const updateData = {
        displayName: body.displayName,
        active: body.active,
        trigger: body.trigger,
        nodes: body.nodes,
        connections: body.connections,
        settings: body.settings,
      };

      // Remove undefined values
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const result = await activePieces.updateFlow(flowId, updateData);

      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error updating flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to update flow" },
        },
        { status: 500 },
      );
    }
  }

  // If no route matches
  return NextResponse.json(
    {
      success: false,
      error: { message: `Route not found: /api/automations/${path.join("/")}` },
    },
    { status: 404 },
  );
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { path } = params;
  console.log(
    `✅ Catch-all route running: DELETE /api/automations/${path.join("/")}`,
  );

  // Handle /api/automations/flows/:flowId
  if (path.length === 2 && path[0] === "flows") {
    const flowId = path[1];
    console.log(`🗑️ Handling delete flow: ${flowId}`);

    if (!flowId || flowId === "undefined") {
      console.error(`❌ Invalid flowId: "${flowId}"`);
      return NextResponse.json(
        { success: false, error: { message: "Invalid or missing flow ID" } },
        { status: 400 },
      );
    }

    try {
      const result = await activePieces.deleteFlow(flowId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }
      return NextResponse.json(result);
    } catch (error: any) {
      console.error(`❌ Error deleting flow ${flowId}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: { message: error.message || "Failed to delete flow" },
        },
        { status: 500 },
      );
    }
  }

  // If no route matches
  return NextResponse.json(
    {
      success: false,
      error: { message: `Route not found: /api/automations/${path.join("/")}` },
    },
    { status: 404 },
  );
}
