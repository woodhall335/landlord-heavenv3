/**
 * Fact Keys for Section 21 and Section 8 Validators
 *
 * These are the typed keys for all facts needed by the deterministic
 * rules engine. Facts can come from:
 * - LLM/regex extraction (low confidence)
 * - Uploaded evidence documents (high confidence)
 * - User confirmation via Q&A (high confidence)
 */

/**
 * Section 21 Notice Fact Keys
 */
export const SECTION_21_FACT_KEYS = {
  // Notice document fields
  notice_type: 'notice_type',                     // 'section_21' | 'form_6a' | etc.
  form_6a_present: 'form_6a_present',             // boolean - Form 6A detected
  signature_present: 'signature_present',         // boolean - Landlord signature present
  service_date: 'service_date',                   // date - When notice was served
  expiry_date: 'expiry_date',                     // date - When notice expires
  property_address_present: 'property_address_present', // boolean - Address on notice
  tenant_names_present: 'tenant_names_present',   // boolean - Tenant names on notice
  landlord_name_present: 'landlord_name_present', // boolean - Landlord name on notice

  // Deposit compliance
  deposit_taken: 'deposit_taken',                 // boolean - Was a deposit taken?
  deposit_protected: 'deposit_protected',         // boolean - Is deposit in approved scheme?
  deposit_protection_date: 'deposit_protection_date', // date - When deposit was protected
  prescribed_info_served: 'prescribed_info_served', // boolean - Prescribed info given within 30 days?
  prescribed_info_date: 'prescribed_info_date',   // date - When prescribed info was served

  // Compliance documents
  gas_appliances_present: 'gas_appliances_present', // boolean - Are there gas appliances?
  gas_safety_pre_move_in: 'gas_safety_pre_move_in', // boolean - Gas cert given before move-in?
  gas_safety_current: 'gas_safety_current',       // boolean - Is current gas cert valid?
  epc_provided: 'epc_provided',                   // boolean - EPC given to tenant?
  epc_rating: 'epc_rating',                       // string - EPC rating (A-G)
  how_to_rent_provided: 'how_to_rent_provided',   // boolean - How to Rent guide given?

  // Licensing
  licence_required: 'licence_required',           // boolean - Is property licensing required?
  licence_held: 'licence_held',                   // boolean - Does landlord hold required licence?
  licence_applied: 'licence_applied',             // boolean - Has licence been applied for?

  // Deposit cap (Tenant Fees Act 2019)
  deposit_amount: 'deposit_amount',               // number - Amount of deposit taken (GBP)
  rent_amount: 'rent_amount',                     // number - Periodic rent amount (GBP)
  rent_frequency: 'rent_frequency',               // 'weekly' | 'fortnightly' | 'monthly' | 'quarterly' | 'yearly'

  // Risk factors
  retaliatory_eviction_risk: 'retaliatory_eviction_risk', // boolean - Retaliatory eviction risk?
  rent_arrears_exist: 'rent_arrears_exist',       // boolean - Are there rent arrears?
  tenant_complaint_recent: 'tenant_complaint_recent', // boolean - Recent tenant complaint?

  // Tenancy status
  tenancy_status_known: 'tenancy_status_known',   // boolean - Is tenancy status confirmed?
  tenancy_type: 'tenancy_type',                   // 'ast' | 'periodic' | etc.
  fixed_term_end_date: 'fixed_term_end_date',     // date - When fixed term ends
  tenancy_start_date: 'tenancy_start_date',       // date - When tenancy started
} as const;

/**
 * Section 8 Notice Fact Keys
 */
export const SECTION_8_FACT_KEYS = {
  // Notice document fields
  notice_type: 'notice_type',                     // 'section_8' | 'form_3' | etc.
  form_3_present: 'form_3_present',               // boolean - Form 3 detected
  grounds_cited: 'grounds_cited',                 // number[] - Ground numbers cited
  service_date: 'service_date',                   // date - When notice was served
  notice_period_days: 'notice_period_days',       // number - Notice period given
  expiry_date: 'expiry_date',                     // date - When notice expires
  signature_present: 'signature_present',         // boolean - Landlord signature present
  property_address_present: 'property_address_present', // boolean
  tenant_names_present: 'tenant_names_present',   // boolean

  // Rent and arrears (for Ground 8)
  rent_amount: 'rent_amount',                     // number - Periodic rent amount
  rent_frequency: 'rent_frequency',               // 'weekly' | 'fortnightly' | 'monthly' | etc.
  arrears_amount: 'arrears_amount',               // number - Current arrears amount
  arrears_at_service: 'arrears_at_service',       // number - Arrears when notice served
  ground_8_satisfied: 'ground_8_satisfied',       // boolean - Does arrears meet Ground 8 threshold?

  // Risk factors
  benefit_delays: 'benefit_delays',               // boolean - Are benefits delayed?
  disrepair_counterclaims: 'disrepair_counterclaims', // boolean - Potential disrepair counterclaim?
  payment_since_notice: 'payment_since_notice',   // boolean - Any payment since notice served?
  payment_amount_since: 'payment_amount_since',   // number - Amount paid since notice

  // Other grounds supporting info
  antisocial_behaviour: 'antisocial_behaviour',   // boolean - ASB documented?
  breach_of_tenancy: 'breach_of_tenancy',         // boolean - Breach documented?
  domestic_violence: 'domestic_violence',         // boolean - DV concerns?
} as const;

