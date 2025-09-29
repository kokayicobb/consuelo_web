// supabase/functions/threads-agent/tests/unit/basic.test.ts
import { assertEquals, assertExists } from "../helpers/test-setup.ts";

// Basic test to verify testing infrastructure works
Deno.test("Basic test - should pass", () => {
  assertEquals(1 + 1, 2);
  assertExists("hello");
});

// Test environment setup
Deno.test("Environment - should have test config", () => {
  const config = {
    supabaseUrl: Deno.env.get('SUPABASE_URL') || 'http://localhost:54321',
    environment: 'test'
  };

  assertExists(config.supabaseUrl);
  assertEquals(typeof config.supabaseUrl, "string");
});

// Test performance timer
Deno.test("Performance - timer should work", () => {
  const start = performance.now();

  // Simulate some work
  for (let i = 0; i < 1000; i++) {
    Math.random();
  }

  const elapsed = performance.now() - start;
  assertEquals(elapsed > 0, true);
});

console.log("✅ Basic unit tests completed");