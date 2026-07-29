import { describe, expect, it } from 'vitest';

import {
  DocumentDisplayValueError,
  DOCUMENT_DISPLAY_LABELS,
  formatDocumentCurrency,
  formatDocumentDisplayValue,
  normalizeSentenceFragment,
} from '../customer-display';

describe('customer-facing document display formatting', () => {
  it.each([
    [1050, '£1050.00'],
    ['1050.00', '£1050.00'],
    ['£1,150.00', '£1150.00'],
    [0, '£0.00'],
  ])('formats supported monetary value %p', (value, expected) => {
    expect(formatDocumentCurrency(value)).toBe(expected);
  });

  it.each([undefined, null, '', 'not-a-number', -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects invalid monetary value %p instead of displaying a false zero',
    (value) => {
      expect(() => formatDocumentCurrency(value)).toThrow(DocumentDisplayValueError);
    }
  );

  it('has an explicit customer label for every supported internal value', () => {
    expect(Object.keys(DOCUMENT_DISPLAY_LABELS).sort()).toEqual([
      'designated',
      'false',
      'fully_signed',
      'landlord_signed',
      'not_applicable',
      'not_designated',
      'pending',
      'tenant_signed',
      'true',
      'unknown',
      'unsigned',
    ]);
    expect(formatDocumentDisplayValue('not_designated')).toBe('Not designated');
    expect(formatDocumentDisplayValue('designated')).toBe('Designated');
    expect(formatDocumentDisplayValue('unknown')).toBe('Not confirmed');
    expect(formatDocumentDisplayValue('not_applicable')).toBe('Not applicable');
    expect(formatDocumentDisplayValue(true)).toBe('Yes');
    expect(formatDocumentDisplayValue(false)).toBe('No');
  });

  it.each([undefined, null, '', 'new_unmapped_status', { status: 'designated' }])(
    'rejects unsupported enum value %p instead of leaking it',
    (value) => {
      expect(() => formatDocumentDisplayValue(value)).toThrow(DocumentDisplayValueError);
    }
  );

  it('normalizes punctuation on dynamic sentence fragments before templates add punctuation', () => {
    expect(normalizeSentenceFragment('Damage caused by breach.')).toBe(
      'Damage caused by breach'
    );
    expect(normalizeSentenceFragment('Damage caused by breach..')).toBe(
      'Damage caused by breach'
    );
  });
});
