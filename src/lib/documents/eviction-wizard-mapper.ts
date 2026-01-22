import type { CaseFacts } from '@/lib/case-facts/schema';
import {
  wizardFactsToCaseFacts,
  resolveNoticeServiceMethod,
  resolveNoticeServiceMethodDetail,
} from '@/lib/case-facts/normalize';
import type { GroundClaim, EvictionCase } from './eviction-pack-generator';
import type { CaseData } from './official-forms-filler';
import type { ScotlandCaseData } from './scotland-forms-filler';
import { GROUND_DEFINITIONS } from './section8-generator';
import { generateArrearsParticulars } from './arrears-schedule-mapper';
import { EvidenceCategory } from '@/lib/evidence/schema';
import { calculatePossessionFees } from '@/lib/court-fees/hmcts-fees';

function buildAddress(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join('\n');
}

/**
 * Converts internal service method enum values to human-readable format for court forms.
 * N5B form field 10a requires proper court-ready text, not internal identifiers.
 *
 * @param method - The internal service method value (e.g., 'first_class_post')
 * @returns Human-readable format (e.g., 'First class post') or null if no mapping
 */
function formatServiceMethodForCourt(method: string | null | undefined): string | null {
  if (!method) return null;

  const methodMapping: Record<string, string> = {
    // Post methods
    'first_class_post': 'First class post',
    'recorded_delivery': 'Recorded delivery',
    'special_delivery': 'Special delivery',
    'registered_post': 'Registered post',
    // Hand delivery
    'hand_delivery': 'By hand',
    'hand_delivered': 'By hand',
    'by_hand': 'By hand',
    'in_person': 'By hand',
    'personal_service': 'Personal service',
    // Email (only valid if agreed in tenancy)
    'email': 'Email',
    // Other
    'other': 'Other method',
  };

  // Normalize the input and look up
  const normalized = method.toLowerCase().replace(/[\s-]+/g, '_').trim();

  if (methodMapping[normalized]) {
    return methodMapping[normalized];
  }

  // If already human-readable (e.g., "First class post"), return as-is
  if (method.includes(' ') || /^[A-Z]/.test(method)) {
    return method;
  }

  // Fallback: capitalize first letter and replace underscores with spaces
  return method
    .replace(/_/g, ' ')
    .replace(/^(\w)/, (match) => match.toUpperCase());
}

// =============================================================================
// P0-2: N5B ATTACHMENT CHECKBOX TRUTHFULNESS HELPER
// =============================================================================
// This helper checks if an evidence file with a specific category has been
// uploaded. It examines the facts.evidence.files[] array (canonical source)
// for files matching the given category.
//
// Used to determine whether N5B attachment checkboxes (E, F, G) should be
// ticked based on ACTUAL uploads, not compliance flags.
// =============================================================================

interface EvidenceFileEntry {
  id: string;
  category?: string;
  [key: string]: any;
}

/**
 * Check if an evidence file exists for a given category in the evidence files list.
 * This is the source of truth for N5B attachment checkboxes.
 *
 * @param evidenceFiles - The evidence.files array from wizard facts
 * @param category - The evidence category to check (from EvidenceCategory enum)
 * @returns true if at least one file with the matching category exists
 */
function hasUploadForCategory(
  evidenceFiles: EvidenceFileEntry[] | undefined,
  category: EvidenceCategory | string
): boolean {
  if (!Array.isArray(evidenceFiles) || evidenceFiles.length === 0) {
    return false;
  }

  // Check for exact category match
  return evidenceFiles.some((file) => {
    const fileCategory = file.category?.toLowerCase();
    const targetCategory = category.toLowerCase();
    return fileCategory === targetCategory;
  });
}

function normaliseFrequency(
  freq: CaseFacts['tenancy']['rent_frequency']
): CaseData['rent_frequency'] {
  if (freq === 'fortnightly' || freq === 'quarterly' || freq === 'weekly' || freq === 'monthly') {
    return freq;
  }
  return 'monthly';
}

/**
 * Derive deposit scheme checkbox flag for N5B form.
 * Matches scheme name against known variants.
 */
