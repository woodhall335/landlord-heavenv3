/**
 * Dashboard/case document display helpers.
 *
 * Keeps UI display logic aligned with generated document_type values,
 * including tenancy agreement variants (ast_agreement*).
 */

export type DashboardDocumentCategory = 'eviction' | 'money_claim' | 'tenancy_agreement' | 'other';

const TENANCY_SUPPORT_DOCUMENT_TYPES = new Set([
  'inventory_schedule',
  'pre_tenancy_checklist_england',
  'pre_tenancy_checklist_wales',
  'pre_tenancy_checklist_scotland',
  'pre_tenancy_checklist_northern_ireland',
  'england_tenancy_transition_guidance',
  'england_written_statement_of_terms',
  'england_lodger_checklist',
  'renters_rights_information_sheet_2026',
  'deposit_protection_certificate',
  'tenancy_deposit_information',
  'england_keys_handover_record',
  'england_utilities_handover_sheet',
  'england_pet_request_addendum',
  'england_tenancy_variation_record',
  'england_premium_management_schedule',
  'england_student_move_out_schedule',
  'england_hmo_house_rules_appendix',
  'england_lodger_house_rules_appendix',
]);

const LEGACY_DOCUMENT_KEY_ALIASES: Record<string, string> = {
  'section 8 notice': 'section8_notice',
  'service instructions': 'service_instructions',
  'service & validity checklist': 'service_checklist',
  'service and validity checklist': 'service_checklist',
  'pre-service compliance declaration': 'compliance_declaration',
  'pre service compliance declaration': 'compliance_declaration',
  'rent schedule / arrears statement': 'arrears_schedule',
};

function normalizeDocumentKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Normalize document keys to canonical keys used by pack-contents validation.
 * Supports legacy rows where a human-readable title was persisted as document_type.
 */
export function toCanonicalDocumentKey(value: string | null | undefined): string {
  if (!value) return '';
  const normalized = normalizeDocumentKey(value);
  return LEGACY_DOCUMENT_KEY_ALIASES[normalized] || normalized.replace(/[\s/-]+/g, '_').replace(/&/g, 'and');
}

/**
 * Group all AST agreement variants under tenancy_agreement UI category.
 */
export function isTenancyAgreementVariant(documentType: string): boolean {
  return (
    documentType === 'ast_agreement' ||
    documentType.startsWith('ast_agreement_') ||
    documentType === 'england_standard_tenancy_agreement' ||
    documentType === 'england_premium_tenancy_agreement' ||
    documentType === 'england_student_tenancy_agreement' ||
    documentType === 'england_hmo_shared_house_tenancy_agreement' ||
    documentType === 'england_lodger_agreement' ||
    documentType === 'england_written_statement_of_terms'
  );
}

/**
 * Map a raw document_type to a top-level category used by dashboard filters.
 */
export function getDashboardDocumentCategory(documentType: string): DashboardDocumentCategory {
  if (isTenancyAgreementVariant(documentType) || TENANCY_SUPPORT_DOCUMENT_TYPES.has(documentType)) {
    return 'tenancy_agreement';
  }

  if (
    documentType.startsWith('section') ||
    [
      'notice_to_leave',
      'arrears_schedule',
      'service_instructions',
      'service_certificate',
      'witness_statement',
      'evidence_bundle_index',
      'validity_checklist',
      'eviction_roadmap',
    ].includes(documentType)
  ) {
    return 'eviction';
  }

  if (
    [
      'n1_claim',
      'n119_particulars',
      'statement_of_account',
      'court_fee_schedule',
      'money_claim_cover_letter',
      'money_claim',
      'form_3a',
    ].includes(documentType)
  ) {
    return 'money_claim';
  }

  return 'other';
}

/**
 * Friendly fallback labels when document_title is absent/non-user-friendly.
 */
export function getDashboardDocumentTitle(documentType: string): string {
  const explicitTitles: Record<string, string> = {
    england_standard_tenancy_agreement: 'Standard Tenancy Agreement',
    england_premium_tenancy_agreement: 'Premium Tenancy Agreement',
    england_student_tenancy_agreement: 'Student Tenancy Agreement',
    england_hmo_shared_house_tenancy_agreement: 'HMO / Shared House Tenancy Agreement',
    england_lodger_agreement: 'Room Let / Lodger Agreement',
    england_written_statement_of_terms: 'England Written Statement of Terms',
    england_tenancy_transition_guidance: 'England Tenancy Transition Guidance',
    england_lodger_checklist: 'Room Let / Lodger Checklist',
    inventory_schedule: 'Inventory Schedule',
    inventory_schedule_condition: 'Inventory & Schedule of Condition',
    renters_rights_information_sheet_2026: 'Renters\' Rights Act Information Sheet 2026',
    deposit_protection_certificate: 'Deposit Protection Certificate',
    tenancy_deposit_information: 'Prescribed Information Pack',
    england_keys_handover_record: 'Keys & Handover Record',
    england_utilities_handover_sheet: 'Utilities & Meter Handover Sheet',
    england_pet_request_addendum: 'Pet Request / Consent Addendum',
    england_tenancy_variation_record: 'Tenancy Variation Record',
    england_premium_management_schedule: 'Premium Management Schedule',
    england_student_move_out_schedule: 'Student Move-Out & Guarantor Schedule',
    england_hmo_house_rules_appendix: 'HMO / Shared House Rules Appendix',
    england_lodger_house_rules_appendix: 'Lodger House Rules Appendix',
    pre_tenancy_checklist_england: 'Pre-Tenancy Checklist (England)',
    pre_tenancy_checklist_wales: 'Pre-Tenancy Checklist (Wales)',
    pre_tenancy_checklist_scotland: 'Pre-Tenancy Checklist (Scotland)',
    pre_tenancy_checklist_northern_ireland: 'Pre-Tenancy Checklist (Northern Ireland)',
    guarantor_agreement: 'Guarantor Agreement',
    residential_sublet_agreement: 'Residential Sublet Agreement',
    lease_amendment: 'Lease Amendment',
    lease_assignment_agreement: 'Lease Assignment Agreement',
    rent_arrears_letter: 'Rent Arrears Letter',
    repayment_plan_agreement: 'Repayment Plan Agreement',
    residential_tenancy_application: 'Residential Tenancy Application',
    rental_inspection_report: 'Rental Inspection Report',
    flatmate_agreement: 'Flatmate Agreement',
    renewal_tenancy_agreement: 'Renewal Tenancy Agreement',
    eviction: 'Eviction Notice',
    money_claim: 'Money Claim',
    tenancy_agreement: 'Tenancy Agreement',
  };

  if (explicitTitles[documentType]) {
    return explicitTitles[documentType];
  }

  if (isTenancyAgreementVariant(documentType)) {
    return 'Tenancy Agreement';
  }

  return documentType.replace(/_/g, ' ');
}

/**
 * Matching helper for pack-contents key checks.
 * Allows canonical ast_agreement key to match generated ast_agreement_* variants.
 */
export function doesDocumentTypeMatch(expectedType: string, actualType: string): boolean {
  const canonicalExpected = toCanonicalDocumentKey(expectedType);
  const canonicalActual = toCanonicalDocumentKey(actualType);

  if (canonicalExpected === canonicalActual) {
    return true;
  }

  if (canonicalExpected === 'ast_agreement' && isTenancyAgreementVariant(canonicalActual)) {
    return true;
  }

  return false;
}
