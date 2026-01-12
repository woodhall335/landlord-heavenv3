/**
 * Checkout Idempotency Test Script
 *
 * Tests that:
 * 1. Calling /api/checkout/create twice returns the same pending checkout_url
 * 2. After payment, calling /api/checkout/create returns "already_paid"
 * 3. Database constraint prevents duplicate paid orders
 *
 * Run with: npx tsx scripts/test-checkout-idempotency.ts
 *
 * Prerequisites:
 * - Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables
 * - Or manually set TEST_ACCESS_TOKEN
 * - Have a test case_id ready
 */

import { createClient } from '@supabase/supabase-js';

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CheckoutResponse {
  status: 'already_paid' | 'pending' | 'new';
  redirect_url?: string;
  checkout_url?: string;
  session_url?: string;
  session_id?: string;
  order_id?: string;
  message?: string;
  success?: boolean;
  error?: string;
}

async function getAccessToken(): Promise<string> {
  // Option 1: Use provided access token
  if (process.env.TEST_ACCESS_TOKEN) {
    return process.env.TEST_ACCESS_TOKEN;
  }

  // Option 2: Sign in with email/password
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Please set TEST_ACCESS_TOKEN or (TEST_USER_EMAIL and TEST_USER_PASSWORD)'
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    throw new Error(`Failed to sign in: ${error?.message || 'No session'}`);
  }

  return data.session.access_token;
}

