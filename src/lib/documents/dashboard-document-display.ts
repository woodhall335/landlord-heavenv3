/**
 * Dashboard/case document display helpers.
 *
 * Keeps UI display logic aligned with generated document_type values,
 * including tenancy agreement variants (ast_agreement*).
 */

export type DashboardDocumentCategory = 'eviction' | 'money_claim' | 'tenancy_agreement' | 'rent_increase' | 'other';

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
  'form 3 notice seeking possession': 'section8_notice',
  'form 3 - notice seeking possession': 'section8_notice',
  'form 3a notice': 'section8_notice',
  'form 3a notice seeking possession': 'section8_notice',
  'form 3a - notice seeking possession': 'section8_notice',
  'service instructions': 'service_instructions',
  'cover letter to tenant': 'cover_letter_to_tenant',
  'service & validity checklist': 'service_checklist',
  'service and validity checklist': 'service_checklist',
  'service & compliance checklist': 'service_checklist',
  'service and compliance checklist': 'service_checklist',
  'ground-specific evidence checklist': 'evidence_checklist',
  'ground specific evidence checklist': 'evidence_checklist',
  'evidence collection checklist': 'evidence_checklist',
  'proof of service support': 'proof_of_service',
  'proof of service': 'proof_of_service',
  'form n5 - claim for possession': 'n5_claim',
  'form n119 - particulars of claim': 'n119_particulars',
  'form n325 - request for warrant for possession of land': 'n325_request',
  'form n325a - request for warrant after suspended possession order': 'n325a_request',
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
      'cover_letter_to_tenant',
      'service_checklist',
      'evidence_checklist',
      'proof_of_service',
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
      'n5_claim',
      'n1_claim',
      'n119_particulars',
      'n325_request',
      'n325a_request',
      'statement_of_account',
      'court_fee_schedule',
      'money_claim_cover_letter',
      'money_claim',
      'form_3a',
    ].includes(documentType)
  ) {
    return 'money_claim';
  }

  if (
    [
      'section13_form_4a',
      'section13_justification_report',
      'section13_proof_of_service_record',
      'section13_cover_letter',
      'section13_tribunal_argument_summary',
      'section13_tribunal_defence_guide',
      'section13_landlord_response_template',
      'section13_legal_briefing',
      'section13_evidence_checklist',
      'section13_negotiation_email_template',
      'section13_tribunal_bundle',
      'section13_tribunal_bundle_zip',
    ].includes(documentType)
  ) {
    return 'rent_increase';
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
    section13_form_4a: 'Form 4A Rent Increase Notice',
    section13_justification_report: 'Rent Increase Justification Report',
    section13_proof_of_service_record: 'Proof of Service Record',
    section13_cover_letter: 'Rent Increase Cover Letter',
    section13_tribunal_argument_summary: 'Tribunal Argument Summary',
    section13_tribunal_defence_guide: 'Tribunal Defence Guide',
    section13_landlord_response_template: 'Landlord Response Template',
    section13_legal_briefing: 'Tribunal Legal Briefing',
    section13_evidence_checklist: 'Evidence Checklist',
    section13_negotiation_email_template: 'Negotiation Email Template',
    section13_tribunal_bundle: 'Merged Tribunal Bundle PDF',
    section13_tribunal_bundle_zip: 'Tribunal Bundle ZIP',
    residential_tenancy_application: 'Residential Tenancy Application',
    rental_inspection_report: 'Rental Inspection Report',
    flatmate_agreement: 'Flatmate Agreement',
    renewal_tenancy_agreement: 'Renewal Tenancy Agreement',
  section8_notice: 'Form 3A notice',
    service_instructions: 'Service Instructions',
    cover_letter_to_tenant: 'Cover Letter to Tenant',
    service_checklist: 'Service & Compliance Checklist',
    evidence_checklist: 'Ground-Specific Evidence Checklist',
    proof_of_service: 'Proof of Service Support',
    n5_claim: 'Form N5 - Claim for Possession',
    n119_particulars: 'Form N119 - Particulars of Claim',
    n325_request: 'Form N325 - Request for Warrant',
    n325a_request: 'Form N325A - Request for Warrant After Suspended Order',
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
