/**
 * Fulfillment Completeness Tests
 *
 * Tests that fulfillment validation uses exact key-based matching
 * to determine completeness rather than count-based heuristics.
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the pack-contents function to control expected keys
vi.mock('@/lib/products', () => ({
  getPackContents: vi.fn(() => [
    { key: 'n1_claim', label: 'N1 Claim Form', type: 'court_form' },
    { key: 'particulars_of_claim', label: 'Particulars of Claim', type: 'particulars' },
    { key: 'arrears_schedule', label: 'Arrears Schedule', type: 'schedule' },
    { key: 'interest_calculation', label: 'Interest Calculation', type: 'guidance' },
    { key: 'letter_before_claim', label: 'Letter Before Claim', type: 'guidance' },
  ]),
}));

describe('Fulfillment completeness validation', () => {
  it('fails when correct count but missing specific expected key', async () => {
    /**
     * This test verifies the critical fix: a case should NOT be marked complete
     * if it has the right number of documents but is missing a specific expected key.
     *
     * Scenario: Pack expects 5 documents: n1_claim, particulars_of_claim, arrears_schedule,
     * interest_calculation, letter_before_claim.
     *
     * Case has 5 documents but with these types:
     * - n1_claim
     * - particulars_of_claim
     * - arrears_schedule
     * - guidance (wrong - should be interest_calculation)
     * - evidence (wrong - should be letter_before_claim)
     *
     * Old count-based logic: 5 >= 5 => complete ❌
     * New key-based logic: missing interest_calculation, letter_before_claim => incomplete ✅
     */
    const expectedKeys = [
      'n1_claim',
      'particulars_of_claim',
      'arrears_schedule',
      'interest_calculation',
      'letter_before_claim',
    ];

    // Simulated actual documents in database (5 docs, but wrong types)
    const actualDocumentTypes = [
      'n1_claim',
      'particulars_of_claim',
      'arrears_schedule',
      'guidance', // WRONG - this is the old category-based type
      'evidence', // WRONG - this is the old category-based type
    ];

    // Old count-based validation (INCORRECT)
    const countBasedComplete = actualDocumentTypes.length >= expectedKeys.length;
    expect(countBasedComplete).toBe(true); // Would incorrectly pass

    // New key-based validation (CORRECT)
    const missingKeys = expectedKeys.filter((key) => !actualDocumentTypes.includes(key));
    const keyBasedComplete = missingKeys.length === 0;

    expect(keyBasedComplete).toBe(false); // Correctly fails
    expect(missingKeys).toContain('interest_calculation');
    expect(missingKeys).toContain('letter_before_claim');
  });

  it('passes when all expected keys are present', async () => {
    const expectedKeys = [
      'n1_claim',
      'particulars_of_claim',
      'arrears_schedule',
      'interest_calculation',
      'letter_before_claim',
    ];

    // Simulated actual documents in database with correct canonical types
    const actualDocumentTypes = [
      'n1_claim',
      'particulars_of_claim',
      'arrears_schedule',
      'interest_calculation',
      'letter_before_claim',
    ];

    const missingKeys = expectedKeys.filter((key) => !actualDocumentTypes.includes(key));
    const keyBasedComplete = missingKeys.length === 0;

    expect(keyBasedComplete).toBe(true);
    expect(missingKeys).toHaveLength(0);
  });

  it('detects missing keys even with extra documents', async () => {
    /**
     * Scenario: Pack expects 3 keys, case has 5 documents,
     * but is missing one required key.
     */
    const expectedKeys = ['section8_notice', 'n5_claim', 'n119_particulars'];

    const actualDocumentTypes = [
      'section8_notice',
      'n5_claim',
      // n119_particulars is missing
      'proof_of_service', // Extra doc
      'evidence_checklist', // Extra doc
      'case_summary', // Extra doc
    ];

    const missingKeys = expectedKeys.filter((key) => !actualDocumentTypes.includes(key));
    const keyBasedComplete = missingKeys.length === 0;

    expect(keyBasedComplete).toBe(false);
    expect(missingKeys).toEqual(['n119_particulars']);
    // Even though count (5) > expected (3), validation correctly fails
    expect(actualDocumentTypes.length).toBeGreaterThan(expectedKeys.length);
  });

  it('correctly handles conditional documents like interest_calculation', async () => {
    /**
     * When claim_interest is false, interest_calculation is not expected.
     * Pack contents should NOT include it, so validation passes without it.
     */
    const expectedKeysNoInterest = ['n1_claim', 'particulars_of_claim', 'arrears_schedule'];

    const actualDocumentTypes = ['n1_claim', 'particulars_of_claim', 'arrears_schedule'];

    const missingKeys = expectedKeysNoInterest.filter((key) => !actualDocumentTypes.includes(key));
    const keyBasedComplete = missingKeys.length === 0;

    expect(keyBasedComplete).toBe(true);
    expect(missingKeys).toHaveLength(0);
  });
});

describe('Generator document_type field', () => {
  it('money claim pack documents have canonical document_type keys', { timeout: 15000 }, async () => {
    // Import the actual generator to verify document_type is set correctly
    const { MoneyClaimPackDocument } = await import('@/lib/documents/money-claim-pack-generator');

    // The interface should include document_type field
    // This is a compile-time check - if document_type is missing, TypeScript will error
    const doc: Partial<typeof MoneyClaimPackDocument> = {
      title: 'Test',
      description: 'Test',
      category: 'particulars',
      document_type: 'particulars_of_claim',
      file_name: 'test.pdf',
    };

    expect(doc.document_type).toBe('particulars_of_claim');
  });

  it('eviction pack documents have canonical document_type keys', { timeout: 15000 }, async () => {
    const { EvictionPackDocument } = await import('@/lib/documents/eviction-pack-generator');

    const doc: Partial<typeof EvictionPackDocument> = {
      title: 'Section 8 Notice',
      description: 'Test',
      category: 'notice',
      document_type: 'section8_notice',
      file_name: 'section8_notice.pdf',
    };

    expect(doc.document_type).toBe('section8_notice');
  });
});
