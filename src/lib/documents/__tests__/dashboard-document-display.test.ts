import { describe, expect, it } from 'vitest';
import { doesDocumentTypeMatch, toCanonicalDocumentKey } from '@/lib/documents/dashboard-document-display';

describe('dashboard document key canonicalization', () => {
  it('maps legacy notice-only titles to canonical keys', () => {
    expect(toCanonicalDocumentKey('Section 8 Notice')).toBe('section8_notice');
    expect(toCanonicalDocumentKey('Service Instructions')).toBe('service_instructions');
    expect(toCanonicalDocumentKey('Service & Validity Checklist')).toBe('service_checklist');
    expect(toCanonicalDocumentKey('Pre-Service Compliance Declaration')).toBe('compliance_declaration');
    expect(toCanonicalDocumentKey('Rent Schedule / Arrears Statement')).toBe('arrears_schedule');
  });

  it('matches expected canonical keys against legacy title-backed keys', () => {
    expect(doesDocumentTypeMatch('service_checklist', 'Service & Validity Checklist')).toBe(true);
    expect(doesDocumentTypeMatch('compliance_declaration', 'Pre-Service Compliance Declaration')).toBe(true);
  });
});
