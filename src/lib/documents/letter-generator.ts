/**
 * Letter Generator
 *
 * Generates formal letters: Letter Before Action, Rent Demand, Breach Warning, etc.
 */

import { generateDocument, GeneratedDocument } from './generator';

// ============================================================================
// TYPES
// ============================================================================

export interface LetterBeforeActionData {
  // From
  landlord_name: string;
  landlord_address: string;
  landlord_email: string;
  landlord_phone: string;

  // To
  tenant_name: string;
  property_address: string;

  // Letter details
  letter_date: string;

  // Issues
  rent_arrears?: boolean;
  arrears_amount?: number;
  arrears_date?: string;
  arrears_breakdown?: Array<{
    period: string;
    amount_due: number;
    amount_paid: number;
    shortfall: number;
  }>;
  total_owed?: number;

  breach_of_terms?: boolean;
  breaches?: Array<{
    clause: string;
    description: string;
    evidence: string;
  }>;

  antisocial_behavior?: boolean;
  asb_incidents?: Array<{
    date: string;
    description: string;
    reporter: string;
  }>;

  // Previous correspondence
  previous_letters?: Array<{
    date: string;
    type: string;
    summary: string;
  }>;

  // Payment details
  payment_deadline?: string;
  account_name?: string;
  sort_code?: string;
  account_number?: string;
  payment_reference?: string;

  // Payment plan
  payment_plan_offered?: boolean;
  payment_plan_amount?: number;
  payment_plan_period?: 'week' | 'month';
  payment_plan_duration?: string;
  payment_plan_deadline?: string;

  // Remedy
  breach_remedy?: boolean;
  remedy_deadline?: string;
  remedy_actions?: Array<{ action: string }>;

  asb_remedy?: boolean;

  // Deadlines
  final_deadline: string;
  response_deadline: string;
  court_proceedings_date?: string;

  // Costs
  estimated_total_costs?: number;
  estimated_costs?: number;
  interest_rate?: number;

  // Tenancy details
  tenancy_type?: string;
  tenancy_start_date?: string;
  monthly_rent?: number;

  // Warnings
  section_8_warning?: boolean;
  ground_8_threshold?: string;
  section_21_warning?: boolean;

  // Context
  willing_to_negotiate?: boolean;
  housing_benefit?: boolean;

  // Attachments
  attachments?: string[];

  // Agent
  agent?: boolean;

  // Document metadata
  document_id?: string;
  generation_timestamp?: string;
}

export interface RentDemandLetterData {
  landlord_name: string;
  landlord_address: string;
  tenant_name: string;
  property_address: string;
  letter_date: string;
  arrears_amount: number;
  arrears_breakdown: Array<{
    period: string;
    amount: number;
  }>;
  payment_deadline: string;
  payment_details: string;
  warning_level: 'first' | 'second' | 'final';
}

export interface BreachWarningLetterData {
  landlord_name: string;
  landlord_address: string;
  tenant_name: string;
  property_address: string;
  letter_date: string;
  breach_type: string;
  breach_description: string;
  tenancy_clause: string;
  remedy_required: string;
  remedy_deadline: string;
  warning_level: 'first' | 'second' | 'final';
}

// ============================================================================
// GENERATORS
// ============================================================================

/**
 * Generate a Letter Before Action
 */
export async function generateLetterBeforeAction(
  data: LetterBeforeActionData,
  isPreview = false
): Promise<GeneratedDocument> {
  // Validate
  if (!data.landlord_name) throw new Error('landlord_name is required');
  if (!data.tenant_name) throw new Error('tenant_name is required');
  if (!data.property_address) throw new Error('property_address is required');
  if (!data.final_deadline) throw new Error('final_deadline is required');

  if (!data.rent_arrears && !data.breach_of_terms && !data.antisocial_behavior) {
    throw new Error('At least one issue (rent_arrears, breach_of_terms, or antisocial_behavior) is required');
  }

  return generateDocument({
    templatePath: 'uk/england-wales/templates/letter_before_action.hbs',
    data,
    isPreview,
    outputFormat: 'both',
  });
}

