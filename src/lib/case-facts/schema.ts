// =============================================================================
// WIZARD FACTS (DB Storage Format)
// =============================================================================
// This is the FLAT structure stored in case_facts.facts column.
// - Keys are MQS question IDs or flat paths like "property_address_line1"
// - Array items use dot notation: "tenants.0.full_name"
// - Special __meta field tracks product/tier information
//
// Jurisdiction-specific fields (automatically populated from MQS v2.0.1+):
// - England/Wales: right_to_rent_check_date, how_to_rent_guide_provided, prescribed_information_served
// - Scotland: uses_model_tenancy_terms, in_rent_pressure_zone, landlord_registration, repairing_standard_compliance
// - Northern Ireland: ni_notice_period_days, fitness_standard_compliance

export interface WizardFactsMeta {
  product: string | null;
  original_product: string | null;
  product_tier?: string | null;
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
  case_id?: string | null;
}

export interface WizardFacts {
  __meta?: WizardFactsMeta;
  __smart_review?: PersistedSmartReview;
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
  usual_payment_weekday?: string | null; // e.g. "monday", "friday" - used for money claims
  deposit_amount: number | null;
  deposit_protected: boolean | null;
  deposit_scheme_name: string | null;
  deposit_protection_date: string | null;
  deposit_reference?: string | null;
  // For deposit prescribed information (England & Wales)
  prescribed_info_given?: boolean | null;
  // Deposit cap confirmation (England Section 21 only - Tenant Fees Act 2019)
  // Required when deposit_amount exceeds legal cap (5 weeks rent, or 6 weeks if annual rent > £50k)
  // Confirms landlord has refunded/reduced deposit to within legal limit
  deposit_reduced_to_legal_cap_confirmed?: boolean | null;
}

export interface PropertyAddress {
  line1: string | null;
  line2: string | null;
  city: string | null;
  postcode: string | null;
}

export interface PropertyFacts {
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postcode: string | null;
  country: 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
  is_hmo: boolean | null;
  // Legacy/alternative nested address shape used by some bundles/case-intel
  address?: PropertyAddress;
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
  period_end: string;   // YYYY-MM-DD
  rent_due: number;
  rent_paid: number;
  // Some modules work directly with "amount_owed"
  amount_owed?: number | null;
}