function deriveDepositSchemeFlag(
  schemeName: string | null | undefined,
  scheme: 'dps' | 'mydeposits' | 'tds'
): boolean {
  if (!schemeName) return false;
  const normalized = schemeName.toLowerCase().replace(/[\s\-_]/g, '');

  switch (scheme) {
    case 'dps':
      return normalized.includes('dps') ||
             normalized.includes('depositprotectionservice') ||
             normalized.includes('thedeposit');
    case 'mydeposits':
      return normalized.includes('mydeposit');
    case 'tds':
      return normalized.includes('tds') ||
             normalized.includes('tenancydepositscheme');
    default:
      return false;
  }
}

function deriveCaseType(evictionRoute: any): EvictionCase['case_type'] {
  const route = Array.isArray(evictionRoute) ? evictionRoute : [evictionRoute].filter(Boolean);
  // ==========================================================================
  // CASE TYPE DERIVATION
  // ==========================================================================
  // The wizard emits eviction_route as either 'section_21' or 'section_8'.
  // We check for Section 21 variants (with underscores, spaces, or concatenated)
  // and classify those as 'no_fault' evictions. All other routes (including
  // Section 8 with any grounds - arrears, ASB, breach) are classified as
  // 'rent_arrears' which is the general eviction case type.
  //
  // Note: Section 8 can be used for non-arrears grounds (e.g., Ground 14 ASB),
  // but for court form purposes, the 'rent_arrears' case_type covers all
  // fault-based evictions. The actual grounds are specified separately.
  // ==========================================================================
  const hasSection21 = route.some((r) => {
    if (typeof r !== 'string') return false;
    const normalized = r.toLowerCase().replace(/_/g, ' ');
    return normalized.includes('section 21') || normalized === 'section21';
  });
  if (hasSection21) return 'no_fault';
  return 'rent_arrears';
}

function parseGround(option: string): { code: string; codeNum: number | '14A'; title: string } {
  // Match ground number in formats: "ground 8", "ground_8", "Ground 8", "Ground_8"
  // Uses [\s_]* to allow spaces, underscores, or nothing between "ground" and the number
  const match = option.match(/ground[\s_]*([0-9a-z]+)/i);
  const codeStr = match ? match[1].toUpperCase() : '';
  const codeNum = (codeStr === '14A' ? '14A' : parseInt(codeStr)) as number | '14A';
  const code = codeStr ? `Ground ${codeStr}` : option.trim();
  const title = option.includes('-') ? option.split('-')[1].trim() : option.trim();
  return { code, codeNum, title };
}

function mapSection8Grounds(facts: CaseFacts): GroundClaim[] {
  const selections = facts.issues.section8_grounds.selected_grounds || [];
  return selections.map((selection) => {
    const { code, codeNum, title } = parseGround(selection);

    // Look up ground definition to get legal_basis and mandatory status
    const groundDef = GROUND_DEFINITIONS[codeNum];
    const legal_basis = groundDef?.legal_basis || 'Housing Act 1988, Schedule 2';
    const mandatory = groundDef?.mandatory || false;

    let particulars = '';

    if (['Ground 8', 'Ground 10', 'Ground 11'].includes(code)) {
      // Use canonical arrears mapper for arrears grounds particulars
      // This ensures particulars are generated from authoritative arrears_items
      if (facts.issues.section8_grounds.arrears_breakdown) {
        // If user has manually entered arrears breakdown, use that
        particulars = facts.issues.section8_grounds.arrears_breakdown as string;
      } else {
        // Otherwise, generate from canonical arrears data
        const arrearsParticulars = generateArrearsParticulars({
          arrears_items: facts.issues.rent_arrears.arrears_items,
          total_arrears: facts.issues.rent_arrears.total_arrears,
          rent_amount: facts.tenancy.rent_amount || 0,
          rent_frequency: facts.tenancy.rent_frequency,
          include_full_schedule: false, // Summary for notice, full schedule as separate PDF
        });
        particulars = arrearsParticulars.particulars;
      }
    } else if (code === 'Ground 12') {
      particulars = facts.issues.section8_grounds.breach_details || '';
    } else if (code === 'Ground 13' || code === 'Ground 15') {
      particulars = facts.issues.section8_grounds.damage_schedule || '';
    } else if (code === 'Ground 14' || code === 'Ground 14A') {
      particulars = facts.issues.section8_grounds.incident_log || '';
    } else if (code === 'Ground 17') {
      particulars = facts.issues.section8_grounds.false_statement_details || '';
    }

    return {
      code,
      title: groundDef?.title || title,  // Use canonical title from definitions
      legal_basis,
      particulars,
      mandatory,
    };
  });
}

