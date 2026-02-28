/**
 * Date Normalizer Tests
 *
 * Verifies that ISO dates are correctly converted to UK format
 * for human-facing document rendering.
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeDatesForRender,
  formatDateUK,
  findISODatesInContent,
} from '../date-normalizer';

describe('date-normalizer', () => {
  describe('normalizeDatesForRender', () => {
    it('converts ISO date fields to UK long format', () => {
      const input = {
        tenancy_start_date: '2026-02-01',
        tenant_name: 'John Smith',
      };

      const result = normalizeDatesForRender(input);

      expect(result.tenancy_start_date).toBe('1 February 2026');
      expect(result.tenancy_start_date_formatted).toBe('1 February 2026');
      expect(result.tenancy_start_date_iso).toBe('2026-02-01');
      expect(result.tenant_name).toBe('John Smith');
    });

    it('handles multiple date fields', () => {
      const input = {
        tenancy_start_date: '2026-01-15',
        notice_served_date: '2026-03-01',
        notice_expiry_date: '2026-05-01',
      };

      const result = normalizeDatesForRender(input);

      expect(result.tenancy_start_date).toBe('15 January 2026');
      expect(result.notice_served_date).toBe('1 March 2026');
      expect(result.notice_expiry_date).toBe('1 May 2026');
    });

    it('preserves non-date fields', () => {
      const input = {
        landlord_name: 'Jane Doe',
        property_address: '123 Main St',
        rent_amount: 1200,
        is_fixed_term: true,
      };

      const result = normalizeDatesForRender(input);

      expect(result.landlord_name).toBe('Jane Doe');
      expect(result.property_address).toBe('123 Main St');
      expect(result.rent_amount).toBe(1200);
      expect(result.is_fixed_term).toBe(true);
    });

    it('handles nested objects', () => {
      const input = {
        tenancy_start_date: '2026-02-01',
        arrears: {
          first_arrears_date: '2026-03-15',
          amount: 500,
        },
      };

      const result = normalizeDatesForRender(input);

      expect(result.tenancy_start_date).toBe('1 February 2026');
      expect((result.arrears as any).first_arrears_date).toBe('15 March 2026');
      expect((result.arrears as any).amount).toBe(500);
    });

    it('handles arrays with date fields', () => {
      const input = {
        rent_ledger: [
          { date: '2026-01-01', amount: 1200, description: 'Rent due' },
          { date: '2026-02-01', amount: 1200, description: 'Rent due' },
        ],
      };

      const result = normalizeDatesForRender(input);

      expect((result.rent_ledger as any)[0].date).toBe('01/01/2026'); // Short format for 'date' field
      expect((result.rent_ledger as any)[1].date).toBe('01/02/2026');
    });

    it('preserves null and undefined values', () => {
      const input = {
        tenancy_start_date: '2026-02-01',
        end_date: null,
        other_date: undefined,
      };

      const result = normalizeDatesForRender(input);

      expect(result.tenancy_start_date).toBe('1 February 2026');
      expect(result.end_date).toBeNull();
      expect(result.other_date).toBeUndefined();
    });

    it('preserves already-formatted dates (non-ISO strings)', () => {
      const input = {
        tenancy_start_date: '1 January 2026', // Already formatted
        notice_date: '15/03/2026', // DD/MM/YYYY format
      };

      const result = normalizeDatesForRender(input);

      // These don't match ISO pattern, so should pass through unchanged
      expect(result.tenancy_start_date).toBe('1 January 2026');
      expect(result.notice_date).toBe('15/03/2026');
    });

    it('handles ISO datetime strings (extracts date portion)', () => {
      const input = {
        created_date: '2026-02-01T14:30:00.000Z',
      };

      const result = normalizeDatesForRender(input);

      expect(result.created_date).toBe('1 February 2026');
    });
  });

  describe('formatDateUK', () => {
    it('formats ISO date to long UK format by default', () => {
      expect(formatDateUK('2026-02-01')).toBe('1 February 2026');
      expect(formatDateUK('2026-12-25')).toBe('25 December 2026');
    });

    it('formats to short UK format when specified', () => {
      expect(formatDateUK('2026-02-01', 'short')).toBe('01/02/2026');
      expect(formatDateUK('2026-12-25', 'short')).toBe('25/12/2026');
    });

    it('handles null/undefined gracefully', () => {
      expect(formatDateUK(null)).toBe('');
      expect(formatDateUK(undefined)).toBe('');
      expect(formatDateUK('')).toBe('');
    });

    it('returns original string if not a valid date', () => {
      expect(formatDateUK('not a date')).toBe('not a date');
    });
  });

  describe('findISODatesInContent', () => {
    it('finds ISO dates in rendered content', () => {
      const content = `
        The tenancy starts on 2026-02-01.
        Notice expires on 2026-05-15.
      `;

      const matches = findISODatesInContent(content);

      expect(matches).toHaveLength(2);
      expect(matches).toContain('2026-02-01');
      expect(matches).toContain('2026-05-15');
    });

    it('returns empty array when no ISO dates found', () => {
      const content = `
        The tenancy starts on 1 February 2026.
        Notice expires on 15 May 2026.
      `;

      const matches = findISODatesInContent(content);

      expect(matches).toHaveLength(0);
    });

    it('finds ISO dates in JSON embedded in HTML', () => {
      const content = `
        <html>
          <script>var data = {"date": "2026-02-01"};</script>
        </html>
      `;

      const matches = findISODatesInContent(content);

      expect(matches).toContain('2026-02-01');
    });
  });
});