export interface IssueFacts {
  rent_arrears: {
    has_arrears: boolean | null;
    arrears_items: ArrearsItem[];
    total_arrears: number | null;
    arrears_at_notice_date?: number | null;
    // Scotland pre-action requirements
    pre_action_confirmed: boolean | null; // for Scotland Notice to Leave
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
  // Alias for "other_breaches" used by some intel/evidence modules
  breaches?: {
    has_breaches: boolean | null;
    description: string | null;
  };
  // England & Wales Section 8 ground-specific details
  section8_grounds: {
    selected_grounds: string[] | null; // e.g. ["Ground 8", "Ground 14"]
    arrears_breakdown: string | null; // detailed arrears narrative for Grounds 8/10/11
    incident_log: string | null; // ASB/nuisance incidents for Ground 14
    breach_details: string | null; // tenancy breach details for Ground 12
    damage_schedule: string | null; // damage/deterioration for Grounds 13/15
    false_statement_details: string | null; // for Ground 17
  };
  // N5B AST verification (for accelerated possession)
  ast_verification: {
    is_ast: boolean | null;
    not_agricultural: boolean | null;
    not_business: boolean | null;
    not_long_lease: boolean | null;
    not_former_secure: boolean | null;
    not_excluded: boolean | null;
    standard_rent: boolean | null; // annual rent under threshold
  };
}

export interface NoticeFacts {
  notice_type: string | null; // "section_8", "section_21", "notice_to_leave", "notice_to_quit", etc.
  notice_date: string | null;
  expiry_date: string | null;
  service_method: string | null;
  served_by: string | null;
  // Date the notice was actually served (distinct from notice_date in some flows)
  service_date?: string | null;
}

export interface CourtFacts {
  route: string | null; // "standard_possession", "accelerated_possession", "money_claim", "simple_procedure", etc.
  claim_amount_rent: number | null;
  claim_amount_costs: number | null;
  claim_amount_other: number | null;
  total_claim_amount: number | null;
  claimant_reference?: string | null;
  court_name?: string | null;
  court_address?: string | null;
  court_postcode?: string | null;
  particulars_of_claim?: string | null;
  n5_required: boolean | null;
  n119_required: boolean | null;
  n1_required: boolean | null;
  scotland_form3a_required: boolean | null;
  scotland_form_e_required: boolean | null;
}

export interface EvidenceFacts {
  tenancy_agreement_uploaded: boolean;
  tenancy_agreement_description?: string | null;
  rent_schedule_uploaded: boolean;
  correspondence_uploaded: boolean;
  correspondence_description?: string | null;
  damage_photos_uploaded: boolean;
  authority_letters_uploaded: boolean;
  bank_statements_uploaded: boolean;
  bank_statements_description?: string | null;
  other_evidence_uploaded: boolean;
  notice_service_description?: string | null;
  // Legacy / compatibility flags – keep for older flows but mirror into new categories
  safety_certificates_uploaded?: boolean;
  asb_evidence_uploaded?: boolean;
  asb_logs_uploaded?: boolean;
  photos_uploaded?: boolean;
  missing_evidence_notes: string[];
  analysis?: Record<string, any>;
  // Evidence files array - dynamically populated from wizard facts
  files?: Array<{
    id?: string;
    category?: string;
    file_name?: string;
    [key: string]: any;
  }>;
}

export interface ServiceContactFacts {
  has_override?: boolean | null;
  service_name: string | null;
  service_address_line1: string | null;
  service_address_line2: string | null;
  service_city: string | null;
   service_address_county?: string | null;
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
  // Narrowed to the actual values the rest of the system expects
  basis_of_claim?: 'rent_arrears' | 'damages' | 'both' | null;
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
  // Additional narrative fields for richer AI drafting
  other_charges_notes?: string | null; // from ArrearsSection
  other_costs_notes?: string | null; // from DamagesSection
  other_amounts_summary?: string | null; // from ClaimDetailsSection
}

export interface MetaFacts {
  product: string | null;
  original_product: string | null;
  product_tier?: string | null;
  jurisdiction?: 'england' | 'wales' | 'scotland' | 'northern-ireland' | null;
  case_id?: string | null;
}

// =============================================================================
// Smart Review Persistence Types
// =============================================================================

/**
 * Persisted Smart Review warning (stripped to essential fields for storage).
 * Full warning type is in evidence/warnings.ts.
 */
export interface PersistedSmartReviewWarning {
  code: string;
  severity: 'info' | 'warning' | 'blocker';
  title: string;
  message: string;
  fields: string[];
  relatedUploads: string[];
  suggestedUserAction: string;
  confidence?: number;
  comparison?: {
    wizardValue: any;
    extractedValue: any;
    source?: string;
  };
}

/**
 * Persisted Smart Review run metadata.
 * Stored in case_facts.facts.__smart_review to survive refresh.
 */
export interface PersistedSmartReview {
  /** When this run occurred (ISO timestamp) */
  ranAt: string;
  /** All warnings from the most recent run */
  warnings: PersistedSmartReviewWarning[];
  /** Summary counts from the run */
  summary: {
    documentsProcessed: number;
    documentsCached: number;
    documentsSkipped: number;
    documentsTimedOut: number;
    pagesProcessed: number;
    warningsTotal: number;
    warningsBlocker: number;
    warningsWarning: number;
    warningsInfo: number;
  };
  /** Limits that were applied */
  limitsApplied?: {
    maxFilesPerRun: number;
    maxPagesPerPdf: number;
    maxTotalPages: number;
    filesExceededLimit?: boolean;
    pagesExceededLimit?: boolean;
  };
  /** If Smart Review was skipped */
  skipped?: {
    reason: string;
    code: string;
  };
  /** Total cost in USD (for internal tracking) */
  costUsd?: number;
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

export interface ComplianceFacts {
  gas_safety_cert_provided?: boolean | null;
  gas_safety_cert_date?: string | null;
  gas_safety_cert_expiry?: string | null;
  epc_provided?: boolean | null;
  epc_date?: string | null;
  how_to_rent_given?: boolean | null;
  how_to_rent_date?: string | null;
  prescribed_info_date?: string | null;
  eicr_provided?: boolean | null;
  eicr_date?: string | null;
  eicr_satisfactory?: boolean | null;
}

// =============================================================================
// GROUND-SPECIFIC FACTS (Section 8)
// =============================================================================

export interface Ground8Facts {
  arrears_at_notice: number | null;
  arrears_current: number | null;
  last_payment_date: string | null;
  last_payment_amount: number | null;
  payment_demands_sent: string | null;
  tenant_response: string | null;
}

export interface Ground10Facts {
  arrears_amount: number | null;
  arrears_history: string | null;
  attempts_to_recover: string | null;
}

export interface Ground11Facts {
  pattern_description: string | null;
  late_payment_dates: string | null;
  warnings_issued: string | null;
}

export interface Ground12Facts {
  breach_type: string[] | null;
  tenancy_clause: string | null;
  breach_dates: string | null;
  breach_evidence: string | null;
  warnings_issued: string | null;
}

export interface Ground13Facts {
  damage_description: string | null;
  damage_discovered_date: string | null;
  damage_cost: number | null;
  evidence_available: string | null;
  tenant_notified: boolean | null;
  tenant_response: string | null;
}

export interface Ground14Facts {
  behaviour_type: string[] | null;
  incident_count: number | null;
  incidents_description: string | null;
  affected_parties: string | null;
  witnesses: boolean | null;
  witness_names: string | null;
  police_involved: boolean | null;
  police_reference: string | null;
  council_involved: boolean | null;
  council_reference: string | null;
  warnings_issued: string | null;
}

export interface Ground15Facts {
  furniture_damaged: string | null;
  damage_cost: number | null;
  inventory_available: boolean | null;
  evidence_description: string | null;
}

export interface Ground17Facts {
  statement_made: string | null;
  statement_date: string | null;
  how_statement_made: string | null;
  true_facts: string | null;
  reliance_on_statement: string | null;
  discovery_date: string | null;
  discovery_method: string | null;
}

// =============================================================================
// RISK INDICATORS
// =============================================================================

export interface RiskFacts {
  known_tenant_defences: string | null;
  previous_court_proceedings: boolean | null;
  previous_proceedings_details: string | null;
  disrepair_complaints: boolean | null;
  disrepair_complaint_date: string | null;
  disrepair_issues_list: string | null;
  tenant_vulnerability: boolean | null;
  tenant_vulnerability_details: string | null;
}

// =============================================================================
// COMMUNICATION TIMELINE
// =============================================================================

export interface CommunicationEntry {
  date: string | null;
  method: string | null;
  summary: string | null;
}

export interface CommunicationTimelineFacts {
  entries: CommunicationEntry[];
  narrative: string | null;
}

// =============================================================================
// SCOTLAND PRE-ACTION PROTOCOL
// =============================================================================

export interface ScotlandPreActionFacts {
  rent_statement_sent: boolean | null;
  rent_statement_date: string | null;
  advice_signposting: boolean | null;
  signposted_to: string[] | null;
  reasonable_time_given: boolean | null;
  time_given_details: string | null;
  payment_plan_offered: boolean | null;
  payment_plan_details: string | null;
  housing_benefit_check: boolean | null;
  housing_benefit_details: string | null;
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
  compliance: ComplianceFacts;
  // Ground-specific details (Section 8)
  ground_8?: Ground8Facts;
  ground_10?: Ground10Facts;
  ground_11?: Ground11Facts;
  ground_12?: Ground12Facts;
  ground_13?: Ground13Facts;
  ground_14?: Ground14Facts;
  ground_15?: Ground15Facts;
  ground_17?: Ground17Facts;
  // Risk assessment data
  risk?: RiskFacts;
  // Communication timeline
  communication_timeline?: CommunicationTimelineFacts;
  // Scotland pre-action protocol
  scotland_pre_action?: ScotlandPreActionFacts;
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
    jurisdiction: null,
    case_id: null,
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
    deposit_reference: null,
    prescribed_info_given: null,
    deposit_reduced_to_legal_cap_confirmed: null,
  },
  property: {
    address_line1: null,
    address_line2: null,
    city: null,
    postcode: null,
    country: null,
    is_hmo: null,
    address: {
      line1: null,
      line2: null,
      city: null,
      postcode: null,
    },
  },
  parties: {
    landlord: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    agent: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    solicitor: { name: null, email: null, phone: null, address_line1: null, address_line2: null, city: null, postcode: null },
    tenants: [],
  },
  issues: {
    rent_arrears: {
      has_arrears: null,
      arrears_items: [],
      total_arrears: null,
      arrears_at_notice_date: null,
      pre_action_confirmed: null,
    },
    asb: { has_asb: null, description: null, incidents: [] },
    other_breaches: { has_breaches: null, description: null },
    breaches: { has_breaches: null, description: null },
    section8_grounds: {
      selected_grounds: null,
      arrears_breakdown: null,
      incident_log: null,
      breach_details: null,
      damage_schedule: null,
      false_statement_details: null,
    },
    ast_verification: {
      is_ast: null,
      not_agricultural: null,
      not_business: null,
      not_long_lease: null,
      not_former_secure: null,
      not_excluded: null,
      standard_rent: null,
    },
  },
  notice: {
    notice_type: null,
    notice_date: null,
    expiry_date: null,
    service_method: null,
    served_by: null,
    service_date: null,
  },
  court: {
    route: null,
    claim_amount_rent: null,
    claim_amount_costs: null,
    claim_amount_other: null,
    total_claim_amount: null,
    claimant_reference: null,
    court_name: null,
    court_address: null,
    court_postcode: null,
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
    correspondence_uploaded: false,
    damage_photos_uploaded: false,
    authority_letters_uploaded: false,
    bank_statements_uploaded: false,
    other_evidence_uploaded: false,
    // Legacy flags (maintain for backward compatibility)
    safety_certificates_uploaded: false,
    asb_evidence_uploaded: false,
    asb_logs_uploaded: false,
    photos_uploaded: false,
    missing_evidence_notes: [],
    analysis: {},
  },
  service_contact: {
    has_override: null,
    service_name: null,
    service_address_line1: null,
    service_address_line2: null,
    service_city: null,
    service_address_county: null,
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
    jurisdiction: null,
    case_id: null,
  },
  case_health: {
    contradictions: [],
    missing_evidence: [],
    compliance_warnings: [],
    risk_level: 'low',
  },
  compliance: {
    gas_safety_cert_provided: null,
    gas_safety_cert_date: null,
    gas_safety_cert_expiry: null,
    epc_provided: null,
    epc_date: null,
    how_to_rent_given: null,
    how_to_rent_date: null,
    prescribed_info_date: null,
    eicr_provided: null,
    eicr_date: null,
    eicr_satisfactory: null,
  },
  // Ground-specific details (Section 8)
  ground_8: {
    arrears_at_notice: null,
    arrears_current: null,
    last_payment_date: null,
    last_payment_amount: null,
    payment_demands_sent: null,
    tenant_response: null,
  },
  ground_10: {
    arrears_amount: null,
    arrears_history: null,
    attempts_to_recover: null,
  },
  ground_11: {
    pattern_description: null,
    late_payment_dates: null,
    warnings_issued: null,
  },
  ground_12: {
    breach_type: null,
    tenancy_clause: null,
    breach_dates: null,
    breach_evidence: null,
    warnings_issued: null,
  },
  ground_13: {
    damage_description: null,
    damage_discovered_date: null,
    damage_cost: null,
    evidence_available: null,
    tenant_notified: null,
    tenant_response: null,
  },
  ground_14: {
    behaviour_type: null,
    incident_count: null,
    incidents_description: null,
    affected_parties: null,
    witnesses: null,
    witness_names: null,
    police_involved: null,
    police_reference: null,
    council_involved: null,
    council_reference: null,
    warnings_issued: null,
  },
  ground_15: {
    furniture_damaged: null,
    damage_cost: null,
    inventory_available: null,
    evidence_description: null,
  },
  ground_17: {
    statement_made: null,
    statement_date: null,
    how_statement_made: null,
    true_facts: null,
    reliance_on_statement: null,
    discovery_date: null,
    discovery_method: null,
  },
  risk: {
    known_tenant_defences: null,
    previous_court_proceedings: null,
    previous_proceedings_details: null,
    disrepair_complaints: null,
    disrepair_complaint_date: null,
    disrepair_issues_list: null,
    tenant_vulnerability: null,
    tenant_vulnerability_details: null,
  },
  communication_timeline: {
    entries: [],
    narrative: null,
  },
  scotland_pre_action: {
    rent_statement_sent: null,
    rent_statement_date: null,
    advice_signposting: null,
    signposted_to: null,
    reasonable_time_given: null,
    time_given_details: null,
    payment_plan_offered: null,
    payment_plan_details: null,
    housing_benefit_check: null,
    housing_benefit_details: null,
  },
});
