/**
 * Regression tests for Wales notice_only NOT calling generateSection8Notice
 *
 * Tests the fix for: Wales notice_only paid fulfillment/regeneration still fails with:
 * "At least one ground is required"
 * Even though logs show generateNoticeOnlyPack derives:
 * wales_fault_grounds ['rent_arrears_serious'] -> ground_codes ['section_157'].
 *
 * Root cause: The error "At least one ground is required" came from generateSection8Notice
 * being called with empty grounds[]. This happened because:
 * 1. generateNoticeOnlyPack correctly derived ground_codes from wales_fault_grounds
 * 2. But the England/Wales branch had no Wales-specific route check
 * 3. Wales fault_based route fell through to the Section 8 else block
 * 4. generateSection8Notice was called, which expects England grounds (Ground 8, etc.)
 * 5. Wales ground_codes (section_157) were not recognized as Section 8 grounds
 *
 * Fix: Added Wales-specific route handling in generateNoticeOnlyPack:
 * - For jurisdiction=wales + route=section_173: Generate via generateWalesSection173Notice
 * - For jurisdiction=wales + route=fault_based: Generate via Handlebars RHW23 template
 * - NEVER call generateSection8Notice for Wales (Section 8 is England-only)
 *
 * Key assertions:
 * - Wales fault_based produces document_type='fault_based_notice', NOT 'section8_notice'
 * - Wales section_173 produces document_type='section173_notice'
 * - England section_8 still produces document_type='section8_notice' (unchanged)
 * - Wales with invalid route (section_8) throws clear error
 */

import { generateNoticeOnlyPack } from '@/lib/documents/eviction-pack-generator';

