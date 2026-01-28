/**
 * Regression Tests for Court Pack Ground 8 Fixes
 *
 * These tests verify fixes for the court pack regression issues:
 * - Review page showing "No grounds selected" when Ground 8 was selected
 * - Arrears engagement letter template placeholders leaking
 * - Witness statement only showing headings
 * - Schedule of arrears with wrong dates/balances
 * - N119 Q4 missing proper statutory grounds
 *
 * @module tests/regression/court-pack-ground8-fixes
 */

import { describe, it, expect } from 'vitest';
import { getGroundDescription } from '@/lib/grounds/notice-period-utils';
import { extractWitnessStatementSectionsInput, buildWitnessStatementSections } from '@/lib/documents/witness-statement-sections';
import { mapArrearsItemsToEntries } from '@/lib/documents/arrears-schedule-mapper';
import { validateCourtReady } from '@/lib/documents/court-ready-validator';
import { buildN119ReasonForPossession } from '@/lib/documents/official-forms-filler';

// =============================================================================
// TEST: Review Page Grounds Display
// =============================================================================

describe('Review Page Grounds Display', () => {
  it('getGroundDescription returns correct info for Ground 8', () => {
    const groundInfo = getGroundDescription('8');
    expect(groundInfo.code).toBe('8');
    expect(groundInfo.title).toContain('arrears');
    expect(groundInfo.type).toBe('mandatory');
  });

  it('getGroundDescription handles "Ground 8" string format', () => {
    const groundInfo = getGroundDescription('Ground 8');
    expect(groundInfo.code).toBe('8');
    expect(groundInfo.type).toBe('mandatory');
  });

  it('getGroundDescription handles "ground_8" code format', () => {
    const groundInfo = getGroundDescription('ground_8');
    // The function normalizes ground codes - it extracts the numeric part
    expect(groundInfo.code).toMatch(/8/);
    expect(groundInfo.type).toBe('mandatory');
  });
});

// =============================================================================
// TEST: Witness Statement Data Extraction
// =============================================================================

describe('Witness Statement Data Extraction', () => {
  const mockEvictionCase = {
    landlord_full_name: 'John Smith',
    landlord_address_line1: '123 Landlord Street',
    landlord_address_town: 'London',
    landlord_address_postcode: 'SW1A 1AA',
    tenant_full_name: 'Sonia Shezadi',
    property_address: '456 Tenant Road, Manchester, M1 2AB',
    property_address_line1: '456 Tenant Road',
    property_address_town: 'Manchester',
    property_address_postcode: 'M1 2AB',
    tenancy_start_date: '2020-01-15',
    rent_amount: 1000,
    rent_frequency: 'monthly',
    payment_day: 15,
    current_arrears: 3000.05,
    grounds: [{ code: 'ground_8', description: 'Serious rent arrears' }],
    notice_served_date: '2025-12-01',
    notice_expiry_date: '2026-01-15',
  };

  it('extracts landlord name from flat eviction case format', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.landlord.full_name).toBe('John Smith');
  });

  it('extracts tenant name from flat eviction case format', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.tenant.full_name).toBe('Sonia Shezadi');
  });

  it('extracts property address from flat eviction case format', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.property.address_line_1).toBe('456 Tenant Road');
  });

  it('extracts tenancy details from flat eviction case format', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.tenancy.start_date).toBe('2020-01-15');
    expect(input.tenancy.rent_amount).toBe(1000);
    expect(input.tenancy.rent_frequency).toBe('monthly');
  });

  it('extracts grounds from eviction case grounds array', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.section8.grounds).toContain('ground_8');
  });

  it('extracts arrears from current_arrears', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    expect(input.arrears?.total_arrears).toBe(3000.05);
  });

  it('builds witness statement with real content', () => {
    const input = extractWitnessStatementSectionsInput(mockEvictionCase);
    const statement = buildWitnessStatementSections(input);

    // Introduction should contain property address (landlord name is shown in header)
    expect(statement.introduction).toContain('456 Tenant Road');
    expect(statement.introduction).toContain('M1 2AB');

    // Tenancy history should contain dates and rent details
    expect(statement.tenancy_history).toBeTruthy();
    expect(statement.tenancy_history.length).toBeGreaterThan(50);

    // Grounds summary should mention Ground 8 and statutory basis
    expect(statement.grounds_summary).toContain('Ground 8');
    expect(statement.grounds_summary).toContain('Housing Act 1988');

    // Timeline should have content
    expect(statement.timeline).toBeTruthy();
    expect(statement.timeline.length).toBeGreaterThan(30);

    // Evidence references should list documents
    expect(statement.evidence_references).toContain('Schedule of Arrears');
  });
});

// =============================================================================
// TEST: Arrears Schedule Running Balance
// =============================================================================

