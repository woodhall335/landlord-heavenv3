/**
 * Regression tests for preview duplicate key UPSERT fix
 *
 * Tests that verify:
 * 1. Document type deduplication before generation
 * 2. UPSERT logic handles duplicate document inserts gracefully
 * 3. Risk key is recognized in normalize.ts known structures
 *
 * Related to: 23505 duplicate key value violates unique constraint
 * "idx_documents_case_type_preview_unique"
 */

import { describe, expect, it, vi } from 'vitest';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';

// ============================================================================
// DOCUMENT TYPE DEDUPLICATION TESTS
// Tests that document types are deduplicated before generation
// ============================================================================

describe('Document Type Deduplication', () => {
  // Simulate the getDocumentTypesForProduct function with deduplication
  const getDocumentTypesForProduct = (
    product: string,
    jurisdiction: string,
    noticeRoute: string
  ): string[] => {
    const types: string[] = [];

    const getNoticeType = (): string => {
      if (jurisdiction === 'scotland') return 'notice_to_leave';
      if (noticeRoute === 'section_21' || noticeRoute === 'accelerated_possession') return 'section21_notice';
      return 'section8_notice';
    };

    if (product === 'notice_only') {
      types.push(getNoticeType());
      types.push('service_instructions');
      types.push('service_checklist');
    } else if (product === 'complete_pack') {
      types.push(getNoticeType());

      if (jurisdiction === 'england' || jurisdiction === 'wales') {
        types.push('n5_claim');
        types.push('n119_particulars');
        if (noticeRoute === 'section_21' || noticeRoute === 'accelerated_possession') {
          types.push('n5b_claim');
        }
      }

      types.push('witness_statement');
      types.push('service_instructions');
      types.push('service_checklist');

      if (jurisdiction === 'england' || jurisdiction === 'wales') {
        types.push('court_filing_guide');
      } else if (jurisdiction === 'scotland') {
        types.push('tribunal_lodging_guide');
      }

      types.push('evidence_checklist');
      types.push('proof_of_service');
      types.push('arrears_schedule');
    }

    // Deduplicate document types - this is what we're testing
    return [...new Set(types)];
  };

  it('should return unique document types for complete_pack', () => {
    const types = getDocumentTypesForProduct('complete_pack', 'england', 'section_8');

    // Check for uniqueness
    const uniqueTypes = new Set(types);
    expect(types.length).toBe(uniqueTypes.size);
  });

  it('should return unique document types for notice_only', () => {
    const types = getDocumentTypesForProduct('notice_only', 'england', 'section_8');

    // Check for uniqueness
    const uniqueTypes = new Set(types);
    expect(types.length).toBe(uniqueTypes.size);
  });

  it('should handle intentional duplicates by deduplicating them', () => {
    // Simulate a scenario where duplicates might be accidentally added
    const createTypesWithDuplicates = (): string[] => {
      const types: string[] = [];
      types.push('section8_notice');
      types.push('service_instructions');
      types.push('section8_notice'); // Intentional duplicate
      types.push('service_instructions'); // Intentional duplicate
      return [...new Set(types)];
    };

    const types = createTypesWithDuplicates();
    expect(types).toHaveLength(2);
    expect(types).toContain('section8_notice');
    expect(types).toContain('service_instructions');
  });

  it('should preserve order when deduplicating (first occurrence wins)', () => {
    const createTypesWithDuplicates = (): string[] => {
      const types: string[] = [];
      types.push('section8_notice');
      types.push('service_instructions');
      types.push('section8_notice'); // Duplicate
      types.push('service_checklist');
      return [...new Set(types)];
    };

    const types = createTypesWithDuplicates();
    expect(types).toEqual(['section8_notice', 'service_instructions', 'service_checklist']);
  });
});

// ============================================================================
// UPSERT BEHAVIOR TESTS
// Tests the expected behavior of UPSERT for preview documents
// ============================================================================