describe('Wales notice_only should NOT call generateSection8Notice', () => {
  // Base Wales fault-based case facts
  const baseWalesFaultFacts = {
    __meta: {
      case_id: 'test-wales-fault-no-s8',
      jurisdiction: 'wales',
    },
    jurisdiction: 'wales',
    selected_notice_route: 'wales_fault_based',

    // Party info
    landlord_full_name: 'John Smith',
    landlord_address: '123 Main St, Cardiff, CF10 1AA',
    landlord_address_line1: '123 Main St',
    landlord_city: 'Cardiff',
    landlord_postcode: 'CF10 1AA',
    landlord_email: 'john@example.com',
    landlord_phone: '07000000000',

    tenant_full_name: 'Jane Doe',
    contract_holder_full_name: 'Jane Doe',
    property_address: '456 Rental Ave, Cardiff, CF10 2BB',
    property_address_line1: '456 Rental Ave',
    property_city: 'Cardiff',
    property_postcode: 'CF10 2BB',

    // Tenancy info
    tenancy_start_date: '2023-01-01',
    contract_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',

    // Wales fault grounds
    wales_fault_grounds: ['rent_arrears_serious'],
    wales_fault_based_section: 'Section 157',
    wales_breach_type: 'rent_arrears',

    // Arrears
    arrears_items: [
      { period_start: '2024-01-01', amount_due: 1000, amount_paid: 0 },
      { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
      { period_start: '2024-03-01', amount_due: 1000, amount_paid: 0 },
    ],
    total_arrears: 3000,
    arrears_total: 3000,
    rent_arrears_amount: 3000,

    // Notice dates
    service_date: '2024-04-01',
    notice_date: '2024-04-01',

    // Wales compliance
    wales_contract_category: 'standard',
    rent_smart_wales_registered: true,
    deposit_protected: true,
  };

  // Base Wales Section 173 case facts
  const baseWalesSection173Facts = {
    __meta: {
      case_id: 'test-wales-s173',
      jurisdiction: 'wales',
    },
    jurisdiction: 'wales',
    selected_notice_route: 'wales_section_173',

    // Party info
    landlord_full_name: 'John Smith',
    landlord_address: '123 Main St, Cardiff, CF10 1AA',
    landlord_address_line1: '123 Main St',
    landlord_city: 'Cardiff',
    landlord_postcode: 'CF10 1AA',

    tenant_full_name: 'Jane Doe',
    contract_holder_full_name: 'Jane Doe',
    property_address: '456 Rental Ave, Cardiff, CF10 2BB',
    property_address_line1: '456 Rental Ave',
    property_city: 'Cardiff',
    property_postcode: 'CF10 2BB',

    // Tenancy info
    tenancy_start_date: '2023-01-01',
    contract_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',

    // Notice dates
    service_date: '2024-04-01',
    notice_date: '2024-04-01',

    // Wales compliance
    wales_contract_category: 'standard',
    rent_smart_wales_registered: true,
    deposit_protected: true,
  };

  // Base England Section 8 case facts
  const baseEnglandSection8Facts = {
    __meta: {
      case_id: 'test-england-section8',
      jurisdiction: 'england',
    },
    jurisdiction: 'england',
    selected_notice_route: 'section_8',

    // Party info
    landlord_full_name: 'John Smith',
    landlord_address: '123 Main St, London, E1 1AA',
    landlord_address_line1: '123 Main St',
    landlord_city: 'London',
    landlord_postcode: 'E1 1AA',
    landlord_email: 'john@example.com',
    landlord_phone: '07000000000',

    tenant_full_name: 'Jane Doe',
    property_address: '456 Rental Ave, London, E1 2BB',
    property_address_line1: '456 Rental Ave',
    property_city: 'London',
    property_postcode: 'E1 2BB',

    // Tenancy info
    tenancy_start_date: '2023-01-01',
    rent_amount: 1000,
    rent_frequency: 'monthly',

    // England grounds
    section8_grounds: ['Ground 8'],

    // Arrears
    arrears_items: [
      { period_start: '2024-01-01', amount_due: 1000, amount_paid: 0 },
      { period_start: '2024-02-01', amount_due: 1000, amount_paid: 0 },
      { period_start: '2024-03-01', amount_due: 1000, amount_paid: 0 },
    ],
    total_arrears: 3000,
    arrears_total: 3000,

    // Notice dates
    service_date: '2024-04-01',
  };

  describe('Wales fault_based route', () => {
    it('should produce document_type=fault_based_notice, NOT section8_notice', async () => {
      const wizardFacts = { ...baseWalesFaultFacts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      // Find the notice document
      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc).toBeDefined();

      // CRITICAL: Must be fault_based_notice, NOT section8_notice
      expect(noticeDoc?.document_type).toBe('fault_based_notice');
      expect(noticeDoc?.document_type).not.toBe('section8_notice');

      // Verify title indicates Wales form
      expect(noticeDoc?.title).toContain('RHW23');
    });

    it('should NOT throw "At least one ground is required"', async () => {
      const wizardFacts = {
        ...baseWalesFaultFacts,
        ground_codes: undefined, // Force derivation
      };

      // This was the exact error before the fix
      await expect(generateNoticeOnlyPack(wizardFacts)).resolves.not.toThrow();
    });

    it('should produce Wales-specific supporting documents', async () => {
      const wizardFacts = { ...baseWalesFaultFacts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      // Check for service instructions
      const serviceDoc = pack.documents.find((d) => d.document_type === 'service_instructions');
      expect(serviceDoc).toBeDefined();
      expect(serviceDoc?.title).toContain('Wales');

      // Check for validity checklist
      const checklistDoc = pack.documents.find((d) => d.document_type === 'validity_checklist');
      expect(checklistDoc).toBeDefined();
      expect(checklistDoc?.title).toContain('Wales');
    });

    it('should work with fault_based route (without wales_ prefix)', async () => {
      const wizardFacts = {
        ...baseWalesFaultFacts,
        selected_notice_route: 'fault_based', // No wales_ prefix
      };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc?.document_type).toBe('fault_based_notice');
    });
  });

  describe('Wales section_173 route', () => {
    it('should produce document_type=section173_notice', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc).toBeDefined();
      expect(noticeDoc?.document_type).toBe('section173_notice');
      expect(noticeDoc?.document_type).not.toBe('section8_notice');
      expect(noticeDoc?.document_type).not.toBe('section21_notice');
    });

    it('should NOT call generateSection8Notice', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      // None of the documents should have section8 in document_type
      const section8Docs = pack.documents.filter(
        (d) => d.document_type.includes('section8')
      );
      expect(section8Docs).toHaveLength(0);
    });

    it('should work with section_173 route (without wales_ prefix)', async () => {
      const wizardFacts = {
        ...baseWalesSection173Facts,
        selected_notice_route: 'section_173', // No wales_ prefix
      };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc?.document_type).toBe('section173_notice');
    });
  });

  describe('England section_8 route (unchanged)', () => {
    it('should still produce document_type=section8_notice', async () => {
      const wizardFacts = { ...baseEnglandSection8Facts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc).toBeDefined();
      expect(noticeDoc?.document_type).toBe('section8_notice');
    });

    it('should use England templates', async () => {
      const wizardFacts = { ...baseEnglandSection8Facts };

      const pack = await generateNoticeOnlyPack(wizardFacts);

      // Service instructions should be England-specific
      const serviceDoc = pack.documents.find((d) => d.document_type === 'service_instructions');
      expect(serviceDoc).toBeDefined();
      expect(serviceDoc?.file_name).toContain('s8');
    });
  });

  describe('Wales with invalid route (section_8)', () => {
    it('should throw clear error for Wales with section_8 route', async () => {
      const wizardFacts = {
        ...baseWalesFaultFacts,
        selected_notice_route: 'section_8', // Invalid for Wales
        wales_fault_grounds: undefined, // No Wales grounds
      };

      await expect(generateNoticeOnlyPack(wizardFacts)).rejects.toThrow(
        /Section 8 notices do not exist in Wales/
      );
    });
  });

  describe('Document type debug logging', () => {
    it('should log document type selection for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const wizardFacts = { ...baseWalesFaultFacts };

      await generateNoticeOnlyPack(wizardFacts);

      // Verify debug logging occurred
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[generateNoticeOnlyPack] Document type selection:'),
        expect.objectContaining({
          jurisdiction: 'wales',
        })
      );

      consoleSpy.mockRestore();
    });
  });
});

