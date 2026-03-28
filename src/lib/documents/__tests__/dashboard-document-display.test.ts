import { describe, expect, it } from 'vitest';
import {
  doesDocumentTypeMatch,
  getDashboardDocumentTitle,
  toCanonicalDocumentKey,
} from '@/lib/documents/dashboard-document-display';

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

  it('uses explicit titles for the new England tenancy support documents', () => {
    expect(getDashboardDocumentTitle('england_written_statement_of_terms')).toBe('England Written Statement of Terms');
    expect(getDashboardDocumentTitle('england_tenancy_transition_guidance')).toBe('England Tenancy Transition Guidance');
    expect(getDashboardDocumentTitle('england_lodger_checklist')).toBe('Room Let / Lodger Checklist');
    expect(getDashboardDocumentTitle('england_keys_handover_record')).toBe('Keys & Handover Record');
    expect(getDashboardDocumentTitle('england_premium_management_schedule')).toBe('Premium Management Schedule');
    expect(getDashboardDocumentTitle('england_hmo_house_rules_appendix')).toBe('HMO / Shared House Rules Appendix');
  });
});
