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
import { findISODatesInContent } from '@/lib/documents/date-normalizer';
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
});
