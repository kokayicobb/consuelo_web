// supabase/functions/threads-agent/tests/helpers/test-setup.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Test environment configuration
export interface TestConfig {
  supabaseUrl: string;
  supabaseServiceKey: string;
  threadsAccessToken: string;
  threadsUserId: string;
  groqApiKey: string;
}

// Get test configuration from environment
export function getTestConfig(): TestConfig {
  const config = {
    supabaseUrl: Deno.env.get('SUPABASE_URL') || 'http://localhost:54321',
    supabaseServiceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'test-key',
    threadsAccessToken: Deno.env.get('THREADS_ACCESS_TOKEN') || 'test-token',
    threadsUserId: Deno.env.get('THREADS_USER_ID') || 'test-user-id',
    groqApiKey: Deno.env.get('GROQ_API_KEY') || 'test-groq-key'
  };

  return config;
}

// Create test Supabase client
export function createTestSupabaseClient() {
  const config = getTestConfig();
  return createClient(config.supabaseUrl, config.supabaseServiceKey);
}

// Test assertion helpers
export function assertEquals(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

export function assertExists(value: any, message?: string) {
  if (value == null) {
    throw new Error(message || 'Expected value to exist');
  }
}

export async function assertThrowsAsync(fn: () => Promise<void>, message?: string): Promise<void> {
  let didThrow = false;
  try {
    await fn();
  } catch {
    didThrow = true;
  }

  if (!didThrow) {
    throw new Error(message || 'Expected async function to throw');
  }
}

// Performance testing helpers
export function createPerformanceTimer() {
  const start = performance.now();

  return {
    elapsed: () => performance.now() - start,
    assert: (maxMs: number, operation: string) => {
      const elapsed = performance.now() - start;
      if (elapsed > maxMs) {
        throw new Error(`${operation} took ${elapsed}ms, expected < ${maxMs}ms`);
      }
    }
  };
}

// Test data generators
export function generateTestMentionId(): string {
  return `test-mention-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTestThreadId(): string {
  return `test-thread-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateTestUsername(): string {
  return `test-user-${Math.random().toString(36).substr(2, 9)}`;
}