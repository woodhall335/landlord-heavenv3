#!/usr/bin/env node

/**
 * Quick test to verify Wales Notice Only fixes
 */

console.log('='.repeat(80));
console.log('WALES NOTICE ONLY - FIX VERIFICATION TEST');
console.log('='.repeat(80));
console.log('');

// Test 1: Decision Engine Support for Wales
console.log('Test 1: Decision Engine - Wales Jurisdiction Support');
console.log('-'.repeat(80));

try {
  const { runDecisionEngine } = await import('./src/lib/decision-engine/index.ts');

  const testInput = {
    jurisdiction: 'wales',
    product: 'notice_only',
    case_type: 'eviction',
    facts: {
      wales_contract_category: 'standard',
      rent_smart_wales_registered: true,
      deposit_taken: true,
      deposit_protected: true,
    }
  };

  console.log('Input:', JSON.stringify(testInput, null, 2));

  const result = runDecisionEngine(testInput);

  console.log('\nOutput:');
  console.log('  Recommended routes:', result.recommended_routes);
  console.log('  Allowed routes:', result.allowed_routes);
  console.log('  Blocked routes:', result.blocked_routes);
  console.log('  Blocking issues:', result.blocking_issues.length);
  console.log('  Analysis:', result.analysis_summary);

  // Verify expected behavior
  if (result.allowed_routes.includes('wales_section_173')) {
    console.log('\n✅ PASS: Section 173 is allowed for standard contract');
  } else {
    console.log('\n❌ FAIL: Section 173 should be allowed for standard contract');
    process.exit(1);
  }

  if (result.allowed_routes.includes('wales_fault_based')) {
    console.log('✅ PASS: Fault-based routes are allowed');
  } else {
    console.log('❌ FAIL: Fault-based routes should be allowed');
    process.exit(1);
  }

} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}

console.log('');

// Test 2: Decision Engine - Supported/Secure Contract Blocking
console.log('Test 2: Decision Engine - Section 173 Blocked for Supported/Secure');
console.log('-'.repeat(80));

try {
  const { runDecisionEngine } = await import('./src/lib/decision-engine/index.ts');

  const testInput = {
    jurisdiction: 'wales',
    product: 'notice_only',
    case_type: 'eviction',
    facts: {
      wales_contract_category: 'supported_standard',
      rent_smart_wales_registered: true,
    }
  };

  console.log('Input:', JSON.stringify(testInput, null, 2));

  const result = runDecisionEngine(testInput);

  console.log('\nOutput:');
  console.log('  Recommended routes:', result.recommended_routes);
  console.log('  Allowed routes:', result.allowed_routes);
  console.log('  Blocked routes:', result.blocked_routes);
  console.log('  Blocking issues:', result.blocking_issues.length);

  // Verify expected behavior
  if (result.blocked_routes.includes('wales_section_173')) {
    console.log('\n✅ PASS: Section 173 is blocked for supported_standard contract');
  } else {
    console.log('\n❌ FAIL: Section 173 should be blocked for supported_standard contract');
    process.exit(1);
  }

  if (result.allowed_routes.includes('wales_fault_based')) {
    console.log('✅ PASS: Fault-based routes are still allowed');
  } else {
    console.log('❌ FAIL: Fault-based routes should be allowed');
    process.exit(1);
  }

} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}

console.log('');

// Test 3: MQS Dependency Logic - allOf and valueContains
console.log('Test 3: MQS Dependency Logic - allOf and valueContains');
console.log('-'.repeat(80));

console.log('Testing dependency evaluation logic...');

const mockMQS = {
  product: 'notice_only',
  jurisdiction: 'wales',
  questions: [
    { id: 'selected_notice_route', maps_to: ['selected_notice_route'] },
    { id: 'wales_contract_category', maps_to: ['wales_contract_category'] }
  ]
};

const mockFacts = {
  selected_notice_route: 'wales_section_173',
  wales_contract_category: 'standard'
};

const mockQuestion = {
  id: 'test_blocking_message',
  dependsOn: {
    allOf: [
      { questionId: 'selected_notice_route', value: 'wales_section_173' },
      { questionId: 'wales_contract_category', valueContains: ['supported_standard', 'secure'] }
    ]
  }
};

try {
  const { questionIsApplicable } = await import('./src/lib/wizard/mqs-loader.ts');

  const isApplicable = questionIsApplicable(mockMQS, mockQuestion, mockFacts);

  console.log('Facts:', JSON.stringify(mockFacts, null, 2));
  console.log('Question depends on:', JSON.stringify(mockQuestion.dependsOn, null, 2));
  console.log('Is question applicable?', isApplicable);

  if (!isApplicable) {
    console.log('\n✅ PASS: Blocking message NOT shown for standard contract (correct!)');
  } else {
    console.log('\n❌ FAIL: Blocking message should NOT be shown for standard contract');
    process.exit(1);
  }

} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}

console.log('');

// Test 4: MQS Dependency Logic - Should block for supported_standard
console.log('Test 4: MQS Dependency Logic - Should Show for Supported Contract');
console.log('-'.repeat(80));

const mockFacts2 = {
  selected_notice_route: 'wales_section_173',
  wales_contract_category: 'supported_standard'
};

try {
  const { questionIsApplicable } = await import('./src/lib/wizard/mqs-loader.ts');

  const isApplicable = questionIsApplicable(mockMQS, mockQuestion, mockFacts2);

  console.log('Facts:', JSON.stringify(mockFacts2, null, 2));
  console.log('Is question applicable?', isApplicable);

  if (isApplicable) {
    console.log('\n✅ PASS: Blocking message IS shown for supported_standard contract (correct!)');
  } else {
    console.log('\n❌ FAIL: Blocking message should be shown for supported_standard contract');
    process.exit(1);
  }

} catch (err) {
  console.error('❌ ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}

console.log('');
console.log('='.repeat(80));
console.log('✅ ALL TESTS PASSED!');
console.log('='.repeat(80));
console.log('');
console.log('Summary of fixes:');
console.log('1. ✅ Decision engine now supports Wales as separate jurisdiction');
console.log('2. ✅ Section 173 allowed for standard contracts, blocked for supported/secure');
console.log('3. ✅ Fault-based routes always available for all Wales contract types');
console.log('4. ✅ MQS dependency logic supports allOf and valueContains');
console.log('5. ✅ "Section 173 Not Available" message correctly gated');
console.log('');
