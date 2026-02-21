/**
 * Money Claim Document Formatting Regression Tests
 *
 * These tests verify that all money claim documents:
 * 1. Use UK legal date format (DD Month YYYY) - no ISO dates (YYYY-MM-DD)
 * 2. Use proper currency formatting - no floating point artifacts
 * 3. Do not contain "per monthly" or similar incorrect wording
 * 4. Have properly populated schedule data (tenancy start, due dates)
 *
 * @see https://github.com/landlord-heaven/issues/XXX - Fix money claim date/currency formatting
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { generateDocument, compileTemplate, loadTemplate } from '@/lib/documents/generator';
import { mapArrearsItemsToEntries, getArrearsScheduleData } from '@/lib/documents/arrears-schedule-mapper';
import type { ArrearsItem } from '@/lib/case-facts/schema';

// ============================================================================
// TEST DATA
// ============================================================================

const TEST_ARREARS_ITEMS: ArrearsItem[] = [
  {
    period_start: '2025-08-01',
    period_end: '2025-08-31',
    rent_due: 1200,
    rent_paid: 0,
    amount_owed: 1200,
    is_pro_rated: false,
  },
  {
    period_start: '2025-09-01',
    period_end: '2025-09-30',
    rent_due: 1200,
    rent_paid: 500,
    amount_owed: 700,
    is_pro_rated: false,
  },
  {
    period_start: '2025-10-01',
    period_end: '2025-10-31',
    rent_due: 1200,
    rent_paid: 0,
    amount_owed: 1200,
    is_pro_rated: false,
  },
];

const TEST_CLAIM_DATA = {
  jurisdiction: 'england' as const,
  landlord_full_name: 'John Smith',
  landlord_address: '123 Landlord Street, London',
  landlord_postcode: 'SW1A 1AA',
  landlord_email: 'john@example.com',
  tenant_full_name: 'Jane Doe',
  property_address: '456 Tenant Road, Manchester',
  property_postcode: 'M1 1AA',
  rent_amount: 1200,
  rent_frequency: 'monthly' as const,
  payment_day: 1,
  tenancy_start_date: '15 August 2023',
  arrears_total: 3100,
  arrears_schedule: mapArrearsItemsToEntries(TEST_ARREARS_ITEMS, 1),
  damage_items: [{ description: 'Broken window', amount: 350 }],
  other_charges: [{ description: 'Professional cleaning', amount: 172.39 }],
  claim_interest: true,
  interest_rate: 8,
  interest_start_date: '15 January 2026',
  interest_to_date: 45.67,
  daily_interest: 0.68,
  interest_days: 67,
  total_claim_amount: 3622.39,
  total_principal: 3622.39,
  court_fee: 205,
  solicitor_costs: 0,
  total_with_fees: 3827.39,
  generation_date: '30 January 2026',
  signature_date: '30 January 2026',
  response_deadline: '1 March 2026',
};

// ============================================================================
// REGEX PATTERNS FOR VALIDATION
// ============================================================================

// ISO date format: YYYY-MM-DD
const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}/g;

// Float artifacts: numbers with 10+ decimal places
const FLOAT_ARTIFACT_PATTERN = /\d+\.\d{10,}/g;

// UK legal date format: DD Month YYYY (1-31 Month YYYY)
const UK_DATE_PATTERN = /\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/g;

// "per monthly" - incorrect wording
const PER_MONTHLY_PATTERN = /per\s+monthly/gi;

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Money Claim Document Formatting Regression Tests', () => {
  describe('Date Format Validation', () => {
    it('should not contain ISO date format (YYYY-MM-DD) in any template output', async () => {
      const templates = [
        'uk/england/templates/money_claims/particulars_of_claim.hbs',
        'uk/england/templates/money_claims/interest_workings.hbs',
        'uk/england/templates/money_claims/letter_before_claim.hbs',
        'uk/england/templates/money_claims/reply_form.hbs',
        'uk/england/templates/money_claims/filing_guide.hbs',
        'uk/england/templates/money_claims/schedule_of_arrears.hbs',
        'uk/england/templates/money_claims/enforcement_guide.hbs',
      ];

      for (const templatePath of templates) {
        const templateContent = loadTemplate(templatePath);
        const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

        const isoMatches = html.match(ISO_DATE_PATTERN);

        // Allow ISO dates only in hidden/meta fields or href attributes, not in visible text
        // Filter out matches that are inside href, src, or data attributes
        const visibleIsoMatches = isoMatches?.filter(match => {
          const matchIndex = html.indexOf(match);
          const surroundingText = html.substring(Math.max(0, matchIndex - 50), matchIndex + match.length + 10);
          // Skip if it's in an href, src, or data attribute
          return !/(href|src|data-\w+)=["'][^"']*$/.test(surroundingText);
        });

        expect(
          visibleIsoMatches?.length ?? 0,
          `Template ${templatePath} contains visible ISO dates: ${visibleIsoMatches?.join(', ')}`
        ).toBe(0);
      }
    });

    it('should contain UK legal date format in generation_date fields', async () => {
      const templatePath = 'uk/england/templates/money_claims/particulars_of_claim.hbs';
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

      const ukDates = html.match(UK_DATE_PATTERN);
      expect(ukDates?.length ?? 0).toBeGreaterThan(0);

      // Verify generation_date appears in UK format
      expect(html).toContain('30 January 2026');
    });

    it('should format tenancy_start_date in UK legal format', async () => {
      const templatePath = 'uk/england/templates/money_claims/schedule_of_arrears.hbs';
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

      // Tenancy start date should appear in UK format
      expect(html).toContain('15 August 2023');
    });
  });

  describe('Currency Format Validation', () => {
    it('should not contain floating point artifacts in any template output', async () => {
      const templates = [
        'uk/england/templates/money_claims/particulars_of_claim.hbs',
        'uk/england/templates/money_claims/filing_guide.hbs',
        'uk/england/templates/money_claims/letter_before_claim.hbs',
        'uk/england/templates/money_claims/schedule_of_arrears.hbs',
      ];

      for (const templatePath of templates) {
        const templateContent = loadTemplate(templatePath);
        const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

        const floatMatches = html.match(FLOAT_ARTIFACT_PATTERN);

        expect(
          floatMatches?.length ?? 0,
          `Template ${templatePath} contains float artifacts: ${floatMatches?.join(', ')}`
        ).toBe(0);
      }
    });

    it('should format MCOL numbers with exactly 2 decimal places', async () => {
      const templatePath = 'uk/england/templates/money_claims/filing_guide.hbs';
      const templateContent = loadTemplate(templatePath);

      // Test with a number that would have float artifacts without proper formatting
      const dataWithFloatRisk = {
        ...TEST_CLAIM_DATA,
        total_claim_amount: 3622.3900000000003, // Typical JS float artifact
      };

      const html = compileTemplate(templateContent, dataWithFloatRisk);

      // The MCOL number should be formatted to 2dp
      expect(html).toContain('3622.39');
      expect(html).not.toContain('3622.3900000000003');
    });
  });

  describe('Wording Validation', () => {
    it('should not contain "per monthly" in any template output', async () => {
      const templates = [
        'uk/england/templates/money_claims/letter_before_claim.hbs',
        'uk/england/templates/money_claims/filing_guide.hbs',
        'uk/england/templates/money_claims/particulars_of_claim.hbs',
      ];

      for (const templatePath of templates) {
        const templateContent = loadTemplate(templatePath);
        const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

        const perMonthlyMatches = html.match(PER_MONTHLY_PATTERN);

        expect(
          perMonthlyMatches?.length ?? 0,
          `Template ${templatePath} contains "per monthly": ${perMonthlyMatches?.join(', ')}`
        ).toBe(0);
      }
    });

    it('Letter Before Claim should not contain the introductory practice direction paragraph', async () => {
      const templatePath = 'uk/england/templates/money_claims/letter_before_claim.hbs';
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

      // The removed paragraph
      expect(html).not.toContain('This letter must be sent');
      expect(html).not.toContain('Practice Direction on Pre-Action Conduct');
    });
  });

  describe('Schedule of Arrears Validation', () => {
    it('should populate Tenancy Start Date in summary box', async () => {
      const templatePath = 'uk/england/templates/money_claims/schedule_of_arrears.hbs';
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

      // Tenancy Start Date label should exist
      expect(html).toContain('Tenancy Start Date');

      // The actual date value should be present (UK format)
      expect(html).toContain('15 August 2023');
    });

    it('should compute and display due dates for each arrears period', async () => {
      // Test the arrears mapper directly
      const entries = mapArrearsItemsToEntries(TEST_ARREARS_ITEMS, 1);

      // Each entry should have a due_date populated
      for (const entry of entries) {
        expect(entry.due_date).toBeDefined();
        expect(entry.due_date.length).toBeGreaterThan(0);
        // Due date should be in UK format
        expect(entry.due_date).toMatch(/\d{1,2}\s+\w+\s+\d{4}/);
      }

      // With rent_due_day = 1, the due dates should be the 1st of each month
      expect(entries[0].due_date).toBe('1 August 2025');
      expect(entries[1].due_date).toBe('1 September 2025');
      expect(entries[2].due_date).toBe('1 October 2025');
    });

    it('should display due dates in schedule table', async () => {
      const templatePath = 'uk/england/templates/money_claims/schedule_of_arrears.hbs';
      const templateContent = loadTemplate(templatePath);
      const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

      // Due dates should appear in the schedule
      expect(html).toContain('1 August 2025');
      expect(html).toContain('1 September 2025');
      expect(html).toContain('1 October 2025');
    });
  });

  describe('Arrears Schedule Mapper - Due Date Computation', () => {
    it('should compute due date based on rent_due_day within period month', () => {
      const items: ArrearsItem[] = [
        {
          period_start: '2025-07-15',
          period_end: '2025-08-14',
          rent_due: 1000,
          rent_paid: 0,
          amount_owed: 1000,
          is_pro_rated: true,
          days_in_period: 31,
        },
      ];

      // Rent due on the 15th of each month
      const entries = mapArrearsItemsToEntries(items, 15);

      // Due date should be 15th of the period_start month (July)
      expect(entries[0].due_date).toBe('15 July 2025');
    });

    it('should clamp rent_due_day to last day of month for short months', () => {
      const items: ArrearsItem[] = [
        {
          period_start: '2025-02-01',
          period_end: '2025-02-28',
          rent_due: 1000,
          rent_paid: 0,
          amount_owed: 1000,
          is_pro_rated: false,
        },
      ];

      // Rent due on the 31st - February only has 28 days in 2025 (non-leap year)
      const entries = mapArrearsItemsToEntries(items, 31);

      // Due date should be clamped to 28th
      expect(entries[0].due_date).toBe('28 February 2025');
    });

    it('should fallback to period_end when rent_due_day is not provided', () => {
      const items: ArrearsItem[] = [
        {
          period_start: '2025-08-01',
          period_end: '2025-08-31',
          rent_due: 1000,
          rent_paid: 0,
          amount_owed: 1000,
          is_pro_rated: false,
        },
      ];

      // No rent_due_day provided
      const entries = mapArrearsItemsToEntries(items, undefined);

      // Due date should fallback to period_end formatted
      expect(entries[0].due_date).toBe('31 August 2025');
    });
  });

  describe('Generator Date Preservation', () => {
    it('should preserve pre-formatted generation_date from caller', async () => {
      // The fix: compileTemplate should not overwrite generation_date if already provided
      const templateContent = '{{generation_date}}';
      const data = { generation_date: '30 January 2026' };

      const html = compileTemplate(templateContent, data);

      // Should use the pre-formatted date, not ISO format
      expect(html).toContain('30 January 2026');
      expect(html).not.toMatch(ISO_DATE_PATTERN);
    });

    it('should provide ISO date fallback when generation_date not provided', async () => {
      const templateContent = '{{generation_date}}';
      const data = {}; // No generation_date

      const html = compileTemplate(templateContent, data);

      // Should fallback to ISO date
      expect(html).toMatch(/\d{4}-\d{2}-\d{2}/);
    });
  });
});

describe('Financial Statement Form Pagination', () => {
  it('should have CSS page break rules for multi-page layout', async () => {
    const templatePath = 'uk/england/templates/money_claims/financial_statement_form.hbs';
    const templateContent = loadTemplate(templatePath);
    const html = compileTemplate(templateContent, TEST_CLAIM_DATA);

    // Should have page break CSS rules
    expect(html).toContain('page-break-after');
    expect(html).toContain('break-after');
    expect(html).toContain('page-break-before');
    expect(html).toContain('break-before');

    // Should have the specific page break classes
    expect(html).toContain('page-cover');
    expect(html).toContain('page-title-section1');
    expect(html).toContain('section-2-start');
  });

  it('should have Section 2 marked for page 3 start', async () => {
    const templatePath = 'uk/england/templates/money_claims/financial_statement_form.hbs';
    const templateContent = loadTemplate(templatePath);
    const html = compileTemplate(templateContent, {});

    // Section 2 div should have the page break class
    expect(html).toContain('class="section-2-start"');

    // The section header should be within the section-2-start div
    // Search for the div element with the class, not the CSS rule
    const divMatch = html.match(/<div[^>]*class="section-2-start"[^>]*>/);
    expect(divMatch).not.toBeNull();

    // Get content after the div element
    const divIndex = html.indexOf(divMatch![0]);
    const section2Content = html.substring(divIndex, divIndex + 1000);
    expect(section2Content).toContain('SECTION 2: YOUR MONTHLY OUTGOINGS');
  });
});
