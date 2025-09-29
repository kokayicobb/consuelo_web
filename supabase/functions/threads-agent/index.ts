// supabase/functions/threads-agent/index.ts
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.220.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Health check endpoint
function handleHealthCheck(): Response {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'threads-agent',
    version: '1.0.0'
  };

  return new Response(JSON.stringify(healthStatus), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    status: 200
  });
}

// Main Deno.serve handler
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
      }
    });
  }

  // Handle health check
  if (req.method === "GET") {
    return handleHealthCheck();
  }

  try {
    console.log('\n🚀 THREADS AGENT STARTED');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log(`Method: ${req.method}`);
    console.log(`URL: ${req.url}`);

    // Parse request body
    const body = req.method === "POST" ? await req.json() : {};
    const triggeredBy = body.triggered_by || "system";

    console.log(`Triggered by: ${triggeredBy}`);

    // Return response
    return new Response(JSON.stringify({
      success: true,
      message: "Threads Agent is running",
      triggered_by: triggeredBy,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 200
    });

  } catch (error: any) {
    console.error('💥 CRITICAL ERROR:', error);

    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      status: 500
    });
  }
});
