// src/app/api/reddit/save-workflow/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize the Supabase client. Use environment variables.
// The SERVICE_ROLE_KEY is required for performing actions that bypass RLS,
// which is what you typically want on the server-side.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Named export for the POST method
export async function POST(req: Request) {
  try {
    // Get the request body
    const body = await req.json();
    const {
      workflow_name,
      subreddits,
      keywords,
      sort_type,
      time_filter,
      is_active
    } = body;

    // Basic validation
    if (!workflow_name || !keywords || keywords.length === 0) {
      return NextResponse.json(
        { error: 'Workflow name and at least one keyword are required.' },
        { status: 400 }
      );
    }

    // Insert data into the 'reddit_workflows' table
    const { data, error } = await supabase
      .from('reddit_workflows')
      .insert([
        {
          workflow_name,
          subreddits,
          keywords,
          sort_type,
          time_filter,
          is_active
        }
      ])
      .select() // Use .select() to get the inserted data back
      .single(); // Use .single() if you expect only one row back

    if (error) {
      console.error("Supabase insert error:", error);
      // Don't expose detailed database errors to the client
      throw new Error("Could not save workflow to the database.");
    }

    // Return a success response
    return NextResponse.json({ success: true, data }, { status: 201 }); // 201 Created is more appropriate

  } catch (error: any) {
    console.error("[SAVE WORKFLOW API ERROR]", error);
    return NextResponse.json(
      { error: error.message || 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}