/**
 * Generate a simple Rent Demand Letter
 */
export async function generateRentDemandLetter(
  data: RentDemandLetterData,
  isPreview = false
): Promise<GeneratedDocument> {
  const letterData = {
    landlord_name: data.landlord_name,
    landlord_address: data.landlord_address,
    tenant_name: data.tenant_name,
    property_address: data.property_address,
    letter_date: data.letter_date,
    rent_arrears: true,
    arrears_amount: data.arrears_amount,
    arrears_breakdown: data.arrears_breakdown.map((b) => ({
      period: b.period,
      amount_due: b.amount,
      amount_paid: 0,
      shortfall: b.amount,
    })),
    total_owed: data.arrears_amount,
    payment_deadline: data.payment_deadline,
    payment_details: data.payment_details,
    final_deadline: data.payment_deadline,
    response_deadline: data.payment_deadline,
    warning_level: data.warning_level,
  };

  return generateDocument({
    templatePath: 'uk/england-wales/templates/letter_before_action.hbs',
    data: letterData,
    isPreview,
    outputFormat: 'both',
  });
}

/**
 * Generate a Breach Warning Letter
 */
export async function generateBreachWarningLetter(
  data: BreachWarningLetterData,
  isPreview = false
): Promise<GeneratedDocument> {
  const letterData = {
    landlord_name: data.landlord_name,
    landlord_address: data.landlord_address,
    tenant_name: data.tenant_name,
    property_address: data.property_address,
    letter_date: data.letter_date,
    breach_of_terms: true,
    breaches: [
      {
        clause: data.tenancy_clause,
        description: data.breach_description,
        evidence: '',
      },
    ],
    breach_remedy: true,
    remedy_deadline: data.remedy_deadline,
    remedy_actions: [{ action: data.remedy_required }],
    final_deadline: data.remedy_deadline,
    response_deadline: data.remedy_deadline,
    warning_level: data.warning_level,
  };

  return generateDocument({
    templatePath: 'uk/england-wales/templates/letter_before_action.hbs',
    data: letterData,
    isPreview,
    outputFormat: 'both',
  });
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate total arrears from breakdown
 */
export function calculateTotalArrears(
  breakdown: Array<{ amount_due: number; amount_paid: number }>
): number {
  return breakdown.reduce((total, item) => {
    return total + (item.amount_due - item.amount_paid);
  }, 0);
}

/**
 * Generate payment plan text
 */
export function generatePaymentPlanText(
  totalArrears: number,
  installmentAmount: number,
  period: 'week' | 'month'
): string {
  const numberOfInstallments = Math.ceil(totalArrears / installmentAmount);
  const periodText = period === 'week' ? 'weekly' : 'monthly';

  return `Pay £${installmentAmount.toFixed(2)} ${periodText} for approximately ${numberOfInstallments} ${period}s until arrears are cleared`;
}

/**
 * Calculate estimated court costs
 */
export function calculateEstimatedCosts(claimAmount: number): {
  court_fee: number;
  legal_costs_min: number;
  legal_costs_max: number;
  bailiff_fee: number;
  total_min: number;
  total_max: number;
} {
  // Court fees based on Money Claims Online fee structure
  let court_fee = 0;
  if (claimAmount <= 300) court_fee = 35;
  else if (claimAmount <= 500) court_fee = 50;
  else if (claimAmount <= 1000) court_fee = 70;
  else if (claimAmount <= 1500) court_fee = 80;
  else if (claimAmount <= 3000) court_fee = 115;
  else if (claimAmount <= 5000) court_fee = 205;
  else if (claimAmount <= 10000) court_fee = 455;
  else court_fee = 480;

  // Legal costs vary
  const legal_costs_min = 800;
  const legal_costs_max = 3000;

  // Bailiff enforcement
  const bailiff_fee = 130;

  return {
    court_fee,
    legal_costs_min,
    legal_costs_max,
    bailiff_fee,
    total_min: court_fee + legal_costs_min + bailiff_fee,
    total_max: court_fee + legal_costs_max + bailiff_fee,
  };
}