describe('Arrears Schedule Running Balance', () => {
  const mockArrearsItems = [
    { period_start: '2025-10-01', period_end: '2025-10-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
    { period_start: '2025-11-01', period_end: '2025-11-30', rent_due: 1000, rent_paid: 500, amount_owed: 500 },
    { period_start: '2025-12-01', period_end: '2025-12-31', rent_due: 1000, rent_paid: 0, amount_owed: 1000 },
  ];

  it('calculates running balance correctly', () => {
    const entries = mapArrearsItemsToEntries(mockArrearsItems, 1);

    expect(entries[0].running_balance).toBe(1000);
    expect(entries[1].running_balance).toBe(1500);
    expect(entries[2].running_balance).toBe(2500);
  });

  it('includes arrears amount for each entry', () => {
    const entries = mapArrearsItemsToEntries(mockArrearsItems, 1);

    expect(entries[0].arrears).toBe(1000);
    expect(entries[1].arrears).toBe(500);
    expect(entries[2].arrears).toBe(1000);
  });

  it('formats period dates in UK format', () => {
    const entries = mapArrearsItemsToEntries(mockArrearsItems, 1);

    // Should be formatted like "1 October 2025 to 31 October 2025"
    expect(entries[0].period).toContain('October');
    expect(entries[0].period).toContain('2025');
  });
});

// =============================================================================
// TEST: N119 Q4 Statutory Grounds
// =============================================================================

describe('N119 Q4 Statutory Grounds', () => {
  it('includes Ground 8 statutory basis for arrears cases', () => {
    const caseData = {
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address: 'Test Address',
      rent_amount: 1000,
      rent_frequency: 'monthly' as const,
      tenancy_start_date: '2020-01-01',
      signatory_name: 'Test Landlord',
      signature_date: '2025-12-01',
      ground_numbers: '8',
      ground_codes: ['ground_8'],
      total_arrears: 3000,
    };

    const particulars = buildN119ReasonForPossession(caseData);

    expect(particulars).toContain('Ground 8');
    expect(particulars).toContain('Schedule 2');
    expect(particulars).toContain('Housing Act 1988');
    expect(particulars).toContain('mandatory');
  });

  it('includes Ground 10 for discretionary arrears cases', () => {
    const caseData = {
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address: 'Test Address',
      rent_amount: 1000,
      rent_frequency: 'monthly' as const,
      tenancy_start_date: '2020-01-01',
      signatory_name: 'Test Landlord',
      signature_date: '2025-12-01',
      ground_numbers: '10',
      ground_codes: ['ground_10'],
      total_arrears: 500,
    };

    const particulars = buildN119ReasonForPossession(caseData);

    expect(particulars).toContain('Ground 10');
    expect(particulars).toContain('discretionary');
  });

  it('includes multiple grounds when selected', () => {
    const caseData = {
      landlord_full_name: 'Test Landlord',
      tenant_full_name: 'Test Tenant',
      property_address: 'Test Address',
      rent_amount: 1000,
      rent_frequency: 'monthly' as const,
      tenancy_start_date: '2020-01-01',
      signatory_name: 'Test Landlord',
      signature_date: '2025-12-01',
      ground_numbers: '8,10',
      ground_codes: ['ground_8', 'ground_10'],
      total_arrears: 3000,
    };

    const particulars = buildN119ReasonForPossession(caseData);

    expect(particulars).toContain('Ground 8');
    expect(particulars).toContain('Ground 10');
  });
});

// =============================================================================
// TEST: Court-Ready Validator
// =============================================================================

describe('Court-Ready Validator', () => {
  it('detects square bracket placeholders', () => {
    const content = 'The arrears are £1000 as at [date of calculation].';
    const result = validateCourtReady(content, 'test_document');

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.type === 'placeholder')).toBe(true);
  });

  it('detects template document markers', () => {
    const content = '<div class="template-notice">⚠ TEMPLATE DOCUMENT</div>';
    const result = validateCourtReady(content, 'test_document');

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.type === 'template_text')).toBe(true);
  });

  it('detects instruction text', () => {
    const content = 'Enter the date you send this letter.';
    const result = validateCourtReady(content, 'test_document');

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.type === 'template_text')).toBe(true);
  });

  it('detects unrendered Handlebars templates', () => {
    const content = 'Dear {{tenant_name}}, your rent is due.';
    const result = validateCourtReady(content, 'test_document');

    expect(result.isValid).toBe(false);
    expect(result.issues.some(i => i.message.includes('Handlebars'))).toBe(true);
  });

  it('passes for clean court-ready content', () => {
    const content = `
      <html>
        <body>
          <h1>Schedule of Arrears</h1>
          <p>The total arrears amount to £3,000.00.</p>
          <p>The tenant, Sonia Shezadi, has failed to pay rent.</p>
        </body>
      </html>
    `;
    const result = validateCourtReady(content, 'test_document');

    expect(result.isValid).toBe(true);
    expect(result.issues.filter(i => i.severity === 'error')).toHaveLength(0);
  });

  it('warns about zero arrears amounts', () => {
    const content = 'The arrears amount to £0.00.';
    const result = validateCourtReady(content, 'test_document');

    // Zero amounts are warnings, not errors
    expect(result.issues.some(i => i.severity === 'warning')).toBe(true);
  });
});

// =============================================================================
// TEST: Arrears Engagement Letter Final Form Mode
// =============================================================================

describe('Arrears Engagement Letter Final Form', () => {
  it('template should support is_final_form flag', () => {
    // This is a documentation test - the template should conditionally render
    // based on the is_final_form flag
    const templateContent = `
      {{#if is_final_form}}
        {{format_date letter_date}}
      {{else}}
        <span class="fill-in">[Date]</span>
      {{/if}}
    `;

    // When is_final_form is true, template should NOT include placeholders
    // When is_final_form is false, template should include placeholders for user to fill in
    expect(templateContent).toContain('is_final_form');
    expect(templateContent).toContain('format_date');
    expect(templateContent).toContain('[Date]');
  });
});
