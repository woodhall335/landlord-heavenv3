/**
 * Decision Engine Types
 *
 * Type definitions for the Landlord Heaven AI decision engine that recommends
 * eviction grounds and compliance checks based on case facts.
 */

// ============================================================================
// INPUT: Case Facts
// ============================================================================

/**
 * Facts about the case collected from the landlord
 */
export interface CaseFacts {
  // Tenancy basics
  jurisdiction: 'england-wales' | 'scotland' | 'northern-ireland';
  tenancy_type?: 'AST' | 'regulated' | 'excluded' | 'lodger';
  tenancy_start_date?: string;
  tenancy_end_date?: string; // For fixed term
  is_fixed_term?: boolean;
  rent_amount_monthly?: number;
  rent_payment_period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';

  // Rent arrears
  rent_arrears?: number; // Amount in £
  rent_arrears_months?: number; // Duration in months
  current_arrears_amount?: number;
  arrears_at_notice?: boolean;
  arrears_at_hearing_likely?: boolean;
  late_payment_history?: {
    instances: number;
    months: number;
  };

  // Landlord occupation
  landlord_prior_occupation?: boolean;
  landlord_wants_to_live?: boolean;
  landlord_needs_property?: boolean;
  notice_given_at_start?: boolean; // Ground 1 notice

  // Mortgage
  mortgage_exists?: boolean;
  mortgage_predates_tenancy?: boolean;
  lender_requiring_possession?: boolean;

  // Antisocial behaviour
  antisocial_behavior?: boolean;
  antisocial_severity?: 'minor' | 'moderate' | 'serious' | 'criminal';
  antisocial_evidence_available?: boolean;
  multiple_incidents?: boolean;

  // Breach of tenancy
  breach_of_tenancy?: boolean;
  breach_type?: 'unauthorized_subletting' | 'unauthorized_pets' | 'major_damage' | 'illegal_use' | 'other';
  breach_continuing?: boolean;
  unauthorized_pets?: boolean;
  tenancy_prohibits_pets?: boolean;
  warnings_given?: boolean;

  // Property condition
  property_deteriorated?: boolean;
  deterioration_caused_by_tenant?: boolean;
  beyond_fair_wear?: boolean;
  significant_damage?: boolean;
  furniture_damaged?: boolean;
  furnished_tenancy?: boolean;
  inventory_available?: boolean;

  // Refurbishment / works
  substantial_works_planned?: boolean;
  vacant_possession_required?: boolean;
  landlord_owned_2_years?: boolean;
  planning_permission?: boolean;
  funding_secured?: boolean;

  // Section 21 compliance
  deposit_protected?: boolean;
  deposit_protection_scheme?: 'DPS' | 'MyDeposits' | 'TDS';
  prescribed_info_given?: boolean;
  how_to_rent_provided?: boolean;
  gas_safety_provided?: boolean;
  epc_provided?: boolean;
  epc_rating?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  properly_licensed?: boolean;
  license_not_required?: boolean;
  no_prohibited_fees?: boolean;
  not_retaliatory?: boolean;
  complaint_made?: boolean;
  complaint_within_6_months?: boolean;
  local_authority_notice?: boolean;

  // HMO
  is_hmo?: boolean;
  hmo_occupants?: number;
  hmo_households?: number;
  hmo_storeys?: number;
  hmo_licensed?: boolean;

  // Landlord status
  landlord_in_disrepair?: boolean;
  tenant_complained_disrepair?: boolean;
  landlord_failed_to_repair?: boolean;

  // Additional context
  [key: string]: any;
}

// ============================================================================
// OUTPUT: Recommendations
// ============================================================================

export type GroundType = 'mandatory' | 'discretionary';
export type SuccessProbability = 'very_high' | 'high' | 'medium' | 'low' | 'none';
export type Severity = 'info' | 'warning' | 'critical';

/**
 * A recommended ground for possession
 */
export interface GroundRecommendation {
  ground_number: number; // e.g., 8, 10, 14
  title: string; // e.g., "Serious rent arrears"
  type: GroundType;
  success_probability: SuccessProbability;
  notice_period_days: number;
  reasoning: string;
  required_evidence: string[];
  statute: string;
  red_flags?: RedFlag[];
}

/**
 * Section 21 recommendation
 */
export interface Section21Recommendation {
  available: boolean;
  success_probability: SuccessProbability;
  notice_period_days: number;
  reasoning: string;
  compliance_checks: ComplianceCheck[];
  red_flags?: RedFlag[];
  can_use_accelerated?: boolean;
}

/**
 * Compliance check result
 */
export interface ComplianceCheck {
  requirement: string;
  description: string;
  status: 'pass' | 'fail' | 'unknown';
  severity: Severity;
  consequence?: string;
  action_required?: string;
}

/**
 * Red flag warning
 */
export interface RedFlag {
  name: string;
  severity: Severity;
  description: string;
  consequence: string;
  blocks_grounds?: number[];
  blocks_section_21?: boolean;
  action_required: string;
}

/**
 * Timeline estimate
 */
export interface TimelineEstimate {
  route: string; // e.g., "Ground 8 - Mandatory"
  notice_period_days: number;
  court_proceedings_days: [number, number]; // Range [min, max]
  total_days: [number, number];
  notes?: string;
}

/**
 * Cost estimate
 */
export interface CostEstimate {
  court_fee: number;
  bailiff_fee: number;
  legal_costs_range: [number, number];
  total_estimated_range: [number, number];
  notes?: string;
}

/**
 * Complete decision result from the engine
 */
export interface DecisionResult {
  // Recommended approach
  recommended_route: 'section_8' | 'section_21' | 'both' | 'none';
  primary_grounds: GroundRecommendation[];
  backup_grounds: GroundRecommendation[];
  section_21?: Section21Recommendation;

  // Compliance & risks
  compliance_checks: ComplianceCheck[];
  red_flags: RedFlag[];
  overall_risk_level: 'low' | 'medium' | 'high';

  // Estimates
  timeline: TimelineEstimate;
  costs: CostEstimate;

  // Summary
  summary: string;
  next_steps: string[];
  warnings: string[];
}

// ============================================================================
// INTERNAL: Rule Engine
// ============================================================================

/**
 * A decision rule from decision_engine.yaml
 */
export interface DecisionRule {
  rule_id: string;
  name: string;
  priority: number;
  conditions: Record<string, any>;
  recommended_grounds?: {
    primary: number[];
    backup: number[];
  };
  recommended_route?: 'section_8' | 'section_21';
  success_probability: string;
  notice_period: string;
  reasoning: string;
  red_flags?: Record<string, string>;
}

/**
 * Ground definition from decision_rules.yaml
 */
export interface GroundDefinition {
  title: string;
  notice_period_days: number;
  court_type: GroundType;
  description: string;
  required_facts: string[];
  eligibility_rules: string[];
  success_probability: number;
  statute: string;
  notes?: string;
}
