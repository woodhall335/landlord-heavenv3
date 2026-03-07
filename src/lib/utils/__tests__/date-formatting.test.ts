/**
 * UK Date Formatting Tests
 *
 * Ensures all date formatting utilities consistently output UK format
 * regardless of system locale settings.
 */

import { describe, test, expect } from 'vitest';
import { formatDate, formatDateLong, formatDateTime } from '../index';

describe('formatDate (DD/MM/YYYY)', () => {
  test('formats ISO date string to UK format', () => {
    const result = formatDate('2025-07-14');
    expect(result).toBe('14/07/2025');
  });

  test('formats Date object to UK format', () => {
    // Note: months are 0-indexed in JS Date
    const result = formatDate(new Date(2025, 6, 14));
    expect(result).toBe('14/07/2025');
  });

  test('formats ISO datetime string to UK format', () => {
    const result = formatDate('2025-12-25T10:30:00Z');
    // Result depends on local timezone, but format should be DD/MM/YYYY
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  test('single digit day/month should be zero-padded', () => {
    const result = formatDate('2025-01-05');
    expect(result).toBe('05/01/2025');
  });
});

describe('formatDateLong (e.g., "14 July 2025")', () => {
  test('formats ISO date string to long UK format', () => {
    const result = formatDateLong('2025-07-14');
    expect(result).toBe('14 July 2025');
  });

  test('formats Date object to long UK format', () => {
    const result = formatDateLong(new Date(2025, 6, 14));
    expect(result).toBe('14 July 2025');
  });

  test('formats first day of year correctly', () => {
    const result = formatDateLong('2025-01-01');
    expect(result).toBe('1 January 2025');
  });

  test('formats last day of year correctly', () => {
    const result = formatDateLong('2025-12-31');
    expect(result).toBe('31 December 2025');
  });

  test('February date renders correctly', () => {
    const result = formatDateLong('2025-02-28');
    expect(result).toBe('28 February 2025');
  });
});

describe('formatDateTime (DD/MM/YYYY, HH:mm)', () => {
  test('formats datetime to UK format with time', () => {
    // Use a specific date/time
    const date = new Date(2025, 6, 14, 14, 30);
    const result = formatDateTime(date);
    // Should match DD/MM/YYYY, HH:mm pattern
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}$/);
    expect(result).toBe('14/07/2025, 14:30');
  });

  test('formats ISO datetime string with time', () => {
    // Create date locally to avoid timezone issues
    const date = new Date(2025, 0, 1, 9, 5);
    const result = formatDateTime(date);
    expect(result).toBe('01/01/2025, 09:05');
  });
});

describe('Edge cases and error handling', () => {
  test('handles ISO date with timezone offset', () => {
    // The output will depend on local timezone interpretation
    // but format should always be consistent
    const result = formatDate('2025-07-14T00:00:00+01:00');
    expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  test('handles epoch timestamp via Date object', () => {
    // July 14, 2025 00:00:00 UTC = 1752451200000
    const date = new Date(Date.UTC(2025, 6, 14, 12, 0, 0));
    const result = formatDateLong(date);
    // Result depends on local timezone, but should be in long format
    expect(result).toMatch(/^\d{1,2} \w+ \d{4}$/);
  });

  test('formatDate does not produce US format (MM/DD/YYYY)', () => {
    // Use a date where day > 12 to detect US format confusion
    const result = formatDate('2025-07-25');
    expect(result).toBe('25/07/2025');
    // If this were US format, it would throw or produce '07/25/2025'
    expect(result).not.toBe('07/25/2025');
  });

  test('formatDateLong produces UK-style month name (no comma)', () => {
    const result = formatDateLong('2025-07-14');
    // UK format: "14 July 2025" (no comma)
    // US format: "July 14, 2025" (month first, comma)
    expect(result).toBe('14 July 2025');
    expect(result).not.toContain(',');
    expect(result).not.toMatch(/^July/);
  });
});
