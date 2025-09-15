# Prompt 3: Debug MongoDB Session Storage

## Problem
Need to verify that roleplay sessions are actually being written to and read from MongoDB correctly.

## Task
Add comprehensive logging and error handling to track the full session lifecycle.

## Specific Actions Needed

1. **Add logging to the session creation API** (`src/app/api/roleplay/sessions/route.ts`):
   ```typescript
   export async function POST(request: NextRequest) {
     try {
       console.log("🔄 Creating new roleplay session...");
       await connectDB();
       
       const body = await request.json();
       console.log("📝 Session creation request body:", body);
       
       // ... existing validation code ...
       
       const session = new RoleplaySession({
         session_id: uuidv4(),
         scenario_id,
         character_id: character_id || null,
         user_id,
         status: 'active',
         conversation: [],
         start_time: new Date()
       });
       
       await session.save();
       console.log("✅ Session saved to MongoDB:", session._id);
       
       return NextResponse.json({
         success: true,
         session
       }, { status: 201 });
     } catch (error) {
       console.error("❌ Error creating session:", error);
       // ... existing error handling ...
     }
   }
   ```

2. **Add logging to session retrieval** (`src/app/api/roleplay/sessions/route.ts`):
   ```typescript
   export async function GET(request: NextRequest) {
     try {
       console.log("🔍 Fetching sessions...");
       const { searchParams } = new URL(request.url);
       const user_id = searchParams.get('user_id');
       console.log("👤 User ID:", user_id);
       
       // ... existing code ...
       
       console.log("📊 Found sessions:", sessions.length);
       console.log("💾 Session data:", sessions);
       
       return NextResponse.json({
         success: true,
         sessions,
         pagination: {
           total,
           page: pageNum,
           limit: limitNum,
           totalPages
         }
       });
     } catch (error) {
       console.error("❌ Error fetching sessions:", error);
       // ... existing error handling ...
     }
   }
   ```

3. **Test and verify**:
   - Check browser console for session creation logs
   - Check terminal/server logs for MongoDB operations
   - Verify data appears in MongoDB Compass or CLI
   - Confirm session history API returns the created sessions

## Expected Result
Clear visibility into whether sessions are being created, stored, and retrieved from MongoDB correctly.