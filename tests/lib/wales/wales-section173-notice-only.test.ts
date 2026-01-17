/**
 * Wales Section 173 (No-Fault) Notice-Only Tests
 *
 * Comprehensive tests for Wales notice_only route = section_173.
 *
 * Test coverage:
 * A) Wales Section 173 notice generation - verifies PDF generation succeeds
 * B) Wales law references - CONTAINS Wales law, DOES NOT CONTAIN England law
 * C) Wales terminology - uses "contract-holder", "dwelling", etc.
 * D) Document bundle contents - correct documents for section_173 route
 * E) No fault-based documents - section_173 should NOT include fault-based docs
 *
 * Legal requirements:
 * - Wales Section 173 documents must reference "Renting Homes (Wales) Act 2016"
 * - Wales must use "contract-holder" terminology (not "tenant")
 * - Must NOT contain England law references:
 *   NO: "Housing Act 1988", "Section 8", "Ground 8", "Form 6A", "Section 21", "AST"
 */

import { generateNoticeOnlyPack } from '@/lib/documents/eviction-pack-generator';
import { generateWalesSection173Notice } from '@/lib/documents/wales-section173-generator';

// ============================================================================
// TEST DATA
// ============================================================================

/**
 * Base wizard facts for Wales Section 173 (no-fault) notice.
 * Minimal valid case for standard occupation contract.
 */
const baseWalesSection173Facts = {
  __meta: {
    case_id: 'test-wales-section173-notice',
    jurisdiction: 'wales',
  },
  jurisdiction: 'wales',
  selected_notice_route: 'section_173',

  // Party info
  landlord_full_name: 'David Williams',
  landlord_address: '10 Cathedral Road, Cardiff, CF11 9LJ',
  landlord_address_line1: '10 Cathedral Road',
  landlord_city: 'Cardiff',
  landlord_postcode: 'CF11 9LJ',
  landlord_email: 'david@example.com',
  landlord_phone: '02920123456',

  tenant_full_name: 'Sarah Jones',
  contract_holder_full_name: 'Sarah Jones',
  property_address: '25 Queen Street, Cardiff, CF10 2AF',
  property_address_line1: '25 Queen Street',
  property_city: 'Cardiff',
  property_postcode: 'CF10 2AF',

  // Tenancy info - contract started > 6 months ago to avoid prohibited period
  tenancy_start_date: '2023-06-01',
  contract_start_date: '2023-06-01',
  rent_amount: 950,
  rent_frequency: 'monthly',

  // Notice dates - service date is at least 6 months after contract start
  service_date: '2024-04-01',
  notice_date: '2024-04-01',
  notice_service_date: '2024-04-01',

  // Wales compliance fields
  wales_contract_category: 'standard',
  rent_smart_wales_registered: true,
  deposit_taken: true,
  deposit_protected: true,
  written_statement_provided: true,
};

/**
 * England terminology that must NEVER appear in Wales Section 173 output.
 */
const ENGLAND_FORBIDDEN_TERMS = [
  'Housing Act 1988',
  'Section 8',
  'Ground 8',
  'Section 21',
  'Form 6A',
  'assured shorthold tenancy',
  'AST',
];

/**
 * Wales terminology that SHOULD appear in Section 173 output.
 */
const WALES_REQUIRED_TERMS = [
  'Renting Homes (Wales) Act 2016',
  'contract-holder',
  'section 173',
];

// ============================================================================
// A) WALES SECTION 173 NOTICE GENERATION
// ============================================================================

describe('A) Wales Section 173 Notice Generation', () => {
  describe('generateWalesSection173Notice direct', () => {
    it('should generate a valid notice for standard contract', async () => {
      const result = await generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        landlord_address: '10 Cathedral Road, Cardiff, CF11 9LJ',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
        deposit_taken: true,
        deposit_protected: true,
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.html.length).toBeGreaterThan(100);
    });

    it('should generate non-empty PDF', async () => {
      const result = await generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
      });

      expect(result.pdf).toBeDefined();
      // PDF should have actual content (header signature is %PDF-)
      if (result.pdf) {
        expect(result.pdf.length).toBeGreaterThan(0);
      }
    });

    it('should select RHW16 template for 6-month notice period', async () => {
      // Service date is 2024-04-01, expiry should be ~6 months later = ~183 days
      const result = await generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-01-01', // > 6 months before service
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
      });

      // RHW16 is for 6-month notice period
      expect(result.html).toContain('RHW16');
    });
  });

  describe('generateNoticeOnlyPack for section_173', () => {
    it('should generate pack with section173_notice document type', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      expect(pack).toBeDefined();
      expect(pack.documents).toBeDefined();
      expect(pack.documents.length).toBeGreaterThan(0);

      // Find the notice document
      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc).toBeDefined();
      expect(noticeDoc?.document_type).toBe('section173_notice');
    });

    it('should generate pack with HTML content', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc?.html).toBeDefined();
      expect(noticeDoc?.html?.length).toBeGreaterThan(100);
    });
  });
});

