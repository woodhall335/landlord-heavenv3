// =============================================================================
// WIZARD FACTS (DB Storage Format)
// =============================================================================
// This is the FLAT structure stored in case_facts.facts column.
// - Keys are MQS question IDs or flat paths like "property_address_line1"
// - Array items use dot notation: "tenants.0.full_name"
// - Special __meta field tracks product/tier information

export interface WizardFactsMeta {
  product: string | null;
  original_product: string | null;
  product_tier?: string | null;
}

export interface WizardFacts {
  __meta?: WizardFactsMeta;
  [key: string]: any; // Flat MQS keys like property_address_line1, tenants.0.full_name, etc.
}

// =============================================================================
// CASE FACTS (Domain Model)
// =============================================================================
// This is the NESTED structure used by document generators and analysis.
// Use wizardFactsToCaseFacts() from normalize.ts to convert DB data to this format.

export interface TenancyFacts {
  tenancy_type: 'ast' | 'prt' | 'ni_private' | 'unknown';
  start_date: string | null;
  end_date: string | null;
  fixed_term: boolean | null;
  fixed_term_months: number | null;
  rent_amount: number | null;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly' | 'other' | null;
  rent_due_day: number | null;
  deposit_amount: number | null;
  deposit_protected: boolean | null;
  deposit_scheme_name: string | null;
  deposit_protection_date: string | null;
}

export interface PropertyFacts {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  country: 'england-wales' | 'scotland' | 'northern-ireland' | null;
  is_hmo: boolean | null;
}

export interface PartyDetails {
  name: string | null;
  co_claimant?: string | null;
  email: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
}

export interface PartiesFacts {
  landlord: PartyDetails;
  agent: PartyDetails;
  solicitor: PartyDetails;
  tenants: PartyDetails[]; // usually one, but allow multiple
}

export interface ArrearsItem {
  period_start: string; // YYYY-MM-DD
  period_end: string; // YYYY-MM-DD
  rent_due: number;
  rent_paid: number;
}

export interface IssueFacts {
  rent_arrears: {
    has_arrears: boolean | null;
    arrears_items: ArrearsItem[];
    total_arrears: number | null;
  };
  asb: {
    has_asb: boolean | null;
    description: string | null;
    incidents: string[]; // free-text incident descriptions
  };
  other_breaches: {
    has_breaches: boolean | null;
    description: string | null;
  };
}

export interface NoticeFacts {
  notice_type: string | null; // "section_8", "section_21", "notice_to_leave", "notice_to_quit", etc.
  notice_date: string | null;
  expiry_date: string | null;
  service_method: string | null;
  served_by: string | null;
}

export interface CourtFacts {
  route: string | null; // "standard_possession", "accelerated_possession", "money_claim", "simple_procedure", etc.
  claim_amount_rent: number | null;
  claim_amount_costs: number | null;
  claim_amount_other: number | null;
  total_claim_amount: number | null;
  claimant_reference?: string | null;
  court_name?: string | null;
  particulars_of_claim?: string | null;
  n5_required: boolean | null;
  n119_required: boolean | null;
  n1_required: boolean | null;
  scotland_form3a_required: boolean | null;
  scotland_form_e_required: boolean | null;
}

export interface EvidenceFacts {
  tenancy_agreement_uploaded: boolean;
  rent_schedule_uploaded: boolean;
  bank_statements_uploaded: boolean;
  safety_certificates_uploaded: boolean;
  asb_evidence_uploaded: boolean;
  other_evidence_uploaded: boolean;
  missing_evidence_notes: string[];
}

export interface ServiceContactFacts {
  has_override?: boolean | null;
  service_name: string | null;
  service_address_line1: string | null;
  service_address_line2: string | null;
  service_city: string | null;
  service_postcode: string | null;
  service_email: string | null;
  service_phone: string | null;
}

export interface MoneyClaimFacts {
  payment_day: number | null;
  damage_claim: boolean | null;
  damage_items: Array<{ description?: string; amount?: number; evidence?: string }>;
  other_charges: Array<{ description?: string; amount?: number }>;
  charge_interest: boolean | null;
  interest_start_date: string | null;
  interest_rate: number | null;
  solicitor_costs: number | null;
  attempts_to_resolve: string | null;
  lba_sent?: boolean | null;
  lba_date?: string | null;
  lba_method?: string[] | null;
  lba_response_deadline?: string | null;
  pap_documents_sent?: string[] | null;
  tenant_responded?: boolean | null;
  tenant_response_details?: string | null;
  lba_second_sent?: boolean | null;
  lba_second_date?: string | null;
  lba_second_method?: string[] | null;
  lba_second_response_deadline?: string | null;
  pre_action_deadline_confirmation?: boolean | null;
  signatory_name?: string | null;
  signature_date?: string | null;
  sheriffdom?: string | null;
  court_jurisdiction_confirmed?: boolean | null;
  lodging_method?: string | null;
  demand_letter_date?: string | null;
  second_demand_date?: string | null;
  evidence_summary?: string | null;
  basis_of_claim?: string | null;
  arrears_schedule_confirmed?: boolean | null;
  evidence_types_available?: string[] | null;
  pap_documents_served?: boolean | null;
  pap_service_method?: string[] | null;
  pap_service_proof?: string | null;
  preferred_issue_route?: string | null;
  claim_value_band?: string | null;
  help_with_fees_needed?: boolean | null;
  enforcement_preferences?: string[] | null;
  enforcement_notes?: string | null;
}

