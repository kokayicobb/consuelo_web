# Prompt 1: Refactor API Calls to Use Next.js Routes Directly

## Problem
The roleplay components are using a centralized API file (`src/components/roleplay/api.ts`) instead of calling the Next.js API routes directly. This creates unnecessary abstraction and potential bugs.

## Task
Remove the catch-all API file and update all components to call Next.js API routes directly.

## Specific Actions Needed

1. **Delete or rename** `src/components/roleplay/api.ts` to avoid import conflicts

2. **Update RoleplayCommandPalette** (`src/components/roleplay/roleplay-command-palette.tsx`):
   - Replace imports from `./api` with direct fetch calls
   - Update `loadSessionHistory()` to call `/api/roleplay/sessions?user_id=${currentUser}` directly
   - Update `loadAnalytics()` to call `/api/roleplay/analytics/summary?user_id=${currentUser}` directly

3. **Update the main roleplay page** (`src/app/(site)/roleplay/page.tsx`):
   - Remove `import { createSession, updateSession } from "@/components/roleplay/api"`
   - Replace `createSession()` call with direct fetch to `/api/roleplay/sessions` (POST)
   - Replace `updateSession()` call with direct fetch to `/api/roleplay/sessions/[id]` (PATCH)

4. **All fetch calls should**:
   - Use proper error handling with try/catch
   - Include proper headers (`Content-Type: application/json`)
   - Handle response.ok checks
   - Return appropriate data structures

## Expected Result
Components will call Next.js API routes directly, eliminating the middleware layer and ensuring proper data flow to MongoDB.