function buildEvictionCaseFromFacts(
  caseId: string,
  facts: CaseFacts,
  evictionRoute: any
): { evictionCase: EvictionCase; caseType: EvictionCase['case_type'] } {
  const landlordAddress = buildAddress(
    facts.parties.landlord.address_line1,
    facts.parties.landlord.address_line2,
    facts.parties.landlord.city,
    facts.parties.landlord.postcode
  );
  const propertyAddress = buildAddress(
    facts.property.address_line1,
    facts.property.address_line2,
    facts.property.city,
    facts.property.postcode
  );

  const caseType = deriveCaseType(evictionRoute || facts.notice.notice_type);
  const grounds = mapSection8Grounds(facts);

  // Ensure canonical jurisdiction
  let jurisdiction = (facts.meta.jurisdiction as any) || 'england';
  if (jurisdiction === 'england-wales') {
    // Migrate based on property country if available
    const propertyCountry = facts.property.country;
    jurisdiction = propertyCountry === 'wales' ? 'wales' : 'england';
  }

  const evictionCase: EvictionCase = {
    case_id: caseId,
    jurisdiction: jurisdiction as any,
    case_type: caseType,
    case_summary: facts.court.particulars_of_claim || facts.issues.section8_grounds.arrears_breakdown || '',
    landlord_full_name: facts.parties.landlord.name || '',
    landlord_2_name: facts.parties.landlord.co_claimant || undefined,
    landlord_address: landlordAddress || '',
    landlord_address_line1: facts.parties.landlord.address_line1 || undefined,
    landlord_address_town: facts.parties.landlord.city || undefined,
    landlord_address_postcode: facts.parties.landlord.postcode || undefined,
    landlord_email: facts.parties.landlord.email || undefined,
    landlord_phone: facts.parties.landlord.phone || undefined,
    solicitor_firm: facts.parties.solicitor.name || undefined,
    solicitor_address: buildAddress(
      facts.parties.solicitor.address_line1,
      facts.parties.solicitor.address_line2,
      facts.parties.solicitor.city,
      facts.parties.solicitor.postcode
    ),
    solicitor_phone: facts.parties.solicitor.phone || undefined,
    solicitor_email: facts.parties.solicitor.email || undefined,
    dx_number: undefined,
    service_address_line1: facts.service_contact.service_address_line1 || undefined,
    service_address_line2: facts.service_contact.service_address_line2 || undefined,
    service_address_town: facts.service_contact.service_city || undefined,
    service_address_county: facts.service_contact.service_address_county || undefined,
    service_postcode: facts.service_contact.service_postcode || undefined,
    service_phone: facts.service_contact.service_phone || undefined,
    service_email: facts.service_contact.service_email || undefined,
    // IMPORTANT: Extract tenant names from normalized parties.tenants (populated by normalize.ts)
    tenant_full_name: facts.parties.tenants[0]?.name || '',
    tenant_2_name: facts.parties.tenants[1]?.name || undefined,
    property_address: propertyAddress || '',
    property_address_line1: facts.property.address_line1 || undefined,
    property_address_town: facts.property.city || undefined,
    property_address_postcode: facts.property.postcode || undefined,
    tenancy_start_date: facts.tenancy.start_date || '',
    tenancy_type: (facts.tenancy.tenancy_type as any) || 'ast',
    fixed_term: facts.tenancy.fixed_term || undefined,
    fixed_term_end_date: facts.tenancy.end_date || undefined,
    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: normaliseFrequency(facts.tenancy.rent_frequency),
    payment_day: (facts.tenancy.rent_due_day || facts.money_claim.payment_day || 1) as number,
    grounds,
    current_arrears: facts.issues.rent_arrears.total_arrears || undefined,
    arrears_at_notice_date: facts.issues.rent_arrears.arrears_at_notice_date || undefined,
    deposit_amount: facts.tenancy.deposit_amount || undefined,
    deposit_scheme_name: (facts.tenancy.deposit_scheme_name as any) || undefined,
    deposit_reference: facts.tenancy.deposit_reference || undefined,
    deposit_protected: facts.tenancy.deposit_protected || undefined,
    deposit_protection_date: facts.tenancy.deposit_protection_date || undefined,
    court_name: facts.court.court_name || undefined,
    court_address: facts.court.court_address || undefined,
  };

  return { evictionCase, caseType };
}