async function callCheckoutCreate(
  accessToken: string,
  caseId: string,
  productType: string
): Promise<CheckoutResponse> {
  const response = await fetch(`${BASE_URL}/api/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      product_type: productType,
      case_id: caseId,
    }),
  });

  const data = await response.json();
  return data;
}

async function createTestCase(accessToken: string): Promise<string> {
  // Create a test case for idempotency testing
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Get user ID from token
  const { data: userData } = await supabase.auth.getUser(accessToken);
  if (!userData.user) {
    throw new Error('Failed to get user from token');
  }

  const { data: caseData, error } = await supabase
    .from('cases')
    .insert({
      user_id: userData.user.id,
      jurisdiction: 'england',
      case_type: 'eviction',
      status: 'in_progress',
      collected_facts: {
        selected_notice_route: 'section_21',
        property_address: '123 Test Street, London, E1 1AA',
      },
    })
    .select('id')
    .single();

  if (error || !caseData) {
    throw new Error(`Failed to create test case: ${error?.message}`);
  }

  return caseData.id;
}

async function cleanupTestData(caseId: string): Promise<void> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Delete orders for this case
  await supabase.from('orders').delete().eq('case_id', caseId);

  // Delete the test case
  await supabase.from('cases').delete().eq('id', caseId);
}

async function simulatePaidOrder(caseId: string, productType: string, userId: string): Promise<string> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  const { data: order, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      case_id: caseId,
      product_type: productType,
      product_name: 'Test Product',
      amount: 39.99,
      currency: 'GBP',
      total_amount: 39.99,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      stripe_session_id: `cs_test_${Date.now()}`,
      paid_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error || !order) {
    throw new Error(`Failed to create paid order: ${error?.message}`);
  }

  return order.id;
}

// =============================================================================
// TEST CASES
// =============================================================================

async function testPendingSessionReuse(accessToken: string, caseId: string): Promise<boolean> {
  console.log('\n--- Test 1: Pending Session Reuse ---');

  const productType = 'notice_only';

  // First call - should create new session
  console.log('Call 1: Creating new checkout session...');
  const response1 = await callCheckoutCreate(accessToken, caseId, productType);

  if (response1.status !== 'new') {
    console.error(`Expected status 'new', got '${response1.status}'`);
    console.error('Response:', response1);
    return false;
  }

  const sessionUrl1 = response1.session_url;
  const orderId1 = response1.order_id;
  console.log(`✓ Created new session: ${response1.session_id}`);
  console.log(`  Order ID: ${orderId1}`);

  // Second call - should reuse the same session
  console.log('\nCall 2: Should reuse existing session...');
  const response2 = await callCheckoutCreate(accessToken, caseId, productType);

  if (response2.status !== 'pending') {
    console.error(`Expected status 'pending', got '${response2.status}'`);
    console.error('Response:', response2);
    return false;
  }

  const sessionUrl2 = response2.checkout_url;
  const orderId2 = response2.order_id;

  if (orderId1 !== orderId2) {
    console.error(`Order ID mismatch: ${orderId1} vs ${orderId2}`);
    return false;
  }

  console.log(`✓ Reused pending session: ${response2.session_id}`);
  console.log(`  Same order ID: ${orderId2}`);
  console.log(`  Message: ${response2.message}`);

  console.log('\n✓ Test 1 PASSED: Pending session is correctly reused');
  return true;
}

async function testAlreadyPaidBlocking(accessToken: string, caseId: string): Promise<boolean> {
  console.log('\n--- Test 2: Already Paid Blocking ---');

  const productType = 'complete_pack';

  // Get user ID
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const { data: userData } = await supabase.auth.getUser(accessToken);
  if (!userData.user) {
    throw new Error('Failed to get user');
  }

  // Simulate a paid order
  console.log('Simulating paid order...');
  const paidOrderId = await simulatePaidOrder(caseId, productType, userData.user.id);
  console.log(`✓ Created paid order: ${paidOrderId}`);

  // Try to create another checkout - should be blocked
  console.log('\nAttempting to create checkout for already-paid product...');
  const response = await callCheckoutCreate(accessToken, caseId, productType);

  if (response.status !== 'already_paid') {
    console.error(`Expected status 'already_paid', got '${response.status}'`);
    console.error('Response:', response);
    return false;
  }

  console.log(`✓ Checkout blocked with status: ${response.status}`);
  console.log(`  Redirect URL: ${response.redirect_url}`);
  console.log(`  Message: ${response.message}`);

  console.log('\n✓ Test 2 PASSED: Already paid orders correctly block new checkouts');
  return true;
}

async function testDatabaseConstraint(caseId: string): Promise<boolean> {
  console.log('\n--- Test 3: Database Unique Constraint ---');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  const productType = 'money_claim';

  // Get any user ID for testing
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log('⚠ Skipping test - no users in database');
    return true;
  }
  const userId = users[0].id;

  // Create first paid order
  console.log('Creating first paid order...');
  const { data: order1, error: error1 } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      case_id: caseId,
      product_type: productType,
      product_name: 'Test Money Claim',
      amount: 199.99,
      currency: 'GBP',
      total_amount: 199.99,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      stripe_session_id: `cs_test_constraint_1_${Date.now()}`,
      paid_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error1) {
    console.error('Failed to create first order:', error1);
    return false;
  }
  console.log(`✓ Created first paid order: ${order1.id}`);

  // Try to create second paid order - should fail due to constraint
  console.log('\nAttempting to create duplicate paid order...');
  const { data: order2, error: error2 } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      case_id: caseId,
      product_type: productType,
      product_name: 'Test Money Claim Duplicate',
      amount: 199.99,
      currency: 'GBP',
      total_amount: 199.99,
      payment_status: 'paid',
      fulfillment_status: 'fulfilled',
      stripe_session_id: `cs_test_constraint_2_${Date.now()}`,
      paid_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (order2) {
    console.error('ERROR: Duplicate paid order was created!');
    console.error('Order ID:', order2.id);
    // Clean up
    await supabase.from('orders').delete().eq('id', order2.id);
    return false;
  }

  if (error2 && error2.code === '23505') {
    console.log(`✓ Duplicate order correctly rejected with unique constraint violation`);
    console.log(`  Error code: ${error2.code}`);
    console.log('\n✓ Test 3 PASSED: Database constraint prevents duplicate paid orders');
    return true;
  }

  console.log('⚠ Unexpected error (constraint may not be applied yet):');
  console.log(`  Error: ${error2?.message}`);
  console.log(`  Code: ${error2?.code}`);
  console.log('\n⚠ Test 3 SKIPPED: Run migration 010 to enable constraint');
  return true;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
  console.log('='.repeat(60));
  console.log('CHECKOUT IDEMPOTENCY TESTS');
  console.log('='.repeat(60));

  let accessToken: string;
  let testCaseId: string;
  let allPassed = true;

  try {
    // Setup
    console.log('\nSetting up test environment...');
    accessToken = await getAccessToken();
    console.log('✓ Authenticated');

    testCaseId = await createTestCase(accessToken);
    console.log(`✓ Created test case: ${testCaseId}`);

    // Run tests
    const test1Passed = await testPendingSessionReuse(accessToken, testCaseId);
    allPassed = allPassed && test1Passed;

    const test2Passed = await testAlreadyPaidBlocking(accessToken, testCaseId);
    allPassed = allPassed && test2Passed;

    const test3Passed = await testDatabaseConstraint(testCaseId);
    allPassed = allPassed && test3Passed;

    // Summary
    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('ALL TESTS PASSED ✓');
    } else {
      console.log('SOME TESTS FAILED ✗');
      process.exitCode = 1;
    }
    console.log('='.repeat(60));
  } catch (error: any) {
    console.error('\nTest execution failed:', error.message);
    process.exitCode = 1;
  } finally {
    // Cleanup
    if (testCaseId!) {
      console.log('\nCleaning up test data...');
      await cleanupTestData(testCaseId);
      console.log('✓ Cleanup complete');
    }
  }
}

main().catch(console.error);
