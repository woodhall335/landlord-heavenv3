/**
 * Section 8 Notice Generator
 *
 * Generates Housing Act 1988 Section 8 notices seeking possession
 * based on one or more grounds from Schedule 2.
 */

import { generateDocument, GeneratedDocument } from './generator';
import {
  calculateSection8ExpiryDate,
  validateSection8ExpiryDate,
  type Section8DateParams,
} from './notice-date-calculator';

// ============================================================================
// TYPES
// ============================================================================

export interface Section8Ground {
  code: number; // 1-17
  title: string;
  legal_basis: string;
  particulars: string;
  supporting_evidence?: string;
  mandatory: boolean;
}

export interface Section8NoticeData {
  // Landlord
  landlord_full_name: string;
  landlord_address: string;
  landlord_email?: string;
  landlord_phone?: string;
  landlord_2_name?: string;

  // Tenant
  tenant_full_name: string;
  tenant_2_name?: string;
  property_address: string;

  // Tenancy
  tenancy_start_date: string;
  fixed_term?: boolean;
  fixed_term_expired?: boolean;
  fixed_term_end_date?: string;
  rent_amount: number;
  rent_frequency: 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly';
  payment_date: number; // Day of month/week
  rent_period_description?: string;

  // Grounds
  grounds: Section8Ground[];

  // Ground-specific data
  ground_1_claimed?: boolean;
  landlord_previous_residence?: boolean;
  landlord_residence_start?: string;
  landlord_residence_end?: string;
  landlord_residence_evidence?: string;
  landlord_now_needs_property?: boolean;
  reason_for_needing_property?: string;
  notice_given_before_tenancy?: boolean;
  notice_date?: string;

  ground_2_claimed?: boolean;
  lender_name?: string;
  mortgage_date?: string;
  lender_demand_letter_attached?: boolean;

  ground_8_claimed?: boolean;
  arrears_at_notice_date?: number;
  current_arrears_amount?: number;
  arrears_duration_months?: number;
  arrears_breakdown?: Array<{
    period: string;
    amount_due: number;
    amount_paid: number;
    balance: number;
  }>;
  total_arrears?: number;
  last_payment_date?: string;
  last_payment_amount?: number;

  ground_10_claimed?: boolean;
  current_arrears?: number;
  arrears_explanation?: string;

  ground_11_claimed?: boolean;
  total_late_payments?: number;
  total_payments?: number;
  late_payment_instances?: Array<{
    due_date: string;
    payment_date: string;
    days_late: number;
    amount: number;
  }>;
  late_payment_pattern_description?: string;

  ground_12_claimed?: boolean;
  tenancy_clause_breached?: string;
  breach_type?: string;
  breach_description?: string;
  breach_start_date?: string;
  breach_ongoing?: boolean;
  breach_remedied?: boolean;
  warnings_given?: Array<{
    date: string;
    method: string;
    description: string;
  }>;

  ground_13_claimed?: boolean;
  property_condition_start?: string;
  property_condition_current?: string;
  deterioration_description?: string;
  deterioration_areas?: string[];
  estimated_repair_cost?: number;
  other_resident_caused_damage?: boolean;
  inventory_report_attached?: boolean;
  photographic_evidence_attached?: boolean;

  ground_14_claimed?: boolean;
  nuisance_by_visitor?: boolean;
  affected_party_description?: string;
  nuisance_type?: string;
  nuisance_description?: string;
  incident_log?: Array<{
    date: string;
    time?: string;
    description: string;
    witnesses?: string[];
  }>;
  police_involvement?: boolean;
  police_call_count?: number;
  police_crime_numbers?: string[];
  council_complaints?: boolean;
  council_name?: string;
  council_reference?: string;
  witness_statements_attached?: boolean;

  ground_14a_claimed?: boolean;
  relationship_type?: string;
  partner_who_left?: string;
  date_partner_left?: string;
  violence_description?: string;
  evidence_of_violence_attached?: boolean;
  evidence_types?: string;

  ground_15_claimed?: boolean;
  furniture_condition_start?: string;
  furniture_condition_current?: string;
  other_resident_damaged?: boolean;
  damaged_items?: Array<{
    item: string;
    original_condition: string;
    current_condition: string;
    replacement_cost: number;
  }>;
  total_replacement_cost?: number;

  ground_17_claimed?: boolean;
  statement_made_in?: string;
  false_statement_description?: string;
  true_facts?: string;
  statement_materiality?: string;
  evidence_of_falsehood_attached?: boolean;

  // Notice details
  service_date?: string; // Date notice is served (defaults to today)
  notice_period_days: number;
  earliest_possession_date: string;
  earliest_possession_date_explanation?: string; // How we calculated this
  any_mandatory_ground: boolean;
  any_discretionary_ground: boolean;

  // Help information
  council_phone?: string;

  // Deposit
  deposit_protected?: boolean;
  deposit_amount?: number;
  deposit_scheme?: string;
  deposit_reference?: string;

  // Benefits
  tenant_receives_benefits?: boolean;
  benefit_type?: string;
  arrears_include_benefit_period?: boolean;
}

// ============================================================================
// GROUND DEFINITIONS
// ============================================================================

