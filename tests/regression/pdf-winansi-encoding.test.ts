/**
 * Regression Tests: PDF WinAnsi Encoding
 *
 * These tests verify that PDF generation does not crash when encountering
 * Unicode characters that cannot be encoded in WinAnsi (Windows-1252).
 *
 * Background:
 * - pdf-lib standard fonts (Helvetica, Times, etc.) use WinAnsi encoding
 * - WinAnsi cannot encode characters like ⚠, emojis, smart quotes, etc.
 * - Before this fix, these characters would cause a 500 error:
 *   "WinAnsi cannot encode '⚠' (0x26a0) ... encodeTextAsGlyphs ... drawText"
 *
 * The fix:
 * - Created pdf-safe-text.ts with toWinAnsiSafeText() function
 * - Applied sanitization to all pdf-lib drawText() calls
 * - Updated API error handling to return 422 instead of 500 for encoding errors
 */

import { describe, expect, test } from 'vitest';
import {
  toWinAnsiSafeText,
  hasUnsafeUnicodeCharacters,
  findUnsafeCharacters,
} from '@/lib/documents/pdf-safe-text';
import { generateProofOfServicePDF } from '@/lib/documents/proof-of-service-generator';

describe('pdf-safe-text utility', () => {
  describe('toWinAnsiSafeText', () => {
    test('converts warning symbol to ASCII equivalent', () => {
      const input = '⚠ IMPORTANT: Check this';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('WARNING: IMPORTANT: Check this');
      expect(output).not.toContain('⚠');
    });

    test('converts warning symbol with variation selector', () => {
      const input = '⚠️ Warning message';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('WARNING: Warning message');
    });

    test('converts check mark emoji to [OK]', () => {
      const input = 'Status: ✅ Complete';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Status: [OK] Complete');
    });

    test('converts cross mark emoji to [X]', () => {
      const input = 'Status: ❌ Failed';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Status: [X] Failed');
    });

    test('converts smart quotes to straight quotes', () => {
      // Use Unicode escapes to avoid parsing issues with smart quotes
      const input = '\u201CHello\u201D and \u2018World\u2019';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('"Hello" and \'World\'');
    });

    test('converts em dash and en dash to hyphens', () => {
      const input = 'one—two–three';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('one--two-three');
    });

    test('converts ellipsis to three dots', () => {
      const input = 'Wait for it…';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Wait for it...');
    });

    test('removes emoji characters that are outside BMP', () => {
      const input = 'Hello 😀 World';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Hello  World');
    });

    test('preserves basic ASCII text', () => {
      const input = 'Hello World! 123 @#$%';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Hello World! 123 @#$%');
    });

    test('preserves extended WinAnsi characters (£, €, etc.)', () => {
      // £ is at 0xA3 in WinAnsi, should be preserved
      const input = 'Price: £39.99';
      const output = toWinAnsiSafeText(input);
      expect(output).toBe('Price: £39.99');
    });

    test('handles null and undefined gracefully', () => {
      expect(toWinAnsiSafeText(null as any)).toBe('');
      expect(toWinAnsiSafeText(undefined as any)).toBe('');
    });

    test('handles empty string', () => {
      expect(toWinAnsiSafeText('')).toBe('');
    });

    test('handles string with only unsafe characters', () => {
      const input = '😀🎉✨';
      const output = toWinAnsiSafeText(input);
      // Should be mostly empty or have minimal replacement text
      expect(output.length).toBeLessThan(input.length);
    });
  });

  describe('hasUnsafeUnicodeCharacters', () => {
    test('returns true for strings with warning symbol', () => {
      expect(hasUnsafeUnicodeCharacters('⚠ Warning')).toBe(true);
    });

    test('returns true for strings with emoji', () => {
      expect(hasUnsafeUnicodeCharacters('Hello 😀')).toBe(true);
    });

    test('returns false for pure ASCII strings', () => {
      expect(hasUnsafeUnicodeCharacters('Hello World!')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(hasUnsafeUnicodeCharacters(null as any)).toBe(false);
      expect(hasUnsafeUnicodeCharacters(undefined as any)).toBe(false);
    });
  });

  describe('findUnsafeCharacters', () => {
    test('identifies warning symbol and its position', () => {
      const result = findUnsafeCharacters('Test ⚠ here');
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].char).toBe('⚠');
      expect(result[0].codePoint).toBe('U+26A0');
      expect(result[0].position).toBe(5);
    });

    test('returns empty array for safe strings', () => {
      const result = findUnsafeCharacters('Hello World!');
      expect(result).toEqual([]);
    });

    test('identifies multiple unsafe characters', () => {
      const result = findUnsafeCharacters('⚠ and ❌');
      expect(result.length).toBe(2);
    });
  });
});

describe('proof-of-service-generator', () => {
  test('generates PDF without crashing when template contains warning symbol', async () => {
    // This test verifies the fix for the WinAnsi encoding crash
    // The proof-of-service-generator.ts contains '⚠ IMPORTANT: ...'
    // which was causing a 500 error before the fix

    const pdfBytes = await generateProofOfServicePDF({
      landlord_name: 'John Smith',
      tenant_name: 'Jane Doe',
      property_address: '123 Test Street, London, SW1A 1AA',
      document_served: 'Section 8 Notice',
      served_date: '2026-01-15',
    });

    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.length).toBeGreaterThan(0);
    // PDF magic bytes should be present
    expect(pdfBytes[0]).toBe(0x25); // %
    expect(pdfBytes[1]).toBe(0x50); // P
    expect(pdfBytes[2]).toBe(0x44); // D
    expect(pdfBytes[3]).toBe(0x46); // F
  });

  test('generates PDF with data containing Unicode characters', async () => {
    // Test that even if user input contains Unicode, we don't crash
    const pdfBytes = await generateProofOfServicePDF({
      landlord_name: 'John "Jack" Smith', // Smart quotes
      tenant_name: 'Jane–Doe', // En dash
      property_address: '123 Test Street…', // Ellipsis
      document_served: 'Section 8 Notice',
    });

    expect(pdfBytes).toBeDefined();
    expect(pdfBytes.length).toBeGreaterThan(0);
  });
});

describe('PDF text extraction after sanitization', () => {
  test('sanitized text does not contain the warning symbol', () => {
    // This verifies that the ⚠ is converted to WARNING:
    const originalText = '⚠ IMPORTANT: You must complete all service details yourself';
    const sanitizedText = toWinAnsiSafeText(originalText);

    expect(sanitizedText).not.toContain('⚠');
    expect(sanitizedText).toContain('WARNING:');
    expect(sanitizedText).toContain('IMPORTANT');
  });
});