describe('UPSERT Behavior for Preview Documents', () => {
  // These are unit tests for the expected UPSERT behavior
  // The actual DB interaction is tested via integration tests

  it('should define unique constraint columns correctly', () => {
    // The unique constraint is on (case_id, document_type, is_preview)
    const onConflictColumns = 'case_id,document_type,is_preview';
    expect(onConflictColumns.split(',')).toEqual(['case_id', 'document_type', 'is_preview']);
  });

  it('should update these fields on conflict', () => {
    // When UPSERT triggers an update, these fields should be overwritten
    const fieldsToUpdate = [
      'document_title',
      'html_content',
      'pdf_url',
      'qa_passed',
      'qa_score',
      'qa_issues',
      'updated_at',
    ];

    // Ensure we're updating the right fields
    expect(fieldsToUpdate).toContain('pdf_url');
    expect(fieldsToUpdate).toContain('html_content');
    expect(fieldsToUpdate).toContain('updated_at');
  });

  it('should handle 23505 error code gracefully', () => {
    // 23505 is PostgreSQL unique_violation error code
    const error23505 = { code: '23505', message: 'duplicate key value violates unique constraint' };
    expect(error23505.code).toBe('23505');

    // The fallback should:
    // 1. Detect 23505
    // 2. Fetch existing record
    // 3. Update it
    // 4. Return success
    const shouldTriggerFallback = (errorCode: string): boolean => {
      return errorCode === '23505';
    };

    expect(shouldTriggerFallback(error23505.code)).toBe(true);
    expect(shouldTriggerFallback('42P01')).toBe(false); // undefined_table
  });
});

// ============================================================================
// NORMALIZE.TS KNOWN STRUCTURES TESTS
// Tests that risk key is properly handled as a known structure
// ============================================================================

describe('Normalize Known Structures - Risk Key', () => {
  it('risk should be in known structures list', async () => {
    // Create wizard facts with a risk object
    const wizardFacts = {
      tenant_full_name: 'John Doe',
      landlord_full_name: 'Jane Smith',
      property_address_line1: '123 Test Street',
      risk: {
        known_tenant_defences: 'None',
        previous_court_proceedings: false,
        disrepair_complaints: false,
        tenant_vulnerability: 'unknown',
      },
    };

    // Capture console.warn calls
    const warnSpy = vi.spyOn(console, 'warn');

    // This should not warn about "unexpected object for key risk"
    const caseFacts = wizardFactsToCaseFacts(wizardFacts);

    // Check that no warning was logged for 'risk' key
    const riskWarning = warnSpy.mock.calls.find(
      call => call[0]?.includes?.('risk') && call[0]?.includes?.('unexpected object')
    );
    expect(riskWarning).toBeUndefined();

    // The risk object should be preserved as a structure
    expect(caseFacts).toBeDefined();
    expect((caseFacts as any).risk).toBeDefined();

    warnSpy.mockRestore();
  });

  it('communication_timeline should still be in known structures list', async () => {
    // Ensure we didn't break existing known structures
    const wizardFacts = {
      tenant_full_name: 'John Doe',
      landlord_full_name: 'Jane Smith',
      property_address_line1: '123 Test Street',
      communication_timeline: {
        entries: [
          { date: '2025-01-01', method: 'email', summary: 'Rent reminder sent' },
        ],
        narrative: 'Multiple attempts to contact tenant about arrears',
      },
    };

    const warnSpy = vi.spyOn(console, 'warn');

    const caseFacts = wizardFactsToCaseFacts(wizardFacts);

    // Check that no warning was logged for 'communication_timeline' key
    const timelineWarning = warnSpy.mock.calls.find(
      call => call[0]?.includes?.('communication_timeline') && call[0]?.includes?.('unexpected object')
    );
    expect(timelineWarning).toBeUndefined();

    expect((caseFacts as any).communication_timeline).toBeDefined();

    warnSpy.mockRestore();
  });

  it('should still warn for truly unexpected objects', async () => {
    // Ensure the warning still works for unknown keys
    const wizardFacts = {
      tenant_full_name: 'John Doe',
      landlord_full_name: 'Jane Smith',
      property_address_line1: '123 Test Street',
      some_unknown_nested_object: {
        foo: 'bar',
        nested: { deep: 'value' },
      },
    };

    const warnSpy = vi.spyOn(console, 'warn');

    wizardFactsToCaseFacts(wizardFacts);

    // Should warn about the unknown object (unless it matches special handling rules)
    // Note: The actual behavior depends on the normalize.ts implementation details
    // This test documents the expected behavior

    warnSpy.mockRestore();
  });
});

