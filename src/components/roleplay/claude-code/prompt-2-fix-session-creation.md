# Prompt 2: Fix Session Creation Flow

## Problem
Roleplay sessions are not being created in MongoDB when calls start, and session history is empty.

## Task
Ensure that when a user starts a roleplay call, a proper session is created in MongoDB and can be retrieved in session history.

## Specific Actions Needed

1. **Fix the startCall function** in `src/app/(site)/roleplay/page.tsx`:
   ```typescript
   // After usage session is created, add this:
   const sessionResponse = await fetch('/api/roleplay/sessions', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       scenario_id: "68c23a20303cd41e97d36baf", // Use actual scenario ID
       character_id: null,
       user_id: user?.id
     })
   });
   
   if (sessionResponse.ok) {
     const { session } = await sessionResponse.json();
     setCurrentRoleplaySessionId(session._id); // Use MongoDB _id
   }
   ```

2. **Fix the endCall function** in `src/app/(site)/roleplay/page.tsx`:
   ```typescript
   // Add this after usage session cleanup:
   if (currentRoleplaySessionId) {
     await fetch(`/api/roleplay/sessions/${currentRoleplaySessionId}`, {
       method: 'PATCH',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         status: 'completed',
         conversation_history: messages.map(msg => ({
           role: msg.role,
           text: msg.text,
           timestamp: new Date().toISOString()
         })),
         end_time: new Date().toISOString()
       })
     });
   }
   ```

3. **Test the flow**:
   - Start a call → Check if session appears in MongoDB
   - End the call → Check if session is updated with conversation
   - Open session history → Verify sessions appear

## Expected Result
Sessions will be properly created, updated, and visible in session history.