export interface MetaFacts {
  product: string | null;
  original_product: string | null;
  product_tier?: string | null;
}

// -----------------------------------------------------------------------------
// Case health / risk scoring
// -----------------------------------------------------------------------------

export type CaseRiskLevel = 'low' | 'medium' | 'high';

export interface CaseHealth {
  contradictions: string[];
  missing_evidence: string[];
  compliance_warnings: string[];
  risk_level: CaseRiskLevel;
}

export interface CaseFacts {
  tenancy: TenancyFacts;
  property: PropertyFacts;
  parties: PartiesFacts;
  issues: IssueFacts;
  notice: NoticeFacts;
  court: CourtFacts;
  evidence: EvidenceFacts;
  service_contact: ServiceContactFacts;
  money_claim: MoneyClaimFacts;
  meta: MetaFacts;
  case_health: CaseHealth;
}

// =============================================================================
/** Factory Functions */
// =============================================================================

/**
 * Creates an empty WizardFacts object (flat DB format).
 * Use this when initializing case_facts.facts.
 */
export const createEmptyWizardFacts = (): WizardFacts => ({
  __meta: {
    product: null,
    original_product: null,
    product_tier: null,
  },
});

/**
 * Creates an empty CaseFacts object (nested domain model).
 * Use this when you need a clean slate for document generation or analysis.
 */
export const createEmptyCaseFacts = (): CaseFacts => ({
  tenancy: {
    tenancy_type: 'unknown',
    start_date: null,
    end_date: null,
    fixed_term: null,
    fixed_term_months: null,
    rent_amount: null,
    rent_frequency: null,
    rent_due_day: null,
    deposit_amount: null,
    deposit_protected: null,
    deposit_scheme_name: null,
    deposit_protection_date: null,
  },
  property: {
    address_line1: null,
    address_line2: null,
    city: null,
    postcode: null,
    country: null,
    is_hmo: null,
  },
  parties: {
    landlord: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    agent: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    solicitor: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    tenants: [],
  },
  issues: {
    rent_arrears: { has_arrears: null, arrears_items: [], total_arrears: null },
    asb: { has_asb: null, description: null, incidents: [] },
    other_breaches: { has_breaches: null, description: null },
  },
  notice: {
    notice_type: null,
    notice_date: null,
    expiry_date: null,
    service_method: null,
    served_by: null,
  },
  court: {
    route: null,
    claim_amount_rent: null,
    claim_amount_costs: null,
    claim_amount_other: null,
    total_claim_amount: null,
    claimant_reference: null,
    court_name: null,
    particulars_of_claim: null,
    n5_required: null,
    n119_required: null,
    n1_required: null,
    scotland_form3a_required: null,
    scotland_form_e_required: null,
  },
  evidence: {
    tenancy_agreement_uploaded: false,
    rent_schedule_uploaded: false,
    bank_statements_uploaded: false,
    safety_certificates_uploaded: false,
    asb_evidence_uploaded: false,
    other_evidence_uploaded: false,
    missing_evidence_notes: [],
  },
  service_contact: {
    has_override: null,
    service_name: null,
    service_address_line1: null,
    service_address_line2: null,
    service_city: null,
    service_postcode: null,
    service_email: null,
    service_phone: null,
  },
  money_claim: {
    payment_day: null,
    damage_claim: null,
    damage_items: [],
    other_charges: [],
    charge_interest: null,
    interest_start_date: null,
    interest_rate: null,
    solicitor_costs: null,
    attempts_to_resolve: null,
    lba_sent: null,
    lba_date: null,
    lba_method: null,
    lba_response_deadline: null,
    pap_documents_sent: null,
    tenant_responded: null,
    tenant_response_details: null,
    lba_second_sent: null,
    lba_second_date: null,
    lba_second_method: null,
    lba_second_response_deadline: null,
    pre_action_deadline_confirmation: null,
    signatory_name: null,
    signature_date: null,
    sheriffdom: null,
    court_jurisdiction_confirmed: null,
    lodging_method: null,
    demand_letter_date: null,
    second_demand_date: null,
    evidence_summary: null,
    basis_of_claim: null,
    arrears_schedule_confirmed: null,
    evidence_types_available: null,
    pap_documents_served: null,
    pap_service_method: null,
    pap_service_proof: null,
    preferred_issue_route: null,
    claim_value_band: null,
    help_with_fees_needed: null,
    enforcement_preferences: null,
    enforcement_notes: null,
  },
  meta: {
    product: null,
    original_product: null,
    product_tier: null,
  },
  case_health: {
    contradictions: [],
    missing_evidence: [],
    compliance_warnings: [],
    risk_level: 'low',
  },
});
