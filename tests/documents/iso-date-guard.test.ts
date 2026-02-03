/**
 * ISO Date Guard - CI Validation Test
 *
 * This test ensures that no human-facing documents contain raw ISO dates (YYYY-MM-DD).
 * All dates should be formatted in UK format before template rendering.
 *
 * Background:
 * - ISO dates (2026-02-01) are machine-readable but confusing for UK users
 * - UK format is either "1 February 2026" (long) or "01/02/2026" (short DD/MM/YYYY)
 * - The date-normalizer.ts module handles pre-render date transformation
 *
 * Allowlist:
 * - JSON/YAML machine-readable sections (data attributes, scripts)
 * - Debug metadata (generation_timestamp, etc.)
 * - Comments and source code
 */

import { describe, it, expect } from 'vitest';
import {
  findISODatesInContent,
  sanitizeISODatesInHTML,
  findBlankDateFields,
  validateHtmlForPdfTextLayer,
} from '@/lib/documents/date-normalizer';
import { generateDocument } from '@/lib/documents/generator';

// ISO date pattern for scanning
const ISO_DATE_PATTERN = /\b(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/g;

/**
 * Check if an ISO date match is in an acceptable machine-readable context
 */
function isAllowedContext(html: string, match: string, index: number): boolean {
  // Get surrounding context (200 chars before and after)
  const start = Math.max(0, index - 200);
  const end = Math.min(html.length, index + match.length + 200);
  const context = html.slice(start, end).toLowerCase();

  // Allowed contexts:
  // 1. Inside <script> tags (JSON data)
  if (/<script[^>]*>[\s\S]*$/.test(context.slice(0, 200)) &&
      /[\s\S]*<\/script>/.test(context.slice(-200))) {
    return true;
  }

  // 2. Inside data-* attributes
  if (/data-[a-z-]+=['"][^'"]*$/.test(context.slice(0, 200))) {
    return true;
  }

  // 3. Inside HTML comments
  if (/<!--[\s\S]*$/.test(context.slice(0, 200)) &&
      /[\s\S]*-->/.test(context.slice(-200))) {
    return true;
  }

  // 4. Known machine-readable field names
  const machineFields = [
    'generation_timestamp',
    'created_at',
    'updated_at',
    'timestamp',
    '_iso',
    'iso_date',
  ];
  for (const field of machineFields) {
    if (context.includes(field)) {
      return true;
    }
  }

  return false;
}

/**
 * Scan HTML content for ISO dates that appear in human-readable sections
 */
function findHumanFacingISODates(html: string): { date: string; context: string }[] {
  const results: { date: string; context: string }[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  ISO_DATE_PATTERN.lastIndex = 0;

  while ((match = ISO_DATE_PATTERN.exec(html)) !== null) {
    if (!isAllowedContext(html, match[0], match.index)) {
      // Get human-readable context (50 chars before and after)
      const start = Math.max(0, match.index - 50);
      const end = Math.min(html.length, match.index + match[0].length + 50);
      const context = html.slice(start, end).replace(/\s+/g, ' ').trim();

      results.push({
        date: match[0],
        context: `...${context}...`,
      });
    }
  }

  return results;
}

describe('ISO Date Guard - CI Validation', () => {
  describe('findISODatesInContent utility', () => {
    it('detects ISO dates in plain text', () => {
      const content = 'The notice was served on 2026-02-01 and expires on 2026-04-01.';
      const matches = findISODatesInContent(content);
      expect(matches).toHaveLength(2);
      expect(matches).toContain('2026-02-01');
      expect(matches).toContain('2026-04-01');
    });

    it('returns empty array when no ISO dates present', () => {
      const content = 'The notice was served on 1 February 2026 and expires on 1 April 2026.';
      const matches = findISODatesInContent(content);
      expect(matches).toHaveLength(0);
    });

    it('detects ISO dates in HTML', () => {
      const content = '<p>Start date: 2026-01-15</p><p>End date: 2026-12-31</p>';
      const matches = findISODatesInContent(content);
      expect(matches).toHaveLength(2);
    });
  });

  describe('Human-facing document validation', () => {
    it('validates that date normalizer removes ISO dates from sample data', async () => {
      const testData = {
        landlord_name: 'Test Landlord',
        tenant_name: 'Test Tenant',
        property_address: '123 Test Street',
        tenancy_start_date: '2026-01-15',
        notice_served_date: '2026-02-01',
        notice_expiry_date: '2026-04-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
      };

      // Generate a simple document using a template that displays dates
      const result = await generateDocument({
        templatePath: 'shared/templates/proof_of_service.hbs',
        data: testData,
        isPreview: true,
        outputFormat: 'html',
      });

      if (result.html) {
        const isoMatches = findHumanFacingISODates(result.html);

        if (isoMatches.length > 0) {
          console.error('Found ISO dates in human-facing content:');
          isoMatches.forEach(({ date, context }) => {
            console.error(`  - ${date}: ${context}`);
          });
        }

        expect(isoMatches).toHaveLength(0);
      }
    });

    it('validates arrears schedule uses UK date format', async () => {
      const testData = {
        landlord_name: 'Test Landlord',
        tenant_name: 'Test Tenant',
        property_address: '123 Test Street',
        tenancy_start_date: '2024-01-01',
        rent_amount: 1200,
        rent_frequency: 'monthly',
        arrears_items: [
          {
            period_start: '2026-01-01',
            period_end: '2026-01-31',
            rent_due: 1200,
            rent_paid: 0,
            amount_owed: 1200,
          },
          {
            period_start: '2026-02-01',
            period_end: '2026-02-28',
            rent_due: 1200,
            rent_paid: 600,
            amount_owed: 600,
          },
        ],
        total_arrears: 1800,
      };

      const result = await generateDocument({
        templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
        data: testData,
        isPreview: true,
        outputFormat: 'html',
      });

      if (result.html) {
        const isoMatches = findHumanFacingISODates(result.html);

        if (isoMatches.length > 0) {
          console.error('Found ISO dates in arrears schedule:');
          isoMatches.forEach(({ date, context }) => {
            console.error(`  - ${date}: ${context}`);
          });
        }

        expect(isoMatches).toHaveLength(0);
      }
    });
  });

  describe('UK date format presence', () => {
    it('confirms UK long format dates appear correctly', async () => {
      // Use field names that the proof_of_service template expects
      const testData = {
        landlord_full_name: 'Test Landlord',
        tenant_full_name: 'Test Tenant',
        property_address: '123 Test Street',
        tenancy_start_date: '2026-02-15',
        service_date: '2026-03-01', // Will become service_date_formatted
        earliest_possession_date: '2026-05-01', // Will become earliest_possession_date_formatted
        notice_type: 'Section 8',
      };

      const result = await generateDocument({
        templatePath: 'shared/templates/proof_of_service.hbs',
        data: testData,
        isPreview: true,
        outputFormat: 'html',
      });

      if (result.html) {
        // Should contain UK long format dates
        const ukLongFormat = /\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/;
        expect(result.html).toMatch(ukLongFormat);
      }
    });
  });

  // ===========================================================================
  // ISO DATE SANITIZER TESTS (Feb 2026)
  // Test the sanitizeISODatesInHTML function directly
  // ===========================================================================
  describe('sanitizeISODatesInHTML', () => {
    it('replaces ISO dates with UK format in visible text', () => {
      const html = '<p>Start date: 2026-01-15</p><p>End date: 2026-12-31</p>';
      const { html: result, replacements } = sanitizeISODatesInHTML(html);

      expect(result).toContain('15 January 2026');
      expect(result).toContain('31 December 2026');
      expect(result).not.toContain('2026-01-15');
      expect(result).not.toContain('2026-12-31');
      expect(replacements).toHaveLength(2);
    });

    it('preserves ISO dates in data attributes', () => {
      const html = '<div data-date="2026-01-15">Start date: 2026-01-15</div>';
      const { html: result, replacements } = sanitizeISODatesInHTML(html);

      // Should replace the visible text but preserve data attribute
      expect(result).toContain('data-date="2026-01-15"');
      expect(result).toContain('15 January 2026</div>');
      expect(replacements).toHaveLength(1);
    });

    it('preserves ISO dates in script blocks', () => {
      const html = `<script type="application/json">{"date": "2026-01-15"}</script><p>Date: 2026-01-15</p>`;
      const { html: result, replacements } = sanitizeISODatesInHTML(html);

      expect(result).toContain('"date": "2026-01-15"');
      expect(result).toContain('Date: 15 January 2026');
      expect(replacements).toHaveLength(1);
    });

    it('throws when throwOnFound is true', () => {
      const html = '<p>Date: 2026-01-15</p>';
      expect(() => sanitizeISODatesInHTML(html, { throwOnFound: true })).toThrow(
        /ISO_DATE_LEAK_DETECTED/
      );
    });

    it('returns empty replacements when no ISO dates found', () => {
      const html = '<p>Date: 15 January 2026</p>';
      const { html: result, replacements } = sanitizeISODatesInHTML(html);

      expect(result).toBe(html);
      expect(replacements).toHaveLength(0);
    });
  });

  // ===========================================================================
  // AUDIT TARGET DOCUMENTS (Feb 2026)
  // Test the specific documents mentioned in the audit scope
  // ===========================================================================
  describe('Audit target documents - ISO date free', () => {
    const baseTestData = {
      // Landlord
      landlord_full_name: 'John Smith',
      landlord_address: '1 High Street, London, SW1A 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '07700 900000',

      // Tenant
      tenant_full_name: 'Jane Doe',
      tenant_2_name: 'Jim Doe',
      property_address: '123 Test Street\nTestville\nTS1 2AB',
      property_address_line1: '123 Test Street',
      property_address_town: 'Testville',

      // Tenancy
      tenancy_start_date: '2024-06-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',

      // Notice
      notice_type: 'Section 21',
      notice_service_date: '2026-02-01',
      notice_expiry_date: '2026-04-01',
      service_date: '2026-02-01',
      service_date_formatted: '1 February 2026',
      earliest_possession_date: '2026-04-01',
      display_possession_date_formatted: '1 April 2026',
      tenancy_start_date_formatted: '1 June 2024',
      generated_date: '3 February 2026',
      current_date: '2026-02-03',

      // Compliance
      deposit_protected: true,
      deposit_amount: 2400,
      deposit_scheme_name: 'DPS',
      deposit_protection_date: '2024-06-15',
      prescribed_info_given: true,
      gas_cert_provided: true,
      gas_cert_expiry: '2027-01-01',
      epc_provided: true,
      epc_rating: 'C',
      how_to_rent_given: true,
      selected_notice_route: 'section_21',
      jurisdiction_display: 'England',
    };

    it('validates compliance_checklist.hbs has no ISO dates', async () => {
      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
        data: baseTestData,
        isPreview: true,
        outputFormat: 'html',
      });

      const isoMatches = findHumanFacingISODates(result.html);

      if (isoMatches.length > 0) {
        console.error('Found ISO dates in compliance_checklist.hbs:');
        isoMatches.forEach(({ date, context }) => {
          console.error(`  - ${date}: ${context}`);
        });
      }

      expect(isoMatches).toHaveLength(0);
    });

    it('validates service_instructions.hbs has no ISO dates', async () => {
      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/service_instructions.hbs',
        data: {
          ...baseTestData,
          metadata: { generated_at: '2026-02-03' },
        },
        isPreview: true,
        outputFormat: 'html',
      });

      const isoMatches = findHumanFacingISODates(result.html);

      if (isoMatches.length > 0) {
        console.error('Found ISO dates in service_instructions.hbs:');
        isoMatches.forEach(({ date, context }) => {
          console.error(`  - ${date}: ${context}`);
        });
      }

      expect(isoMatches).toHaveLength(0);
    });

    it('validates checklist_section_21.hbs has no ISO dates', async () => {
      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/checklist_section_21.hbs',
        data: baseTestData,
        isPreview: true,
        outputFormat: 'html',
      });

      const isoMatches = findHumanFacingISODates(result.html);

      if (isoMatches.length > 0) {
        console.error('Found ISO dates in checklist_section_21.hbs:');
        isoMatches.forEach(({ date, context }) => {
          console.error(`  - ${date}: ${context}`);
        });
      }

      expect(isoMatches).toHaveLength(0);
    });

    it('validates schedule_of_arrears.hbs has no ISO dates', async () => {
      const arrearsTestData = {
        ...baseTestData,
        generation_date: '3 February 2026',
        arrears_total: 2400,
        arrears_schedule: [
          {
            period: 'January 2026',
            due_date: '2026-01-01',
            amount_due: 1200,
            amount_paid: 0,
            arrears: 1200,
            running_balance: 1200,
            notes: 'No payment received',
          },
          {
            period: 'February 2026',
            due_date: '2026-02-01',
            amount_due: 1200,
            amount_paid: 0,
            arrears: 1200,
            running_balance: 2400,
            notes: 'No payment received',
          },
        ],
      };

      const result = await generateDocument({
        templatePath: 'uk/england/templates/money_claims/schedule_of_arrears.hbs',
        data: arrearsTestData,
        isPreview: true,
        outputFormat: 'html',
      });

      const isoMatches = findHumanFacingISODates(result.html);

      if (isoMatches.length > 0) {
        console.error('Found ISO dates in schedule_of_arrears.hbs:');
        isoMatches.forEach(({ date, context }) => {
          console.error(`  - ${date}: ${context}`);
        });
      }

      expect(isoMatches).toHaveLength(0);
    });
  });

  // ===========================================================================
  // BLANK DATE FIELD DETECTION TESTS (Feb 2026)
  // Test the findBlankDateFields function for detecting empty date values
  // Only detects STRUCTURED field patterns, not prose text
  // ===========================================================================
  describe('findBlankDateFields', () => {
    it('detects blank Tenancy Start Date in definition list', () => {
      const html = '<dt>Tenancy Start Date:</dt><dd></dd>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toContain('Tenancy Start Date');
    });

    it('detects blank Generated field in definition list', () => {
      const html = '<dt>Generated:</dt><dd>   </dd>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toContain('Generated');
    });

    it('detects blank field with strong label at start of paragraph', () => {
      const html = '<p><strong>Generated:</strong></p>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toContain('Generated');
    });

    it('returns empty array when date fields have values', () => {
      const html = '<dt>Tenancy Start Date:</dt><dd>1 February 2026</dd>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toHaveLength(0);
    });

    it('detects multiple blank date fields', () => {
      const html = `
        <dt>Tenancy Start Date:</dt><dd></dd>
        <dt>Service Date:</dt><dd></dd>
        <dt>Generated:</dt><dd></dd>
      `;
      const blanks = findBlankDateFields(html);
      expect(blanks).toContain('Tenancy Start Date');
      expect(blanks).toContain('Service Date');
      expect(blanks).toContain('Generated');
    });

    it('does not flag non-date labels as blank', () => {
      const html = '<dt>Name:</dt><dd></dd>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toHaveLength(0);
    });

    it('does not flag prose text that mentions date labels', () => {
      // This is prose text, not a structured field
      const html = '<p>After serving, wait until the expiry date:</p>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toHaveLength(0);
    });

    it('does not flag date labels in the middle of a paragraph', () => {
      // "Generated:" in the middle of prose should not be flagged
      const html = '<p>This document was Generated: 3 February 2026 by the system.</p>';
      const blanks = findBlankDateFields(html);
      expect(blanks).toHaveLength(0);
    });
  });

  // ===========================================================================
  // PDF TEXT LAYER VALIDATION TESTS (Feb 2026)
  // Test the comprehensive validateHtmlForPdfTextLayer function
  // ===========================================================================
  describe('validateHtmlForPdfTextLayer', () => {
    it('returns valid for clean HTML with UK dates', () => {
      const html = `
        <dt>Tenancy Start Date:</dt><dd>1 February 2026</dd>
        <dt>Generated:</dt><dd>3 February 2026</dd>
      `;
      const result = validateHtmlForPdfTextLayer(html);
      expect(result.valid).toBe(true);
      expect(result.isoDateLeaks).toHaveLength(0);
      expect(result.blankDateFields).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('detects ISO date leaks', () => {
      const html = '<p>Start date: 2026-01-15</p>';
      const result = validateHtmlForPdfTextLayer(html);
      expect(result.valid).toBe(false);
      expect(result.isoDateLeaks).toContain('2026-01-15');
      expect(result.warnings).toContainEqual(expect.stringContaining('ISO_DATE_LEAK'));
    });

    it('detects blank date fields', () => {
      const html = '<dt>Tenancy Start Date:</dt><dd></dd>';
      const result = validateHtmlForPdfTextLayer(html);
      expect(result.valid).toBe(false);
      expect(result.blankDateFields).toContain('Tenancy Start Date');
      expect(result.warnings).toContainEqual(expect.stringContaining('BLANK_DATE_FIELD'));
    });

    it('detects both ISO leaks and blank fields', () => {
      const html = `
        <p>Notice date: 2026-02-01</p>
        <dt>Generated:</dt><dd></dd>
      `;
      const result = validateHtmlForPdfTextLayer(html);
      expect(result.valid).toBe(false);
      expect(result.isoDateLeaks).toHaveLength(1);
      expect(result.blankDateFields).toHaveLength(1);
      expect(result.warnings).toHaveLength(2);
    });

    it('throws when throwOnCritical is true and issues found', () => {
      const html = '<p>Date: 2026-01-15</p>';
      expect(() => validateHtmlForPdfTextLayer(html, { throwOnCritical: true })).toThrow(
        /PDF_TEXT_LAYER_VALIDATION_FAILED/
      );
    });

    it('does not throw when valid even with throwOnCritical', () => {
      const html = '<p>Date: 15 January 2026</p>';
      expect(() => validateHtmlForPdfTextLayer(html, { throwOnCritical: true })).not.toThrow();
    });
  });

  // ===========================================================================
  // INTEGRATION TESTS - GENERATED DOCUMENTS (Feb 2026)
  // Verify that generated documents pass PDF text layer validation
  // ===========================================================================
  describe('Generated documents - PDF text layer validation', () => {
    const baseTestData = {
      // Landlord
      landlord_full_name: 'John Smith',
      landlord_address: '1 High Street, London, SW1A 1AA',
      landlord_email: 'john@example.com',
      landlord_phone: '07700 900000',

      // Tenant
      tenant_full_name: 'Jane Doe',
      property_address: '123 Test Street\nTestville\nTS1 2AB',
      property_address_line1: '123 Test Street',
      property_address_town: 'Testville',

      // Tenancy
      tenancy_start_date: '2024-06-01',
      rent_amount: 1200,
      rent_frequency: 'monthly',

      // Compliance
      deposit_protected: true,
      deposit_amount: 2400,
      deposit_scheme_name: 'DPS',
      prescribed_info_given: true,
      gas_cert_provided: true,
      epc_provided: true,
      epc_rating: 'C',
      how_to_rent_given: true,
      selected_notice_route: 'section_21',
      jurisdiction_display: 'England',
    };

    it('compliance_checklist.hbs passes PDF text layer validation', async () => {
      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
        data: baseTestData,
        isPreview: true,
        outputFormat: 'html',
      });

      const validation = validateHtmlForPdfTextLayer(result.html, {
        documentType: 'compliance_checklist.hbs',
      });

      if (!validation.valid) {
        console.error('PDF text layer validation failed:', validation.warnings);
      }

      expect(validation.valid).toBe(true);
    });

    it('compliance_checklist.hbs has current_date filled (not blank)', async () => {
      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/compliance_checklist.hbs',
        data: baseTestData,
        isPreview: true,
        outputFormat: 'html',
      });

      // Check that Generated: field has a value
      expect(result.html).toMatch(/<dt[^>]*>Generated:<\/dt>\s*<dd[^>]*>\d{1,2}\s+\w+\s+\d{4}<\/dd>/);
    });

    it('service_instructions.hbs passes PDF text layer validation', async () => {
      // Service instructions template requires specific fields
      const serviceInstructionsData = {
        ...baseTestData,
        notice_type: 'Section 21',
        notice_service_date: '2026-02-01',
        notice_expiry_date: '2026-04-01',
        metadata: {
          generated_at: '2026-02-03',
        },
      };

      const result = await generateDocument({
        templatePath: 'uk/england/templates/eviction/service_instructions.hbs',
        data: serviceInstructionsData,
        isPreview: true,
        outputFormat: 'html',
      });

      const validation = validateHtmlForPdfTextLayer(result.html, {
        documentType: 'service_instructions.hbs',
      });

      if (!validation.valid) {
        console.error('PDF text layer validation failed:', validation.warnings);
      }

      expect(validation.valid).toBe(true);
    });
  });
});