function buildCaseData(
  facts: CaseFacts,
  evictionCase: EvictionCase,
  caseType: EvictionCase['case_type'],
  wizardFacts: any
): CaseData {
  const claimType: CaseData['claim_type'] = caseType === 'no_fault' ? 'section_21' : 'section_8';
  const groundNumbers = evictionCase.grounds
    .map((g) => g.code.replace(/Ground\s*/i, ''))
    .filter(Boolean)
    .join(', ');

  return {
    landlord_full_name: evictionCase.landlord_full_name,
    landlord_2_name: evictionCase.landlord_2_name,
    landlord_address: evictionCase.landlord_address,
    landlord_postcode: evictionCase.landlord_address_postcode,
    landlord_phone: evictionCase.landlord_phone,
    landlord_email: evictionCase.landlord_email,
    claimant_reference: facts.court.claimant_reference || undefined,
    tenant_full_name: evictionCase.tenant_full_name,
    tenant_2_name: evictionCase.tenant_2_name,
    // P0 FIX: Support up to 4 joint tenants
    tenant_3_name: wizardFacts.tenant3_name || undefined,
    tenant_4_name: wizardFacts.tenant4_name || undefined,
    property_address: evictionCase.property_address,
    property_postcode: evictionCase.property_address_postcode,
    tenancy_start_date: evictionCase.tenancy_start_date,
    // N5B Q7: Tenancy agreement date (may differ from start date)
    tenancy_agreement_date:
      wizardFacts.tenancy_agreement_date ||
      evictionCase.tenancy_start_date, // Fallback to start date if not provided
    fixed_term: evictionCase.fixed_term,
    fixed_term_end_date: evictionCase.fixed_term_end_date,
    rent_amount: evictionCase.rent_amount,
    rent_frequency: evictionCase.rent_frequency,
    claim_type: claimType,
    ground_numbers: groundNumbers || undefined,
    ground_codes: evictionCase.grounds.map((g) => g.code.replace(/Ground\s*/i, '')).filter(Boolean),
    section_8_notice_date: wizardFacts.section_8_notice_date || facts.notice.notice_date || undefined,
    section_21_notice_date: wizardFacts.section_21_notice_date || facts.notice.notice_date || undefined,
    notice_served_date:
      wizardFacts.notice_served_date || wizardFacts.notice_date || facts.notice.notice_date || undefined,
    // ✅ FIX: Map notice_service_method for N5B form field 10a ("How was the notice served")
    // Uses centralized resolveNoticeServiceMethod() for single source of truth
    // CRITICAL: Must output human-readable format (e.g., "First class post") not internal enum
    notice_service_method: (() => {
      const method = resolveNoticeServiceMethod(wizardFacts);
      if (method === 'other') {
        // For "other" method, include the detail text
        const detail = resolveNoticeServiceMethodDetail(wizardFacts);
        return detail ? `Other: ${detail}` : 'Other method';
      }
      // Convert internal enum to human-readable format for N5B form
      const humanReadableMethod = formatServiceMethodForCourt(method || facts.notice.service_method);
      return humanReadableMethod || undefined;
    })(),
    particulars_of_claim: facts.court.particulars_of_claim || undefined,
    total_arrears:
      wizardFacts.total_arrears ||
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.total_arrears ||
      undefined,

    // Arrears items for N119 particulars generation
    arrears_items: facts.issues.rent_arrears.arrears_items || undefined,

    // ✅ FIXED: removed invalid amount_owing access
    arrears_at_notice_date:
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.arrears_at_notice_date ||
      facts.issues.rent_arrears.total_arrears ||
      undefined,

    // =========================================================================
    // COURT FEE AUTO-CALCULATION
    // =========================================================================
    // If no manual fee is provided, auto-calculate based on claim type and arrears.
    // Uses HMCTS fee structure from hmcts-fees.ts.
    // - Standard/Accelerated possession: £355
    // - Plus money claim fee if claiming arrears (banded by amount)
    // =========================================================================
    court_fee: (() => {
      // Use manually entered fee if provided
      if (facts.court.claim_amount_costs) {
        return facts.court.claim_amount_costs;
      }

      // Auto-calculate based on claim type and arrears
      const totalArrears =
        wizardFacts.total_arrears ||
        wizardFacts.rent_arrears_amount ||
        facts.issues.rent_arrears.total_arrears ||
        0;

      // Map claim type to fee calculator type
      const feeClaimType = claimType === 'section_21' ? 'accelerated_section21' : 'section_8';
      const calculatedFees = calculatePossessionFees(feeClaimType, totalArrears);

      return calculatedFees.totalFee;
    })(),
    solicitor_costs: facts.court.claim_amount_other || undefined,
    deposit_amount: facts.tenancy.deposit_amount || undefined,
    // Standardize deposit scheme naming - output both variants for template compatibility
    deposit_scheme: (facts.tenancy.deposit_scheme_name as any) || undefined,
    deposit_scheme_name: (facts.tenancy.deposit_scheme_name as any) || undefined,
    deposit_protection_date: facts.tenancy.deposit_protection_date || undefined,
    deposit_reference: facts.tenancy.deposit_reference || undefined,

    // N5B deposit scheme checkboxes - derive from deposit_scheme_name
    deposit_scheme_dps: deriveDepositSchemeFlag(facts.tenancy.deposit_scheme_name, 'dps'),
    deposit_scheme_mydeposits: deriveDepositSchemeFlag(facts.tenancy.deposit_scheme_name, 'mydeposits'),
    deposit_scheme_tds: deriveDepositSchemeFlag(facts.tenancy.deposit_scheme_name, 'tds'),
    solicitor_firm: evictionCase.solicitor_firm,
    solicitor_address: evictionCase.solicitor_address,
    solicitor_phone: evictionCase.solicitor_phone,
    solicitor_email: evictionCase.solicitor_email,
    dx_number: evictionCase.dx_number,
    service_address_line1: evictionCase.service_address_line1,
    service_address_line2: evictionCase.service_address_line2,
    service_address_town: evictionCase.service_address_town,
    service_address_county: evictionCase.service_address_county,
    service_postcode: evictionCase.service_postcode,
    service_phone: evictionCase.service_phone,
    service_email: evictionCase.service_email,
    court_name: evictionCase.court_name || wizardFacts.court_name,
    court_address: evictionCase.court_address || wizardFacts.court_address,
    signatory_name: wizardFacts.signatory_name || evictionCase.landlord_full_name,
    signature_date: wizardFacts.signature_date || new Date().toISOString().split('T')[0],
    notice_expiry_date: wizardFacts.notice_expiry_date || facts.notice.expiry_date || undefined,

    // =========================================================================
    // N5B QUESTION 8: SUBSEQUENT TENANCY
    // =========================================================================
    subsequent_tenancy: wizardFacts.subsequent_tenancy ?? false,

    // =========================================================================
    // N5B QUESTION 13: DEPOSIT RETURNED
    // =========================================================================
    deposit_returned: wizardFacts.deposit_returned ?? false,

    // =========================================================================
    // N5B QUESTION 14a: PRESCRIBED INFORMATION GIVEN
    // =========================================================================
    // Maps from Section 21 compliance question to N5B Q14a checkbox
    // Note: This is a Statement of Truth - only true if actually served
    deposit_prescribed_info_given:
      wizardFacts.prescribed_info_served ??
      facts.tenancy.prescribed_info_given ??
      undefined,

    // =========================================================================
    // N5B ATTACHMENT CHECKBOXES - A, B, B1 (Trust-based document confirmations)
    // =========================================================================
    // These are now based on user confirmations that they HAVE the documents
    // to attach, rather than requiring file uploads.
    tenancy_agreement_uploaded:
      wizardFacts.has_tenancy_agreement_copy === true ||
      facts.evidence.tenancy_agreement_uploaded ||
      undefined,
    notice_copy_available:
      wizardFacts.has_section21_notice_copy === true ||
      wizardFacts.notice_copy_available ||
      wizardFacts.notice_uploaded ||
      undefined,
    service_proof_available:
      wizardFacts.has_proof_of_service === true ||
      wizardFacts.service_proof_available ||
      wizardFacts.proof_of_service_uploaded ||
      undefined,

    // =========================================================================
    // N5B ATTACHMENT CHECKBOXES - E, F, G (Trust-based document confirmations)
    // =========================================================================
    // These are now based on user confirmations that they HAVE the documents
    // to attach. The user confirms they will attach these to the N5B form.
    // Legacy: Also check for actual file uploads for backwards compatibility.
    deposit_certificate_uploaded:
      wizardFacts.has_deposit_certificate_copy === true ||
      hasUploadForCategory(
        (wizardFacts as any)?.evidence?.files,
        EvidenceCategory.DEPOSIT_PROTECTION_CERTIFICATE
      ),
    epc_uploaded:
      wizardFacts.has_epc_copy === true ||
      hasUploadForCategory(
        (wizardFacts as any)?.evidence?.files,
        EvidenceCategory.EPC
      ),
    gas_safety_uploaded:
      wizardFacts.has_gas_certificate_copy === true ||
      hasUploadForCategory(
        (wizardFacts as any)?.evidence?.files,
        EvidenceCategory.GAS_SAFETY_CERTIFICATE
      ),
    // P0 FIX: How to Rent attachment checkbox (H) was missing
    how_to_rent_uploaded:
      wizardFacts.has_how_to_rent_copy === true ||
      hasUploadForCategory(
        (wizardFacts as any)?.evidence?.files,
        EvidenceCategory.HOW_TO_RENT_PROOF
      ),

    // =========================================================================
    // COMPLIANCE FLAGS (kept for other N5B questions, NOT for attachment boxes)
    // =========================================================================
    // These are used for N5B questions about whether documents were PROVIDED to tenant
    // (e.g., "Was EPC provided to tenant?") - NOT for attachment checkboxes
    epc_provided: facts.compliance.epc_provided || wizardFacts.epc_provided || undefined,
    gas_safety_provided: facts.compliance.gas_safety_cert_provided || wizardFacts.gas_certificate_provided || undefined,
    how_to_rent_provided: wizardFacts.how_to_rent_provided || undefined,

    // =========================================================================
    // N5B QUESTIONS 9a-9g: AST VERIFICATION (Statement of Truth - MANDATORY)
    // All questions now use POSITIVE framing matching the N5B form directly:
    // - Q9a: Yes = tenancy after 28 Feb 1997 (good for AST)
    // - Q9b-Q9g: Yes = disqualifying condition exists (bad for AST)
    // =========================================================================
    n5b_q9a_after_feb_1997: wizardFacts.n5b_q9a_after_feb_1997 ?? undefined,
    n5b_q9b_has_notice_not_ast: wizardFacts.n5b_q9b_has_notice_not_ast ?? undefined,
    n5b_q9c_has_exclusion_clause: wizardFacts.n5b_q9c_has_exclusion_clause ?? undefined,
    n5b_q9d_is_agricultural_worker: wizardFacts.n5b_q9d_is_agricultural_worker ?? undefined,
    n5b_q9e_is_succession_tenancy: wizardFacts.n5b_q9e_is_succession_tenancy ?? undefined,
    n5b_q9f_was_secure_tenancy: wizardFacts.n5b_q9f_was_secure_tenancy ?? undefined,
    n5b_q9g_is_schedule_10: wizardFacts.n5b_q9g_is_schedule_10 ?? undefined,

    // =========================================================================
    // N5B QUESTIONS 15-18: COMPLIANCE DATES
    // =========================================================================
    // Note: These fields come from wizard facts. CaseFacts schema doesn't have
    // these new N5B-specific fields yet. Use wizardFacts only.
    // Q15: EPC date
    epc_provided_date: wizardFacts.epc_provided_date || undefined,
    // Q16-17: Gas safety
    has_gas_at_property: wizardFacts.has_gas_at_property ?? true, // Default true for most properties
    gas_safety_before_occupation: wizardFacts.gas_safety_before_occupation || undefined,
    gas_safety_before_occupation_date: wizardFacts.gas_safety_before_occupation_date || undefined,
    gas_safety_check_date:
      wizardFacts.gas_safety_check_date ||
      facts.compliance.gas_safety_cert_date || // Use existing cert_date as fallback
      undefined,
    gas_safety_served_date: wizardFacts.gas_safety_served_date || undefined,
    // Q18: How to Rent
    how_to_rent_date: wizardFacts.how_to_rent_date || undefined,
    how_to_rent_method: wizardFacts.how_to_rent_method || undefined,

    // =========================================================================
    // N5B QUESTION 19: TENANT FEES ACT 2019
    // Q19 uses POSITIVE framing: "Has unreturned prohibited payment been taken?"
    // Yes = problem (blocks S21), No = compliant
    // Q19b (holding deposit) is informational only - no red flag for either answer
    // =========================================================================
    n5b_q19_has_unreturned_prohibited_payment: wizardFacts.n5b_q19_has_unreturned_prohibited_payment ?? false,
    n5b_q19b_holding_deposit: wizardFacts.n5b_q19b_holding_deposit ?? false,

    // =========================================================================
    // N5B QUESTION 20: PAPER DETERMINATION CONSENT
    // =========================================================================
    n5b_q20_paper_determination: wizardFacts.n5b_q20_paper_determination ?? undefined,

    // =========================================================================
    // N5B DEFENDANT SERVICE ADDRESS
    // =========================================================================
    defendant_service_address_same_as_property:
      wizardFacts.defendant_service_address_same_as_property ?? true,
    defendant_service_address_line1:
      wizardFacts.defendant_service_address_same_as_property === false
        ? wizardFacts.defendant_service_address_line1
        : facts.property.address_line1,
    defendant_service_address_town:
      wizardFacts.defendant_service_address_same_as_property === false
        ? wizardFacts.defendant_service_address_town
        : facts.property.city,
    defendant_service_address_postcode:
      wizardFacts.defendant_service_address_same_as_property === false
        ? wizardFacts.defendant_service_address_postcode
        : facts.property.postcode,

    // =========================================================================
    // N5 CHECKBOX FLAG DERIVATION
    // =========================================================================
    // These flags control checkboxes and conditional sections in the N5 form.
    // They must be derived from the claim type and case data.
    // =========================================================================

    // Property type - always true for residential tenancies (AST)
    property_is_dwelling: true,

    // Claim type flags - derived from claim_type for checkbox rendering
    ground_section_8: claimType === 'section_8',
    ground_section_21: claimType === 'section_21',

    // Arrears flags - controls arrears sections and "claiming rent arrears" checkbox
    rent_arrears: !!(
      wizardFacts.total_arrears ||
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.total_arrears
    ),
    claiming_rent_arrears: !!(
      wizardFacts.total_arrears ||
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.total_arrears
    ),
  } as CaseData;
}

