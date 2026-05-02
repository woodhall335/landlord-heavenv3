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
    expect(toCanonicalDocumentKey('Court Readiness Status')).toBe('court_readiness_status');
    expect(toCanonicalDocumentKey('Court Forms')).toBe('court_forms_guide');
    expect(toCanonicalDocumentKey('Service Continuity Notes')).toBe('service_record_notes');
  });

  it('matches expected canonical keys against legacy title-backed keys', () => {
    expect(doesDocumentTypeMatch('service_checklist', 'Service & Validity Checklist')).toBe(true);
    expect(doesDocumentTypeMatch('compliance_declaration', 'Pre-Service Compliance Declaration')).toBe(true);
    expect(doesDocumentTypeMatch('what_happens_next', 'What Happens Next')).toBe(true);
  });

  it('uses explicit titles for the new England tenancy support documents', () => {
    expect(getDashboardDocumentTitle('england_tenancy_setup_summary')).toBe('Tenancy Setup Summary');
    expect(getDashboardDocumentTitle('england_hmo_setup_summary')).toBe('HMO Setup Summary');
    expect(getDashboardDocumentTitle('england_room_let_summary')).toBe('Room Let Summary');
    expect(getDashboardDocumentTitle('england_written_statement_of_terms')).toBe('England Written Statement of Terms');
    expect(getDashboardDocumentTitle('england_tenancy_transition_guidance')).toBe('England Tenancy Transition Guidance');
    expect(getDashboardDocumentTitle('england_lodger_checklist')).toBe('Room Let / Lodger Checklist');
    expect(getDashboardDocumentTitle('england_keys_handover_record')).toBe('Keys & Handover Record');
    expect(getDashboardDocumentTitle('england_premium_management_schedule')).toBe('Premium Management Schedule');
    expect(getDashboardDocumentTitle('england_hmo_house_rules_appendix')).toBe('HMO / Shared House Rules Appendix');
    expect(getDashboardDocumentTitle('england_standard_tenancy_agreement')).toBe('Standard Tenancy Agreement & Setup Pack');
    expect(getDashboardDocumentTitle('england_premium_tenancy_agreement')).toBe(
      'Premium Tenancy Agreement & Management Pack'
    );
    expect(getDashboardDocumentTitle('england_hmo_shared_house_tenancy_agreement')).toBe(
      'HMO / Shared House Tenancy Agreement & House Management Pack'
    );
    expect(getDashboardDocumentTitle('england_lodger_agreement')).toBe(
      'Room Let / Lodger Agreement & Shared Home Pack'
    );
    expect(getDashboardDocumentTitle('case_summary')).toBe('Case Summary');
    expect(getDashboardDocumentTitle('court_readiness_status')).toBe('Court Readiness Status');
    expect(getDashboardDocumentTitle('court_forms_guide')).toBe('Court Forms');
    expect(getDashboardDocumentTitle('service_record_notes')).toBe('Service Continuity Notes');
    expect(getDashboardDocumentTitle('evidence_checklist')).toBe('Evidence Required for Hearing');
    expect(getDashboardDocumentTitle('hearing_checklist')).toBe('Hearing Preparation Guide');
    expect(getDashboardDocumentTitle('what_happens_next')).toBe('What Happens Next');
    expect(getDashboardDocumentTitle('section13_rent_increase_summary')).toBe('Rent Increase Summary');
    expect(getDashboardDocumentTitle('section13_property_condition_comparison_sheet')).toBe(
      'Property Condition Comparison Sheet'
    );
    expect(getDashboardDocumentTitle('section13_tenant_argument_response_guide')).toBe(
      'Tenant Argument and Landlord Response Guide'
    );
  });
});
