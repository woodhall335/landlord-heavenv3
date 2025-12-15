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
  const supabase = getTestSupabaseClient();

  const { data, error } = await supabase
    .from('cases')
    .insert({
      facts,
      status: 'in_progress',
      user_id: 'test-user', // Test user ID
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('[Test Helper] Failed to create test case:', error);
    throw error;
  }

  console.log(`[Test Helper] Created test case: ${data.id}`);
  return data.id;
}

/**
 * Cleanup test case
 * Call in afterEach
 */
export async function cleanupTestCase(caseId: string) {
  const supabase = getTestSupabaseClient();

  await supabase.from('cases').delete().eq('id', caseId);

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
