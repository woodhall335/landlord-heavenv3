import type { CaseFacts } from '@/lib/case-facts/schema';
import { wizardFactsToCaseFacts } from '@/lib/case-facts/normalize';
import type { GroundClaim, EvictionCase } from './eviction-pack-generator';
import type { CaseData } from './official-forms-filler';
import type { ScotlandCaseData } from './scotland-forms-filler';
import { GROUND_DEFINITIONS } from './section8-generator';

function buildAddress(...parts: Array<string | null | undefined>): string {
  return parts.filter(Boolean).join('\n');
}

function normaliseFrequency(
  freq: CaseFacts['tenancy']['rent_frequency']
): CaseData['rent_frequency'] {
  if (freq === 'fortnightly' || freq === 'quarterly' || freq === 'weekly' || freq === 'monthly') {
    return freq;
  }
  return 'monthly';
}

function deriveCaseType(evictionRoute: any): EvictionCase['case_type'] {
  const route = Array.isArray(evictionRoute) ? evictionRoute : [evictionRoute].filter(Boolean);
  const hasSection21 = route.some((r) => typeof r === 'string' && r.toLowerCase().includes('section 21'));
  if (hasSection21) return 'no_fault';
  return 'rent_arrears';
}

function parseGround(option: string): { code: string; codeNum: number | '14A'; title: string } {
  const match = option.match(/ground\s*([0-9a-z]+)/i);
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

    // ✅ FIX: Look up ground definition to get legal_basis and mandatory status
    const groundDef = GROUND_DEFINITIONS[codeNum];
    const legal_basis = groundDef?.legal_basis || 'Housing Act 1988, Schedule 2';
    const mandatory = groundDef?.mandatory || false;

    let particulars = '';

    if (['Ground 8', 'Ground 10', 'Ground 11'].includes(code)) {
      particulars =
        (facts.issues.section8_grounds.arrears_breakdown as string) ||
        (facts.issues.rent_arrears.total_arrears
          ? `Rent arrears outstanding: £${facts.issues.rent_arrears.total_arrears}`
          : '') ||
        '';
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
      legal_basis,  // ✅ FIX: Add legal_basis
      particulars,
      mandatory,  // ✅ FIX: Use correct mandatory status from definitions
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
    property_address: evictionCase.property_address,
    property_postcode: evictionCase.property_address_postcode,
    tenancy_start_date: evictionCase.tenancy_start_date,
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
    notice_service_method:
      wizardFacts.notice_service_method ||
      wizardFacts.service_method ||
      wizardFacts['notice_service.service_method'] ||
      facts.notice.service_method ||
      undefined,
    particulars_of_claim: facts.court.particulars_of_claim || undefined,
    total_arrears:
      wizardFacts.total_arrears ||
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.total_arrears ||
      undefined,

    // ✅ FIXED: removed invalid amount_owing access
    arrears_at_notice_date:
      wizardFacts.rent_arrears_amount ||
      facts.issues.rent_arrears.arrears_at_notice_date ||
      facts.issues.rent_arrears.total_arrears ||
      undefined,

    court_fee: facts.court.claim_amount_costs || undefined,
    solicitor_costs: facts.court.claim_amount_other || undefined,
    deposit_amount: facts.tenancy.deposit_amount || undefined,
    deposit_scheme: (facts.tenancy.deposit_scheme_name as any) || undefined,
    deposit_protection_date: facts.tenancy.deposit_protection_date || undefined,
    deposit_reference: facts.tenancy.deposit_reference || undefined,
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
    signatory_name: evictionCase.landlord_full_name,
    signature_date: new Date().toISOString().split('T')[0],
    notice_expiry_date: wizardFacts.notice_expiry_date || facts.notice.expiry_date || undefined,
    // ✅ FIX: Map evidence upload flags for N5B attachment checkboxes
    // Only tick attachment boxes on N5B if user has actually uploaded/confirmed the document
    tenancy_agreement_uploaded: facts.evidence.tenancy_agreement_uploaded || undefined,
    notice_copy_available: wizardFacts.notice_copy_available || wizardFacts.notice_uploaded || undefined,
    service_proof_available: wizardFacts.service_proof_available || wizardFacts.proof_of_service_uploaded || undefined,
    epc_provided: facts.compliance.epc_provided || wizardFacts.epc_provided || undefined,
    gas_safety_provided: facts.compliance.gas_safety_cert_provided || wizardFacts.gas_certificate_provided || undefined,
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