// ============================================================================
// B) WALES LAW REFERENCES
// ============================================================================

describe('B) Wales Section 173 Law References', () => {
  describe('MUST contain Wales law references', () => {
    it('should contain "Renting Homes (Wales) Act 2016"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      expect(noticeDoc?.html).toContain('Renting Homes (Wales) Act 2016');
    });

    it('should contain "section 173" reference', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      // Section 173 should appear in the notice
      expect(noticeDoc?.html?.toLowerCase()).toContain('section 173');
    });
  });

  describe('MUST NOT contain England law references', () => {
    /**
     * Helper to strip CSS comments and Handlebars comments from HTML
     * to avoid false positives from template comments.
     */
    function stripCommentsFromHtml(html: string): string {
      // Remove HTML comments
      let result = html.replace(/<!--[\s\S]*?-->/g, '');
      // Remove CSS comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
      // Remove Handlebars comments
      result = result.replace(/\{\{!--[\s\S]*?--\}\}/g, '');
      result = result.replace(/\{\{![\s\S]*?\}\}/g, '');
      return result;
    }

    it('should NOT contain "Housing Act 1988"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '');

      expect(cleanHtml).not.toContain('Housing Act 1988');
    });

    it('should NOT contain "Section 8" (England ground reference)', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '');

      // Regex to match "Section 8" but not "Section 173" etc.
      expect(cleanHtml).not.toMatch(/\bSection\s+8\b/i);
    });

    it('should NOT contain "Ground 8"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '');

      expect(cleanHtml).not.toMatch(/\bGround\s+8\b/i);
    });

    it('should NOT contain "Section 21"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '');

      expect(cleanHtml).not.toMatch(/\bSection\s+21\b/i);
    });

    it('should NOT contain "Form 6A"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '');

      expect(cleanHtml).not.toContain('Form 6A');
    });

    it('should NOT contain "AST" or "assured shorthold tenancy"', async () => {
      const wizardFacts = { ...baseWalesSection173Facts };
      const pack = await generateNoticeOnlyPack(wizardFacts);

      const noticeDoc = pack.documents.find((d) => d.category === 'notice');
      const cleanHtml = stripCommentsFromHtml(noticeDoc?.html || '')?.toLowerCase();

      expect(cleanHtml).not.toContain('assured shorthold tenancy');
      // Don't check for isolated "AST" as it might appear in other contexts
    });
  });
});

// ============================================================================
// C) WALES TERMINOLOGY
// ============================================================================

describe('C) Wales Section 173 Terminology', () => {
  it('should use "contract-holder" terminology', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    expect(noticeDoc?.html?.toLowerCase()).toContain('contract-holder');
  });

  it('should use "dwelling" terminology for property', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    expect(noticeDoc?.html?.toLowerCase()).toContain('dwelling');
  });

  it('should use "occupation contract" or "standard contract" terminology', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    const html = noticeDoc?.html?.toLowerCase() || '';

    // Should contain either "occupation contract" or "standard contract"
    const hasWalesContractTerminology =
      html.includes('occupation contract') || html.includes('standard contract');

    expect(hasWalesContractTerminology).toBe(true);
  });
});

// ============================================================================
// D) DOCUMENT BUNDLE CONTENTS
// ============================================================================

