#!/usr/bin/env tsx
/**
 * Verification script for contract holder regex fix
 *
 * This demonstrates that the regex /contract\s*holder/i correctly matches
 * all PDF-rendered variants after normalization.
 */

/**
 * Normalize PDF text (same as in prove-notice-only-e2e.ts)
 */
function normalizePdfText(text: string): string {
  return text
    .toLowerCase()
    // Convert all whitespace (including NBSP \u00A0) to regular spaces
    .replace(/[\s\u00A0\t\n\r]+/g, ' ')
    // Remove all hyphen-like characters
    .replace(/[\u002D\u2010\u2011\u2012\u2013\u2212]/g, '')
    // Normalize currency: remove commas and spaces between pound sign and digits
    .replace(/£[\s,]*/g, '£')
    // Remove commas and spaces between digits (for currency matching)
    .replace(/(\d)[\s,]+(?=\d)/g, '$1')
    .trim();
}

/**
 * Check if normalized text matches a regex pattern
 */
function matchesNormalized(text: string, pattern: RegExp): boolean {
  return pattern.test(normalizePdfText(text));
}

// Test cases representing various PDF rendering scenarios
const testCases = [
  {
    name: 'Standard spacing',
    input: 'The contract holder must vacate the property',
    expected: true,
  },
  {
    name: 'Hyphenated (common in PDFs)',
    input: 'The contract-holder must vacate the property',
    expected: true,
  },
  {
    name: 'No space (after hyphen removal)',
    input: 'The contractholder must vacate the property',
    expected: true,
  },
  {
    name: 'Multiple spaces',
    input: 'The contract  holder must vacate the property',
    expected: true,
  },
  {
    name: 'Line break between words',
    input: 'The contract\nholder must vacate the property',
    expected: true,
  },
  {
    name: 'Tab between words',
    input: 'The contract\tholder must vacate the property',
    expected: true,
  },
  {
    name: 'Non-breaking space',
    input: 'The contract\u00A0holder must vacate the property',
    expected: true,
  },
  {
    name: 'Hyphen with line break (PDF wrap)',
    input: 'The contract-\nholder must vacate the property',
    expected: true,
  },
  {
    name: 'En-dash variant',
    input: 'The contract–holder must vacate the property',
    expected: true,
  },
  {
    name: 'Case insensitive - uppercase',
    input: 'The CONTRACT HOLDER must vacate',
    expected: true,
  },
  {
    name: 'Case insensitive - mixed',
    input: 'The Contract Holder must vacate',
    expected: true,
  },
  {
    name: 'Negative test - unrelated text',
    input: 'The tenant must vacate the property',
    expected: false,
  },
];

// The fixed regex (without the incorrect -? pattern)
const CORRECT_REGEX = /contract\s*holder/i;

// The old broken regex (with -? that tries to match removed hyphens)
const OLD_REGEX = /contract\s*-?\s*holder/i;

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║  Contract Holder Regex Fix Verification                     ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log('');

console.log('📝 Testing regex: /contract\\s*holder/i');
console.log('   (Applied to normalized PDF text where hyphens are removed)');
console.log('');

let passCount = 0;
let failCount = 0;

for (const testCase of testCases) {
  const normalizedInput = normalizePdfText(testCase.input);
  const matchesCorrect = matchesNormalized(testCase.input, CORRECT_REGEX);
  const matchesOld = matchesNormalized(testCase.input, OLD_REGEX);

  const passed = matchesCorrect === testCase.expected;
  const status = passed ? '✅' : '❌';

  if (passed) {
    passCount++;
  } else {
    failCount++;
  }

  console.log(`${status} ${testCase.name}`);
  console.log(`   Input: "${testCase.input}"`);
  console.log(`   Normalized: "${normalizedInput}"`);
  console.log(`   Expected match: ${testCase.expected}`);
  console.log(`   ✅ New regex matches: ${matchesCorrect}`);

  if (matchesCorrect !== matchesOld) {
    console.log(`   ⚠️  Old regex matches: ${matchesOld} (would have failed!)`);
  }

  console.log('');
}

console.log('─'.repeat(70));
console.log(`📊 Results: ${passCount}/${testCases.length} tests passed`);
console.log('─'.repeat(70));
console.log('');

if (failCount === 0) {
  console.log('🎉 SUCCESS: All test cases passed!');
  console.log('');
  console.log('The regex /contract\\s*holder/i correctly handles:');
  console.log('  ✅ Normal spacing: "contract holder"');
  console.log('  ✅ Hyphens: "contract-holder" → "contractholder" (after normalization)');
  console.log('  ✅ Line breaks: "contract\\nholder" → "contract holder" (after normalization)');
  console.log('  ✅ Multiple spaces and special whitespace');
  console.log('  ✅ Case insensitivity');
  console.log('');
  console.log('Key insight: Since normalizePdfText() removes hyphens, the regex must');
  console.log('use \\s* (zero or more spaces) to match both "contract holder" and');
  console.log('"contractholder" (which is what "contract-holder" becomes).');
  console.log('');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Some tests failed');
  console.log('');
  process.exit(1);
}