/**
 * All fact keys (union of S21 and S8)
 */
export const ALL_FACT_KEYS = {
  ...SECTION_21_FACT_KEYS,
  ...SECTION_8_FACT_KEYS,
} as const;

export type Section21FactKey = keyof typeof SECTION_21_FACT_KEYS;
export type Section8FactKey = keyof typeof SECTION_8_FACT_KEYS;
export type AllFactKey = keyof typeof ALL_FACT_KEYS;

/** Generic fact key type (string) for flexibility */
export type FactKey = string;

/**
 * Required facts for Section 21 validation
 */
export const SECTION_21_REQUIRED_FACTS: string[] = [
  SECTION_21_FACT_KEYS.form_6a_present,
  SECTION_21_FACT_KEYS.service_date,
  SECTION_21_FACT_KEYS.expiry_date,
  SECTION_21_FACT_KEYS.signature_present,
  SECTION_21_FACT_KEYS.deposit_taken,
];

/**
 * Required facts for Section 8 validation
 */
export const SECTION_8_REQUIRED_FACTS: string[] = [
  SECTION_8_FACT_KEYS.form_3_present,
  SECTION_8_FACT_KEYS.grounds_cited,
  SECTION_8_FACT_KEYS.service_date,
];

/**
 * Fact key to Q&A question mapping
 */
export interface FactQuestionConfig {
  factKey: string;
  question: string;
  helpText?: string;
  type: 'yes_no' | 'date' | 'currency' | 'select' | 'text' | 'multi_select' | 'number';
  section: 'dates' | 'deposit' | 'compliance_docs' | 'service' | 'tenancy' | 'grounds' | 'arrears' | 'risk';
  options?: Array<{ value: string; label: string }>;
  validatorKeys: ('section_21' | 'section_8')[];
  /** Whether this question is required (defaults to true) */
  required?: boolean;
  /** Placeholder text for text/number inputs */
  placeholder?: string;
}

/**
 * Q&A questions for missing facts
 */