describe('Manual verification: caseId 3b9ca0d1-044a-4bf1-8e81-c2776585b205', () => {
  /**
   * This test documents verification steps for the failing case.
   * After the fix, running fulfillment on this case should:
   * 1. Log document type selection showing Wales route
   * 2. Generate fault_based_notice, NOT section8_notice
   * 3. Dashboard should show documents instead of the error
   */

  it('should provide verification info for the failing case', () => {
    console.log(`
    =========================================================================
    MANUAL VERIFICATION STEPS for caseId: 3b9ca0d1-044a-4bf1-8e81-c2776585b205
    =========================================================================

    BEFORE FIX:
    - Error: "At least one ground is required"
    - Cause: generateSection8Notice was called with empty grounds[]
    - Wales ground_codes ['section_157'] were not recognized as Section 8 grounds

    AFTER FIX:
    - Wales notice_only with fault_based route uses RHW23 Handlebars template
    - Wales notice_only with section_173 route uses generateWalesSection173Notice
    - generateSection8Notice is NEVER called for Wales

    VERIFICATION STEPS:

    1. Check the case in the database:
       SELECT collected_facts->'selected_notice_route' as route,
              collected_facts->'wales_fault_grounds' as grounds,
              collected_facts->'jurisdiction' as jurisdiction
       FROM cases WHERE id = '3b9ca0d1-044a-4bf1-8e81-c2776585b205';

    2. Trigger regeneration:
       POST /api/orders/regenerate
       Body: { "caseId": "3b9ca0d1-044a-4bf1-8e81-c2776585b205" }

    3. Check logs for:
       [generateNoticeOnlyPack] Document type selection: {
         jurisdiction: 'wales',
         normalized_route: 'fault_based',
         ...
       }
       [generateNoticeOnlyPack] Generating Wales notice documents: {
         route: 'fault_based',
         document_type: 'fault_based_notice'
       }

    4. Verify generated documents:
       SELECT document_type, document_title FROM documents
       WHERE case_id = '3b9ca0d1-044a-4bf1-8e81-c2776585b205'
       AND is_preview = false;

       Expected document_types:
       - fault_based_notice (NOT section8_notice)
       - service_instructions
       - validity_checklist
       - compliance_declaration

    5. Dashboard should show "Your documents are ready"
    =========================================================================
    `);

    expect(true).toBe(true);
  });
});