export const GROUND_DEFINITIONS: Record<number | '14A', Omit<Section8Ground, 'particulars' | 'supporting_evidence'>> = {
  1: {
    code: 1,
    title: 'Landlord previously occupied as only or principal home',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 1',
    mandatory: true,
  },
  2: {
    code: 2,
    title: 'Mortgage lender requires possession',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 2',
    mandatory: true,
  },
  3: {
    code: 3,
    title: 'Out of season holiday letting',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 3',
    mandatory: true,
  },
  4: {
    code: 4,
    title: 'Out of season student letting',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 4',
    mandatory: true,
  },
  5: {
    code: 5,
    title: 'Property required for minister of religion',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 5',
    mandatory: true,
  },
  6: {
    code: 6,
    title: 'Intention to demolish or reconstruct',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 6',
    mandatory: true,
  },
  7: {
    code: 7,
    title: 'Death of periodic tenant (within 12 months)',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 7',
    mandatory: true,
  },
  8: {
    code: 8,
    title: 'Serious rent arrears (8 weeks/2 months)',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 8',
    mandatory: true,
  },
  10: {
    code: 10,
    title: 'Rent arrears (some arrears)',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 10',
    mandatory: false,
  },
  11: {
    code: 11,
    title: 'Persistent delay in paying rent',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 11',
    mandatory: false,
  },
  12: {
    code: 12,
    title: 'Breach of tenancy obligation',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 12',
    mandatory: false,
  },
  13: {
    code: 13,
    title: 'Deterioration of dwelling',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 13',
    mandatory: false,
  },
  14: {
    code: 14,
    title: 'Nuisance or annoyance to neighbours',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14',
    mandatory: false,
  },
  '14A': {
    code: 14,
    title: 'Domestic violence',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 14A',
    mandatory: false,
  },
  15: {
    code: 15,
    title: 'Deterioration of furniture',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 15',
    mandatory: false,
  },
  17: {
    code: 17,
    title: 'False statement induced grant of tenancy',
    legal_basis: 'Housing Act 1988, Schedule 2, Ground 17',
    mandatory: false,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the earliest possession date based on notice period
 * @deprecated Use calculateSection8ExpiryDate from notice-date-calculator instead
 */
export function calculateEarliestPossessionDate(
  serviceDate: string,
  noticePeriodDays: number
): string {
  const date = new Date(serviceDate);
  date.setDate(date.getDate() + noticePeriodDays);
  return date.toISOString().split('T')[0];
}

/**
 * Determine notice period based on grounds
 * @deprecated Use calculateSection8NoticePeriod from notice-date-calculator instead
 */
export function determineNoticePeriod(grounds: Section8Ground[]): number {
  // If any ground 14 or 14A, can use 2 weeks
  const hasGround14 = grounds.some((g) => g.code === 14);
  if (hasGround14) return 14;

  // Mandatory grounds: 2 weeks
  const hasMandatory = grounds.some((g) => g.mandatory);
  if (hasMandatory) return 14;

  // Discretionary grounds: 2 months (60 days) recommended
  return 60;
}

/**
 * Build a Section 8 ground object
 */
export function buildGround(
  groundNumber: number,
  particulars: string,
  supportingEvidence?: string
): Section8Ground {
  const definition = GROUND_DEFINITIONS[groundNumber];
  if (!definition) {
    throw new Error(`Invalid ground number: ${groundNumber}`);
  }

  return {
    ...definition,
    particulars,
    supporting_evidence: supportingEvidence,
  };
}

// ============================================================================
// GENERATOR
// ============================================================================

/**
 * Generate a Section 8 notice
 */
export async function generateSection8Notice(
  data: Section8NoticeData,
  isPreview = false
): Promise<GeneratedDocument> {
  // Validate required fields
  if (!data.landlord_full_name) {
    throw new Error('landlord_full_name is required');
  }
  if (!data.tenant_full_name) {
    throw new Error('tenant_full_name is required');
  }
  if (!data.property_address) {
    throw new Error('property_address is required');
  }
  if (!data.grounds || data.grounds.length === 0) {
    throw new Error('At least one ground is required');
  }

  // Auto-calculate earliest possession date if not provided or validate if provided
  const serviceDate = data.service_date || new Date().toISOString().split('T')[0];

  const dateParams: Section8DateParams = {
    service_date: serviceDate,
    grounds: data.grounds.map((g) => ({ code: g.code, mandatory: g.mandatory })),
    tenancy_start_date: data.tenancy_start_date,
    fixed_term: data.fixed_term,
    fixed_term_end_date: data.fixed_term_end_date,
  };

  // If earliest_possession_date is provided, validate it
  if (data.earliest_possession_date) {
    const validation = validateSection8ExpiryDate(data.earliest_possession_date, dateParams);
    if (!validation.valid) {
      // Return 422 error with precise explanation
      const error = new Error(validation.errors.join(' '));
      (error as any).statusCode = 422;
      (error as any).validationErrors = validation.errors;
      (error as any).suggestedDate = validation.suggested_date;
      throw error;
    }
  } else {
    // Auto-calculate the earliest possession date
    const calculatedDate = calculateSection8ExpiryDate(dateParams);
    data.earliest_possession_date = calculatedDate.earliest_valid_date;
    data.notice_period_days = calculatedDate.notice_period_days;
    data.earliest_possession_date_explanation = calculatedDate.explanation;
  }

  // Determine if mandatory/discretionary
  data.any_mandatory_ground = data.grounds.some((g) => g.mandatory);
  data.any_discretionary_ground = data.grounds.some((g) => !g.mandatory);

  // Add rent period description if missing
  if (!data.rent_period_description) {
    const descriptions: Record<string, string> = {
      weekly: 'week',
      monthly: 'month',
      quarterly: 'quarter',
      yearly: 'year',
    };
    data.rent_period_description = descriptions[data.rent_frequency] || 'month';
  }

  return generateDocument({
    templatePath: 'uk/england/templates/eviction/section8_notice.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}
