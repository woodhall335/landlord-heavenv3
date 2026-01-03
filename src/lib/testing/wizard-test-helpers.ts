/**
 * Wizard Test Helpers
 *
 * CLAUDE CODE FIX #8: Explicit test execution patterns
 *
 * CRITICAL: Tests run against dedicated test database
 * with service role authentication.
 *
 * Setup required:
 * 1. Create test database
 * 2. Configure .env.test with test credentials
 * 3. Use SUPABASE_SERVICE_ROLE_KEY_TEST for write access
 *
 * Never run against production.
 */

import { createClient } from '@supabase/supabase-js';

declare global {
  // Shared in-memory case store for tests; kept lightweight to avoid Supabase dependency
  // eslint-disable-next-line no-var
  var __TEST_CASE_STORE__: Map<string, Record<string, any>> | undefined;
}

const testCaseStore: Map<string, Record<string, any>> =
  globalThis.__TEST_CASE_STORE__ || new Map();

globalThis.__TEST_CASE_STORE__ = testCaseStore;

/**
 * Get test Supabase client
 * Uses service role for write access to cases table
 */
export function getTestSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL_TEST;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY_TEST;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Test environment not configured. ' +
        'Set SUPABASE_URL_TEST and SUPABASE_SERVICE_ROLE_KEY_TEST in .env.test'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Get test API base URL
 *
 * CLAUDE CODE FIX #8: Explicit URL construction for API tests
 */
export function getTestBaseUrl(): string {
  const baseUrl = process.env.TEST_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      'TEST_BASE_URL not configured in test environment. ' +
        'Set TEST_BASE_URL=http://localhost:3000 in .env.test'
    );
  }
  return baseUrl;
}

/**
 * Create test case with facts
 * Returns case ID for testing
 */
export async function createTestCase(facts: Record<string, any>): Promise<string> {
  // Use in-memory store during tests to avoid external dependencies
  const id = `test-case-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  testCaseStore.set(id, facts);

  console.log(`[Test Helper] Created test case: ${id}`);
  return id;
}

/**
 * Cleanup test case
 * Call in afterEach
 */
export async function cleanupTestCase(caseId: string) {
  testCaseStore.delete(caseId);
  console.log(`[Test Helper] Cleaned up test case: ${caseId}`);
}

/**
 * Verify test environment is configured
 * Call in beforeAll
 */
export function verifyTestEnvironment() {
  const requiredVars = [
    'SUPABASE_URL_TEST',
    'SUPABASE_SERVICE_ROLE_KEY_TEST',
    'TEST_BASE_URL',
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Test environment not configured. Missing: ${missing.join(', ')}. ` +
        `See docs/TESTING.md for setup instructions.`
    );
  }

  console.log('[Test Helper] Test environment verified ✅');
}