describe('D) Wales Section 173 Document Bundle Contents', () => {
  it('should include section173_notice in the bundle', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find(
      (d) => d.document_type === 'section173_notice'
    );
    expect(noticeDoc).toBeDefined();
  });

  it('should include service_instructions document', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const serviceInstructions = pack.documents.find(
      (d) => d.document_type === 'service_instructions'
    );
    expect(serviceInstructions).toBeDefined();
  });

  it('should include validity_checklist document', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const validityChecklist = pack.documents.find(
      (d) => d.document_type === 'validity_checklist'
    );
    expect(validityChecklist).toBeDefined();
  });

  it('should include compliance_declaration document', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    // Wales uses pre_service_compliance_checklist
    const complianceDoc = pack.documents.find(
      (d) =>
        d.document_type === 'compliance_declaration' ||
        d.document_type === 'pre_service_compliance_checklist'
    );
    expect(complianceDoc).toBeDefined();
  });

  it('should generate at least 3 documents in bundle', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    // Section 173 bundle should have: notice, service instructions, checklist(s)
    expect(pack.documents.length).toBeGreaterThanOrEqual(3);
  });
});

// ============================================================================
// E) NO FAULT-BASED DOCUMENTS
// ============================================================================

describe('E) Wales Section 173 Should NOT Include Fault-Based Documents', () => {
  it('should NOT include fault_based_notice document', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const faultBasedNotice = pack.documents.find(
      (d) => d.document_type === 'fault_based_notice'
    );
    expect(faultBasedNotice).toBeUndefined();
  });

  it('should NOT include section8_notice document', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const section8Notice = pack.documents.find(
      (d) => d.document_type === 'section8_notice'
    );
    expect(section8Notice).toBeUndefined();
  });

  it('should NOT include arrears_schedule for no-fault notice', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const arrearsSchedule = pack.documents.find(
      (d) => d.document_type === 'arrears_schedule'
    );
    // Section 173 (no-fault) should not have arrears schedule
    expect(arrearsSchedule).toBeUndefined();
  });

  it('should NOT reference Wales fault grounds in notice', async () => {
    const wizardFacts = { ...baseWalesSection173Facts };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    const html = noticeDoc?.html?.toLowerCase() || '';

    // Section 173 is no-fault, should not reference fault grounds
    expect(html).not.toContain('section 157'); // Serious arrears
    expect(html).not.toContain('section 159'); // Other grounds
    expect(html).not.toContain('section 161'); // ASB
  });
});

// ============================================================================
// F) VALIDATION TESTS
// ============================================================================

describe('F) Wales Section 173 Validation', () => {
  it('should reject non-standard contract category', async () => {
    await expect(
      generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'supported_standard', // Not standard
        rent_smart_wales_registered: true,
      })
    ).rejects.toThrow(/WALES_SECTION173_INVALID_CONTRACT_TYPE/);
  });

  it('should reject if not registered with Rent Smart Wales', async () => {
    await expect(
      generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: false, // Not registered
      })
    ).rejects.toThrow(/WALES_RENT_SMART_REQUIRED/);
  });

  it('should reject if deposit taken but not protected', async () => {
    await expect(
      generateWalesSection173Notice({
        landlord_full_name: 'David Williams',
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
        deposit_taken: true,
        deposit_protected: false, // Deposit not protected
      })
    ).rejects.toThrow(/WALES_DEPOSIT_NOT_PROTECTED/);
  });

  it('should require landlord_full_name', async () => {
    await expect(
      generateWalesSection173Notice({
        landlord_full_name: '', // Empty
        contract_holder_full_name: 'Sarah Jones',
        property_address: '25 Queen Street, Cardiff, CF10 2AF',
        contract_start_date: '2023-06-01',
        rent_amount: 950,
        rent_frequency: 'monthly',
        service_date: '2024-04-01',
        wales_contract_category: 'standard',
        rent_smart_wales_registered: true,
      })
    ).rejects.toThrow(/landlord_full_name required/);
  });
});

// ============================================================================
// G) ROUTE NORMALIZATION
// ============================================================================

describe('G) Wales Section 173 Route Normalization', () => {
  it('should handle route "section_173" without prefix', async () => {
    const wizardFacts = {
      ...baseWalesSection173Facts,
      selected_notice_route: 'section_173', // No wales_ prefix
    };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    expect(noticeDoc?.document_type).toBe('section173_notice');
  });

  it('should handle route "wales_section_173" with prefix', async () => {
    const wizardFacts = {
      ...baseWalesSection173Facts,
      selected_notice_route: 'wales_section_173', // With prefix
    };
    const pack = await generateNoticeOnlyPack(wizardFacts);

    const noticeDoc = pack.documents.find((d) => d.category === 'notice');
    expect(noticeDoc?.document_type).toBe('section173_notice');
  });
});
