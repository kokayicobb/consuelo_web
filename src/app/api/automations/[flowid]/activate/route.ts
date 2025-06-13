// app/api/automations/flows/[flowId]/activate/route.ts

import { NextRequest, NextResponse } from "next/server";
import { activePieces } from "@/components/Unified Commerce Dashboard/lib/automations";

interface RouteParams {
  params: {
    flowId: string;
  };
}

/**
 * POST /api/automations/flows/[flowId]/activate
 * Activate a flow
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const result = await activePieces.activateFlow(params.flowId);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error activating flow:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          error: "Internal server error",
          message: "Failed to activate automation",
        },
      },
      { status: 500 },
    );
  }
}
