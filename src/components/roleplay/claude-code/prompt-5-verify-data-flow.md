# Prompt 5: Verify Complete Data Flow and Performance

## Problem
Need to ensure the entire roleplay session lifecycle works correctly and efficiently without the catch-all API layer.

## Task
Test and verify the complete flow from session creation to history display, with proper error handling and performance optimization.

## Specific Actions Needed

1. **Create a test flow script** to verify:
   ```typescript
   // Add this as a temporary test function in the roleplay page
   const testSessionFlow = async () => {
     console.log("🧪 Testing session flow...");
     
     // Test 1: Create session
     const createResponse = await fetch('/api/roleplay/sessions', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         scenario_id: "68c23a20303cd41e97d36baf",
         user_id: user?.id
       })
     });
     console.log("✅ Create session response:", await createResponse.json());
     
     // Test 2: Fetch sessions
     const fetchResponse = await fetch(`/api/roleplay/sessions?user_id=${user?.id}`);
     console.log("✅ Fetch sessions response:", await fetchResponse.json());
     
     // Test 3: Update session
     // ... add update test if needed
   };
   ```

2. **Add error boundaries and fallbacks**:
   - Wrap session history loading in try/catch with user-friendly messages
   - Add loading states and empty states for session history
   - Ensure the app doesn't break if session creation fails

3. **Optimize API calls**:
   - Add request debouncing if needed
   - Cache session data appropriately
   - Minimize unnecessary re-fetches

4. **Cleanup and verify**:
   - Remove or comment out the old `src/components/roleplay/api.ts` file
   - Ensure no components are importing from the old API file
   - Test that all roleplay functionality works end-to-end

5. **Final testing checklist**:
   - [ ] Can start a roleplay call
   - [ ] Session is created in MongoDB
   - [ ] Can end a call and conversation is saved
   - [ ] Session appears in command palette history
   - [ ] Can resume or view session details
   - [ ] No console errors or broken imports

## Expected Result
A fully functional roleplay system that directly uses Next.js API routes, properly stores data in MongoDB, and displays session history correctly.