function buildScotlandGrounds(
  facts: CaseFacts,
  wizardFacts: any
): ScotlandCaseData['grounds'] {
  const selections =
    (wizardFacts && wizardFacts.scotland_ground_codes) ||
    (facts as any).scotland_ground_codes ||
    facts.issues.section8_grounds.selected_grounds ||
    [];
  const explanation =
    (wizardFacts && wizardFacts.scotland_ground_explanation) ||
    ((facts as any).scotland_ground_explanation as string);

  return selections.map((selection: string) => {
    const { code, title } = parseGround(selection);
    return {
      code,
      title,
      particulars: explanation || '',
    };
  });
}

function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

function buildScotlandEvictionCase(caseId: string, data: ScotlandCaseData): EvictionCase {
  return {
    case_id: caseId,
    jurisdiction: 'scotland',
    case_type: 'rent_arrears',
    case_summary: '',
    landlord_full_name: data.landlord_full_name,
    landlord_2_name: data.landlord_2_name,
    landlord_address: data.landlord_address,
    landlord_address_postcode: data.landlord_postcode,
    landlord_phone: data.landlord_phone,
    landlord_email: data.landlord_email,
    tenant_full_name: data.tenant_full_name,
    tenant_2_name: data.tenant_2_name,
    property_address: data.property_address,
    property_address_postcode: data.property_postcode,
    tenancy_start_date: data.tenancy_start_date,
    tenancy_type: 'private_residential',
    rent_amount: data.rent_amount,
    rent_frequency: data.rent_frequency,
    payment_day: data.payment_day || 1,
    grounds: data.grounds.map((g) => ({
      code: g.code,
      title: g.title,
      particulars: g.particulars,
    })),
    deposit_amount: data.deposit_amount,
    deposit_scheme_name: (data.deposit_scheme_name as any) || (data.deposit_scheme as any),
    deposit_reference: data.deposit_reference,
    landlord_registration_number: data.landlord_registration_number,
  } as EvictionCase;
}