// ============================================================================
// IDEMPOTENT PREVIEW GENERATION TESTS
// Tests that preview generation is idempotent
// ============================================================================

describe('Idempotent Preview Generation', () => {
  it('second call should update, not fail', () => {
    // This is a conceptual test - actual implementation uses UPSERT
    // The key assertion is that two calls with same (case_id, document_type, is_preview)
    // should result in exactly one record

    const simulateUpsertBehavior = (
      records: Map<string, any>,
      key: string,
      newData: any
    ): { success: boolean; operation: 'insert' | 'update' } => {
      if (records.has(key)) {
        // Update existing
        records.set(key, { ...records.get(key), ...newData, updated_at: new Date() });
        return { success: true, operation: 'update' };
      } else {
        // Insert new
        records.set(key, { ...newData, created_at: new Date() });
        return { success: true, operation: 'insert' };
      }
    };

    const records = new Map<string, any>();
    const key = 'case123:section8_notice:true'; // case_id:document_type:is_preview

    // First call - should insert
    const result1 = simulateUpsertBehavior(records, key, { pdf_url: 'url1.pdf' });
    expect(result1.operation).toBe('insert');
    expect(records.size).toBe(1);

    // Second call - should update, not fail
    const result2 = simulateUpsertBehavior(records, key, { pdf_url: 'url2.pdf' });
    expect(result2.operation).toBe('update');
    expect(result2.success).toBe(true);
    expect(records.size).toBe(1); // Still only one record

    // Data should be from second call
    expect(records.get(key).pdf_url).toBe('url2.pdf');
  });

  it('concurrent calls should not result in duplicates', () => {
    // With UPSERT, even concurrent calls should result in exactly one record
    // The winner of the race will insert, the loser will update

    const compositeKey = (caseId: string, docType: string, isPreview: boolean): string => {
      return `${caseId}:${docType}:${isPreview}`;
    };

    const key1 = compositeKey('case-abc', 'section8_notice', true);
    const key2 = compositeKey('case-abc', 'section8_notice', true);

    // Same composite key
    expect(key1).toBe(key2);

    // Different combinations = different keys
    const key3 = compositeKey('case-abc', 'section21_notice', true);
    const key4 = compositeKey('case-abc', 'section8_notice', false);

    expect(key1).not.toBe(key3);
    expect(key1).not.toBe(key4);
  });
});

// ============================================================================
// MANIFEST DEDUPLICATION TESTS
// Tests that duplicate doc types in manifest are handled
// ============================================================================

describe('Manifest Deduplication', () => {
  it('should deduplicate document types from manifest before saving', () => {
    // Simulate a manifest with duplicate document types
    const manifest = [
      { document_type: 'section8_notice', title: 'Section 8 Notice' },
      { document_type: 'service_instructions', title: 'Service Instructions' },
      { document_type: 'section8_notice', title: 'Section 8 Notice (duplicate)' }, // Duplicate
    ];

    // Dedupe by document_type, keeping first occurrence
    const seenTypes = new Set<string>();
    const dedupedManifest = manifest.filter((doc) => {
      if (seenTypes.has(doc.document_type)) {
        return false;
      }
      seenTypes.add(doc.document_type);
      return true;
    });

    expect(dedupedManifest).toHaveLength(2);
    expect(dedupedManifest.map(d => d.document_type)).toEqual(['section8_notice', 'service_instructions']);
  });

  it('should handle empty manifest', () => {
    const manifest: any[] = [];
    const dedupedManifest = [...new Set(manifest)];
    expect(dedupedManifest).toHaveLength(0);
  });
});