export const FACT_QUESTIONS: FactQuestionConfig[] = [
  // Dates section
  {
    factKey: 'service_date',
    question: 'When was the notice served on the tenant?',
    helpText: 'The date the tenant received the notice, not when it was signed.',
    type: 'date',
    section: 'dates',
    validatorKeys: ['section_21', 'section_8'],
  },
  {
    factKey: 'expiry_date',
    question: 'What is the expiry date on the notice?',
    helpText: 'The date after which possession proceedings can begin.',
    type: 'date',
    section: 'dates',
    validatorKeys: ['section_21', 'section_8'],
  },
  {
    factKey: 'tenancy_start_date',
    question: 'When did the tenancy start?',
    type: 'date',
    section: 'tenancy',
    validatorKeys: ['section_21', 'section_8'],
  },

  // Deposit section
  {
    factKey: 'deposit_taken',
    question: 'Was a deposit taken from the tenant?',
    type: 'yes_no',
    section: 'deposit',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'deposit_protected',
    question: 'Is the deposit currently protected in a government-approved scheme?',
    helpText: 'TDS, DPS, or MyDeposits in England.',
    type: 'yes_no',
    section: 'deposit',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'prescribed_info_served',
    question: 'Was the deposit prescribed information given to the tenant within 30 days of receiving the deposit?',
    helpText: 'This is a legal requirement for a valid Section 21 notice.',
    type: 'yes_no',
    section: 'deposit',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'deposit_amount',
    question: 'What is the deposit amount?',
    helpText: 'The total deposit amount taken from the tenant at the start of the tenancy.',
    type: 'currency',
    section: 'deposit',
    placeholder: '0.00',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'rent_amount',
    question: 'What is the periodic rent amount?',
    helpText: 'The rent amount paid each period (e.g., monthly rent).',
    type: 'currency',
    section: 'deposit',
    placeholder: '0.00',
    validatorKeys: ['section_21', 'section_8'],
  },
  {
    factKey: 'rent_frequency',
    question: 'How often is rent payable?',
    helpText: 'The payment frequency determines how the deposit cap is calculated.',
    type: 'select',
    section: 'deposit',
    options: [
      { value: 'weekly', label: 'Weekly' },
      { value: 'fortnightly', label: 'Fortnightly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' },
    ],
    validatorKeys: ['section_21', 'section_8'],
  },

  // Compliance docs section
  {
    factKey: 'gas_appliances_present',
    question: 'Are there any gas appliances at the property?',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'gas_safety_pre_move_in',
    question: 'Was a valid gas safety certificate given to the tenant before they moved in?',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'epc_provided',
    question: 'Was a valid EPC (Energy Performance Certificate) given to the tenant?',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'how_to_rent_provided',
    question: 'Was the "How to Rent" guide given to the tenant?',
    helpText: 'Required for tenancies that started on or after 1 October 2015.',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },

  // Licensing section
  {
    factKey: 'licence_required',
    question: 'Is the property subject to selective or additional licensing?',
    helpText: 'Check with your local council if unsure.',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'licence_held',
    question: 'Does the landlord hold the required property licence?',
    type: 'yes_no',
    section: 'compliance_docs',
    validatorKeys: ['section_21'],
  },

  // Risk section
  {
    factKey: 'retaliatory_eviction_risk',
    question: 'Has the tenant made a complaint about the property condition to the council within the last 6 months?',
    helpText: 'If yes, there may be retaliatory eviction protections.',
    type: 'yes_no',
    section: 'risk',
    validatorKeys: ['section_21'],
  },
  {
    factKey: 'rent_arrears_exist',
    question: 'Are there currently any rent arrears?',
    helpText: 'If yes, a Section 8 notice might be more appropriate.',
    type: 'yes_no',
    section: 'risk',
    validatorKeys: ['section_21'],
  },

  // S8 Grounds section
  {
    factKey: 'grounds_cited',
    question: 'Which grounds are cited on the Section 8 notice?',
    helpText: 'Select all grounds that appear on the notice.',
    type: 'multi_select',
    section: 'grounds',
    options: [
      { value: '1', label: 'Ground 1 - Owner-occupier' },
      { value: '2', label: 'Ground 2 - Mortgagee repossession' },
      { value: '5', label: 'Ground 5 - Minister of religion' },
      { value: '6', label: 'Ground 6 - Demolition/reconstruction' },
      { value: '7', label: 'Ground 7 - Periodic tenancy death' },
      { value: '7A', label: 'Ground 7A - Serious offence' },
      { value: '7B', label: 'Ground 7B - Immigration status' },
      { value: '8', label: 'Ground 8 - Serious rent arrears (mandatory)' },
      { value: '9', label: 'Ground 9 - Suitable alternative' },
      { value: '10', label: 'Ground 10 - Rent arrears (discretionary)' },
      { value: '11', label: 'Ground 11 - Persistent delay in payment' },
      { value: '12', label: 'Ground 12 - Breach of tenancy' },
      { value: '13', label: 'Ground 13 - Deterioration of property' },
      { value: '14', label: 'Ground 14 - Nuisance/antisocial behaviour' },
      { value: '14A', label: 'Ground 14A - Domestic violence' },
      { value: '15', label: 'Ground 15 - Deterioration of furniture' },
      { value: '16', label: 'Ground 16 - Former employee' },
      { value: '17', label: 'Ground 17 - False statement' },
    ],
    validatorKeys: ['section_8'],
  },

  // S8 Arrears section
  {
    factKey: 'arrears_amount',
    question: 'What is the current rent arrears amount?',
    helpText: 'The total amount of unpaid rent as of today.',
    type: 'currency',
    section: 'arrears',
    validatorKeys: ['section_8'],
  },
  {
    factKey: 'benefit_delays',
    question: 'Are delays in housing benefits contributing to the arrears?',
    helpText: 'Courts may consider this when deciding discretionary grounds.',
    type: 'yes_no',
    section: 'risk',
    validatorKeys: ['section_8'],
  },
  {
    factKey: 'disrepair_counterclaims',
    question: 'Are there any disrepair issues that the tenant might use as a counterclaim?',
    type: 'yes_no',
    section: 'risk',
    validatorKeys: ['section_8'],
  },
  {
    factKey: 'payment_since_notice',
    question: 'Has the tenant made any payment since the notice was served?',
    helpText: 'This affects whether Ground 8 threshold is still met at hearing.',
    type: 'yes_no',
    section: 'risk',
    validatorKeys: ['section_8'],
  },
];

/**
 * Get Q&A questions for a specific validator and fact keys
 */
export function getQuestionsForValidator(
  validatorKey: 'section_21' | 'section_8',
  missingFactKeys?: string[]
): FactQuestionConfig[] {
  let questions = FACT_QUESTIONS.filter((q) =>
    q.validatorKeys.includes(validatorKey)
  );

  if (missingFactKeys && missingFactKeys.length > 0) {
    questions = questions.filter((q) => missingFactKeys.includes(q.factKey));
  }

  return questions;
}

/**
 * Group questions by section for UI
 */
export function groupQuestionsBySection(
  questions: FactQuestionConfig[]
): Record<string, FactQuestionConfig[]> {
  return questions.reduce(
    (acc, q) => {
      if (!acc[q.section]) {
        acc[q.section] = [];
      }
      acc[q.section].push(q);
      return acc;
    },
    {} as Record<string, FactQuestionConfig[]>
  );
}

/**
 * Section display names
 */
export const SECTION_LABELS: Record<string, string> = {
  dates: 'Dates',
  deposit: 'Deposit Protection',
  compliance_docs: 'Compliance Documents',
  service: 'Service',
  tenancy: 'Tenancy Details',
  grounds: 'Grounds for Possession',
  arrears: 'Rent & Arrears',
  risk: 'Risk Factors',
};