export function wizardFactsToEnglandWalesEviction(
  caseId: string,
  wizardFacts: any
): { evictionCase: EvictionCase; caseData: CaseData } {
  const facts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
  const evictionRoute = wizardFacts.eviction_route || wizardFacts.notice_type || facts.notice.notice_type;
  const { evictionCase, caseType } = buildEvictionCaseFromFacts(caseId, facts, evictionRoute);
  const caseData = buildCaseData(facts, evictionCase, caseType, wizardFacts);

  return { evictionCase, caseData };
}

export function wizardFactsToScotlandEviction(
  caseId: string,
  wizardFacts: any
): { scotlandCaseData: ScotlandCaseData } {
  const facts = wizardFactsToCaseFacts(wizardFacts) as CaseFacts;
  const noticeDate =
    wizardFacts.notice_served_date || wizardFacts.notice_date || facts.notice.notice_date || new Date().toISOString().split('T')[0];
  const leavingDate =
    wizardFacts.notice_expiry_date || facts.notice.expiry_date || addDays(new Date(noticeDate), 84);

  const scotlandCaseData: ScotlandCaseData = {
    landlord_full_name: facts.parties.landlord.name || '',
    landlord_2_name: facts.parties.landlord.co_claimant || undefined,
    landlord_address: buildAddress(
      facts.parties.landlord.address_line1,
      facts.parties.landlord.address_line2,
      facts.parties.landlord.city,
      facts.parties.landlord.postcode
    ),
    landlord_postcode: facts.parties.landlord.postcode || undefined,
    landlord_phone: facts.parties.landlord.phone || undefined,
    landlord_email: facts.parties.landlord.email || undefined,
    landlord_registration_number:
      wizardFacts.landlord_registration_number || (wizardFacts as any).landlord_registration_number || undefined,
    tenant_full_name: facts.parties.tenants[0]?.name || '',
    tenant_2_name: facts.parties.tenants[1]?.name || undefined,
    property_address: buildAddress(
      facts.property.address_line1,
      facts.property.address_line2,
      facts.property.city,
      facts.property.postcode
    ),
    property_postcode: facts.property.postcode || undefined,
    tenancy_start_date: facts.tenancy.start_date || '',
    rent_amount: facts.tenancy.rent_amount || 0,
    rent_frequency: normaliseFrequency(facts.tenancy.rent_frequency),
    payment_day: (facts.tenancy.rent_due_day || facts.money_claim.payment_day || 1) as number,
    notice_date: noticeDate,
    leaving_date: leavingDate,
    grounds: buildScotlandGrounds(facts, wizardFacts),
    deposit_amount: facts.tenancy.deposit_amount || undefined,
    deposit_scheme: (facts.tenancy.deposit_scheme_name as any) || undefined,
    deposit_reference: facts.tenancy.deposit_reference || undefined,
    deposit_scheme_name:
      (wizardFacts.deposit_scheme_name as any) || (facts.tenancy.deposit_scheme_name as any) || undefined,
  };

  return { scotlandCaseData };
}

export { buildScotlandEvictionCase };
