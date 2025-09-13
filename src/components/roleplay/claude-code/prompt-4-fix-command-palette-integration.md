# Prompt 4: Fix Command Palette Session History Integration

## Problem
The RoleplayCommandPalette is not properly displaying session history because it's not correctly calling the Next.js API routes.

## Task
Update the command palette to directly call Next.js API routes and properly display session history.

## Specific Actions Needed

1. **Update RoleplayCommandPalette** (`src/components/roleplay/roleplay-command-palette.tsx`):

   Replace the `loadSessionHistory` function:
   ```typescript
   const loadSessionHistory = async () => {
     try {
       setLoading(true);
       console.log("🔍 Loading session history for user:", currentUser);
       
       const response = await fetch(`/api/roleplay/sessions?user_id=${currentUser}`);
       
       if (!response.ok) {
         throw new Error(`Session history API error: ${response.status}`);
       }
       
       const data = await response.json();
       console.log("📊 Session history response:", data);
       
       setSessions(data.sessions || []);
       setCurrentView('sessions');
     } catch (error) {
       console.error('Failed to load session history:', error);
       setSessions([]);
       setCurrentView('sessions');
     } finally {
       setLoading(false);
     }
   };
   ```

2. **Update scenarios and characters loading**:
   ```typescript
   const loadScenarios = async () => {
     try {
       setLoading(true);
       const response = await fetch('/api/roleplay/scenarios');
       
       if (!response.ok) {
         console.warn('Scenarios API not available, using mock data');
         setScenarios(mockScenarios);
         setCurrentView('scenarios');
         return;
       }
       
       const data = await response.json();
       setScenarios(data.scenarios || []);
       setCurrentView('scenarios');
     } catch (error) {
       console.warn('Error fetching scenarios:', error);
       setScenarios(mockScenarios);
       setCurrentView('scenarios');
     } finally {
       setLoading(false);
     }
   };
   ```

3. **Remove any imports** from `./api` in the command palette file

4. **Test the integration**:
   - Open command palette (press `/`)
   - Click "Session History"
   - Verify it calls the correct API endpoint
   - Verify sessions appear in the UI

## Expected Result
Command palette will properly load and display session history from the Next.js API routes.