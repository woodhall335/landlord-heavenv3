/**
 * Wales Fault-Based Breach Notice Compliance Schema
 *
 * SINGLE SOURCE OF TRUTH for pre-service compliance requirements for the
 * Notice Only (Wales) journey.
 *
 * This module defines:
 * - Compliance fields (wizard questions)
 * - Applicability rules (applies_if)
 * - Blocking/warning rules (HARD_BLOCK / SOFT_BLOCK / INFO_ONLY)
 * - Document population mappings
 * - Ground-specific validation helpers (notice-only, pre-service)
 *
 * IMPORTANT:
 * - This is PRE-SERVICE ONLY (Notice Only). It must NOT drift into court workflow.
 * - We ask "do you have / can you produce" evidence and provide guidance;
 *   we do NOT require evidence uploads for Notice Only.
 */

/**
 * Blocking levels for compliance fields
 */
export type BlockingLevel = 'HARD_BLOCK' | 'SOFT_BLOCK' | 'INFO_ONLY';

/**
 * Input types for compliance fields
 */
export type InputType =
  | 'boolean'
  | 'enum'
  | 'enum_multi'
  | 'number'
  | 'text'
  | 'date';

/**
 * Compliance field categories
 */
export type ComplianceCategory =
  | 'landlord_registration'
  | 'occupation_contract'
  | 'deposit'
  | 'property_safety'
  | 'eviction_safeguards'
  | 'breach_evidence'
  | 'fault_based_grounds';

/**
 * Documents that can be populated from compliance fields
 */
export type FeedsDocument = 'pre_service_checklist' | 'service_validity_checklist';

/**
 * Compliance field definition
 */
export interface ComplianceField {
  /** Unique field identifier (snake_case) */
  field_id: string;
  /** Category for grouping */
  category: ComplianceCategory;
  /** Short human-readable label */
  label: string;
  /** Exact wizard question text */
  question_text: string;
  /** Input type for the field */
  input_type: InputType;
  /** Enum values (for enum/enum_multi types) */
  enum_values?: string[];
  /**
   * Conditional logic for when field applies.
   * Supports a small expression language (see evaluateCondition()).
   * Examples:
   * - "deposit_taken === true"
   * - "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')"
   */
  applies_if: string | null;
  /** Blocking level */
  blocking_level: BlockingLevel;
  /** Plain English legal explanation */
  legal_basis: string;
  /** Source document reference */
  source_reference: string;
  /** Documents this field populates */
  feeds_documents: FeedsDocument[];
  /** Whether this appears on the notice (always false for pre-service) */
  appears_on_notice: false;
  /** Block/warn message shown to user */
  block_message?: string;

  /**
   * For boolean fields: what value is considered "compliant".
   * - If omitted, defaults to true.
   * - Use false for safeguard questions where "Yes" should block (e.g. LA investigation).
   */
  expected_boolean_value?: boolean;
}

/**
 * Wizard tab definition
 */
export interface WizardTab {
  order: number;
  name: string;
  field_ids: string[];
  description: string;
}

/**
 * Compliance schema definition
 */
export interface WalesComplianceSchema {
  schema_version: string;
  jurisdiction: 'wales';
  product: 'notice_only';
  notice_type: 'fault_based_breach';
  legislation: string;
  compliance_fields: ComplianceField[];
  wizard_tabs: WizardTab[];
}

/**
 * Wales Fault-Based Breach Notice Compliance Fields
 */
export const WALES_COMPLIANCE_FIELDS: ComplianceField[] = [
  // ============================================
  // LANDLORD REGISTRATION
  // ============================================
  {
    field_id: 'rent_smart_wales_registered',
    category: 'landlord_registration',
    label: 'Rent Smart Wales Registration',
    question_text: 'Are you registered with Rent Smart Wales as a landlord or letting agent for this property?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'All landlords/agents in Wales must be registered with Rent Smart Wales before serving notices.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 1',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'You must be registered with Rent Smart Wales before serving any notice in Wales. Register at rentsmartswales.gov.wales before proceeding.',
  },
  {
    field_id: 'rent_smart_wales_number',
    category: 'landlord_registration',
    label: 'Rent Smart Wales Registration Number',
    question_text: 'Enter your Rent Smart Wales registration number (if you have it)',
    input_type: 'text',
    applies_if: 'rent_smart_wales_registered === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Useful for audit trail and compliance verification.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 1',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },

  // ============================================
  // OCCUPATION CONTRACT
  // ============================================
  {
    field_id: 'written_statement_provided',
    category: 'occupation_contract',
    label: 'Written Statement Provided',
    question_text:
      'Have you provided the contract-holder with a written statement of the occupation contract within 14 days of occupation commencing?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'A written statement must be provided within 14 days. Non-compliance can undermine the ability to progress and may carry consequences.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 2',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'You must provide the written statement of the occupation contract within 14 days. You should not proceed until this has been done.',
  },
  {
    field_id: 'written_statement_date',
    category: 'occupation_contract',
    label: 'Written Statement Date',
    question_text: 'When was the written statement provided to the contract-holder?',
    input_type: 'date',
    applies_if: 'written_statement_provided === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Date helps confirm the 14-day requirement was met.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 2',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },

  // ============================================
  // DEPOSIT
  // ============================================
  {
    field_id: 'deposit_taken',
    category: 'deposit',
    label: 'Deposit Taken',
    question_text: 'Did you take a deposit from the contract-holder?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Determines whether deposit protection and prescribed information requirements apply.',
    source_reference: 'Service Instructions / PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Deposit section',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'deposit_protected',
    category: 'deposit',
    label: 'Deposit Protected',
    question_text: 'If you took a deposit: is it protected in a Welsh Government-approved tenancy deposit scheme?',
    input_type: 'boolean',
    applies_if: 'deposit_taken === true',
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'If a deposit was taken, it must be protected in an approved scheme. Non-compliance creates major risk and can affect outcomes later.',
    source_reference: 'Service Instructions (Deposit Protection) / PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Deposit section',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'If you took a deposit, it must be protected in an approved scheme. You should resolve this before proceeding.',
  },
  {
    field_id: 'deposit_scheme',
    category: 'deposit',
    label: 'Deposit Scheme',
    question_text: 'Which scheme is the deposit protected with?',
    input_type: 'enum',
    enum_values: ['deposit_protection_service_wales', 'mydeposits_wales', 'tenancy_deposit_scheme_wales', 'other'],
    applies_if: 'deposit_taken === true && deposit_protected === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Records which approved scheme is used.',
    source_reference: 'Service Instructions (Deposit Protection)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'prescribed_info_served',
    category: 'deposit',
    label: 'Prescribed Information Served',
    question_text:
      'If you took a deposit: did you provide the prescribed information to the contract-holder within 30 days of receiving the deposit?',
    input_type: 'boolean',
    applies_if: 'deposit_taken === true',
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'If a deposit was taken, prescribed information must be provided within the required timeframe. Non-compliance creates significant risk.',
    source_reference: 'Service Instructions (Deposit Protection) / PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Deposit section',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'If you took a deposit, you must provide the prescribed information within the required timeframe. You should resolve this before proceeding.',
  },
  {
    field_id: 'prescribed_info_date',
    category: 'deposit',
    label: 'Prescribed Information Date',
    question_text: 'When did you provide the prescribed information to the contract-holder?',
    input_type: 'date',
    applies_if: 'deposit_taken === true && prescribed_info_served === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Records timing for audit trail.',
    source_reference: 'Service Instructions (Deposit Protection)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },

  // ============================================
  // PROPERTY SAFETY
  // ============================================
  {
    field_id: 'gas_supply_present',
    category: 'property_safety',
    label: 'Gas Supply Present',
    question_text: 'Does the property have any gas appliances or a gas supply?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Determines whether gas safety requirements apply.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Safety Certificates',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'gas_safety_certificate_valid',
    category: 'property_safety',
    label: 'Gas Safety Certificate',
    question_text:
      'If the property has gas: do you have a valid gas safety certificate (annual check) and has a copy been given to the contract-holder?',
    input_type: 'boolean',
    applies_if: 'gas_supply_present === true',
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'Gas safety checks must be carried out and evidence retained. Non-compliance is serious and can undermine proceedings.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4 (Gas Safety)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'A valid gas safety certificate is required where gas is present. Proceeding without this is high risk.',
  },
  {
    field_id: 'eicr_valid',
    category: 'property_safety',
    label: 'Electrical Safety (EICR)',
    question_text: 'Do you have a valid Electrical Installation Condition Report (EICR) within the last 5 years and has a copy been given?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'An EICR is required and must be valid (typically within 5 years).',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4 (EICR)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'A valid EICR is required. Proceeding without this is high risk.',
  },
  {
    field_id: 'epc_available',
    category: 'property_safety',
    label: 'Energy Performance Certificate (EPC)',
    question_text: 'Do you have a valid EPC available for the property?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'A valid EPC must be available (subject to exemptions).',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4 (EPC)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'A valid EPC should be available. Proceeding without this is high risk.',
  },
  {
    field_id: 'smoke_alarms_working',
    category: 'property_safety',
    label: 'Smoke Alarms',
    question_text: 'Are working smoke alarms installed on each storey, and were they checked at the start of the contract?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'Smoke alarms are required and should be in working order.',
    source_reference: 'Service Instructions (Smoke and Carbon Monoxide Alarms)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Smoke alarms must be in place and working. Proceeding without compliance is high risk.',
  },
  {
    field_id: 'solid_fuel_appliance_present',
    category: 'property_safety',
    label: 'Solid Fuel Appliance Present',
    question_text: 'Does the property have any solid fuel appliance (e.g., wood burner, coal fire)?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Determines whether carbon monoxide alarms are required.',
    source_reference: 'Service Instructions (Smoke and Carbon Monoxide Alarms)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'co_alarms_working',
    category: 'property_safety',
    label: 'Carbon Monoxide Alarms',
    question_text: 'If there is a solid fuel appliance: are working carbon monoxide alarms installed in the relevant rooms and were they checked at the start of the contract?',
    input_type: 'boolean',
    applies_if: 'solid_fuel_appliance_present === true',
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'Carbon monoxide alarms are required where solid fuel appliances are present.',
    source_reference: 'Service Instructions (Smoke and Carbon Monoxide Alarms)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Carbon monoxide alarms are required where solid fuel appliances exist. Proceeding without compliance is high risk.',
  },

  // ============================================
  // EVICTION SAFEGUARDS
  // ============================================
  {
    field_id: 'retaliatory_eviction_complaint',
    category: 'eviction_safeguards',
    label: 'Retaliatory Eviction Safeguard',
    question_text: 'Has the contract-holder made a legitimate complaint about the condition of the property in the last 6 months?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: false,
    legal_basis:
      'If there has been a legitimate complaint within the relevant period, serving a notice may be prohibited/invalid (retaliatory eviction protection).',
    source_reference: 'Service Instructions (Retaliatory Eviction Protection)',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message:
      'You should not proceed: a complaint within the last 6 months can trigger retaliatory eviction protections in Wales.',
  },
  {
    field_id: 'local_authority_investigation',
    category: 'eviction_safeguards',
    label: 'Local Authority Investigation',
    question_text: 'Is the local authority currently investigating the property or taking enforcement action?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: false,
    legal_basis:
      'If the local authority is investigating/enforcing, serving a notice may be prohibited/invalid in Wales.',
    source_reference: 'Service Instructions (Retaliatory Eviction Protection)',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message:
      'You should not proceed while there is a local authority investigation/enforcement action relating to the property.',
  },

  // ============================================
  // FAULT-BASED GROUNDS (selection + high-level)
  // ============================================
  {
    field_id: 'wales_fault_grounds',
    category: 'fault_based_grounds',
    label: 'Statutory Ground Selection',
    question_text: 'Select the ground(s) for your fault-based breach notice:',
    input_type: 'enum_multi',
    enum_values: [
      'rent_arrears_serious', // serious arrears threshold must be met
      'rent_arrears_other',   // arrears exist but below serious threshold
      'antisocial_behaviour',
      'breach_of_contract',
      'false_statement',
    ],
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'At least one valid ground must be selected for a fault-based breach notice.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message: 'You must select at least one ground for the fault-based breach notice.',
  },

  // ============================================
  // BREACH EVIDENCE (Notice Only = confirm + guidance; no uploads)
  // ============================================
  {
    field_id: 'evidence_exists',
    category: 'breach_evidence',
    label: 'Evidence Available',
    question_text: 'Do you have evidence to support the breach you are relying on (that you could produce if needed)?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis:
      'You must be able to evidence the breach. This is essential if the matter proceeds further.',
    source_reference: 'Service Instructions (Evidence of Breach) / SERVICE AND VALIDITY CHECKLIST (Evidence of the breach)',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message:
      'You must have evidence to support the breach. Without evidence, the next steps are likely to fail.',
  },
  {
    field_id: 'evidence_guidance',
    category: 'breach_evidence',
    label: 'Evidence Guidance',
    question_text: 'Evidence you should keep (this is guidance only):',
    input_type: 'text',
    applies_if: 'evidence_exists === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Guidance: keep records you may need later. (Notice Only does not collect evidence.)',
    source_reference: 'Service Instructions (Evidence of Breach) / SERVICE AND VALIDITY CHECKLIST (Service Evidence Checklist)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },

  // ----------------------------
  // Rent arrears specifics (notice-only)
  // ----------------------------
  {
    field_id: 'arrears_weeks_unpaid',
    category: 'breach_evidence',
    label: 'Weeks of Rent Unpaid',
    question_text: 'Approximately how many weeks of rent are currently unpaid?',
    input_type: 'number',
    applies_if: "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Used to validate whether the serious arrears threshold is met and to ensure the correct arrears ground is selected.',
    source_reference: 'Service Instructions (Rent arrears evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please enter how many weeks of rent are unpaid.',
  },
  {
    field_id: 'arrears_amount',
    category: 'breach_evidence',
    label: 'Arrears Amount',
    question_text: 'What is the total amount of rent arrears currently outstanding?',
    input_type: 'number',
    applies_if: "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'Arrears amount should be known and supported by records.',
    source_reference: 'Service Instructions (Rent arrears evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please enter the arrears amount.',
  },
  {
    field_id: 'arrears_schedule_confirmed',
    category: 'breach_evidence',
    label: 'Arrears Schedule Available',
    question_text: 'Do you have a rent schedule / payment history you could produce if needed?',
    input_type: 'boolean',
    applies_if: "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'A rent schedule is strongly recommended to support rent arrears grounds.',
    source_reference: 'Service Instructions (Evidence of Breach)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'A rent schedule/payment history is strongly recommended. Proceeding without one increases risk.',
  },

  // ----------------------------
  // ASB specifics (notice-only)
  // ----------------------------
  {
    field_id: 'asb_incident_description',
    category: 'breach_evidence',
    label: 'ASB Incident Description',
    question_text: 'Describe the anti-social behaviour (include dates, times, what occurred, and who was affected):',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('antisocial_behaviour')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'Particulars are necessary to describe the breach being relied upon.',
    source_reference: 'Service Instructions (Anti-social behaviour evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please describe the incidents with enough detail (dates/times/what happened).',
  },
  {
    field_id: 'asb_supporting_records_confirmed',
    category: 'breach_evidence',
    label: 'ASB Supporting Records Available',
    question_text: 'Do you have supporting records (incident logs, complaints, witness statements, reports) you could produce if needed?',
    input_type: 'boolean',
    applies_if: "wales_fault_grounds.includes('antisocial_behaviour')",
    blocking_level: 'SOFT_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'Supporting records strengthen ASB claims and reduce dispute risk.',
    source_reference: 'Service Instructions (Evidence of Breach)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Supporting records are strongly recommended for ASB. Proceeding without them increases risk.',
  },

  // ----------------------------
  // Breach of contract / false statement specifics
  // ----------------------------
  {
    field_id: 'breach_clause_identified',
    category: 'breach_evidence',
    label: 'Breached Clause Identified',
    question_text: 'Which clause or term of the occupation contract has been breached?',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('breach_of_contract')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'You should identify the specific contract term relied upon.',
    source_reference: 'Service Instructions (Breach of contract evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please identify the contract clause/term that was breached.',
  },
  {
    field_id: 'breach_description',
    category: 'breach_evidence',
    label: 'Breach Description',
    question_text: 'Describe how the contract-holder breached this term (include dates and details):',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('breach_of_contract')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'You need clear particulars of the breach being relied upon.',
    source_reference: 'Service Instructions (Breach of contract evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please describe the breach with enough detail.',
  },
  {
    field_id: 'false_statement_description',
    category: 'breach_evidence',
    label: 'False Statement Description',
    question_text: 'What false statement was made to obtain the occupation contract?',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('false_statement')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'You must identify the false statement relied upon.',
    source_reference: 'Service Instructions (False statement evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Please describe the false statement.',
  },
  {
    field_id: 'false_statement_discovery_date',
    category: 'breach_evidence',
    label: 'Discovery Date',
    question_text: 'When did you discover the statement was false?',
    input_type: 'date',
    applies_if: "wales_fault_grounds.includes('false_statement')",
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Helps record context for audit trail.',
    source_reference: 'Service Instructions (False statement evidence)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },

  // ============================================
  // Final declaration
  // ============================================
  {
    field_id: 'user_declaration',
    category: 'breach_evidence',
    label: 'User Declaration',
    question_text:
      'I confirm the information provided is true to the best of my knowledge, and I understand that serving a notice without proper grounds or compliance may lead to legal consequences.',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    expected_boolean_value: true,
    legal_basis: 'Declaration supports audit trail and user acknowledgement.',
    source_reference: 'Service Instructions (Declaration) / PRE-SERVICE checklist declaration section',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'You must confirm the declaration to proceed.',
  },
];

/**
 * Wizard tab definitions for Wales fault-based breach notice (Notice Only)
 */
export const WALES_WIZARD_TABS: WizardTab[] = [
  {
    order: 1,
    name: 'Landlord Details',
    field_ids: ['rent_smart_wales_registered', 'rent_smart_wales_number'],
    description: 'Verify Rent Smart Wales registration',
  },
  {
    order: 2,
    name: 'Occupation Contract',
    field_ids: ['written_statement_provided', 'written_statement_date'],
    description: 'Occupation contract compliance verification',
  },
  {
    order: 3,
    name: 'Deposit',
    field_ids: [
      'deposit_taken',
      'deposit_protected',
      'deposit_scheme',
      'prescribed_info_served',
      'prescribed_info_date',
    ],
    description: 'Deposit compliance (only applies if a deposit was taken)',
  },
  {
    order: 4,
    name: 'Property Compliance',
    field_ids: [
      'gas_supply_present',
      'gas_safety_certificate_valid',
      'eicr_valid',
      'epc_available',
      'smoke_alarms_working',
      'solid_fuel_appliance_present',
      'co_alarms_working',
    ],
    description: 'Safety certificate and alarms verification',
  },
  {
    order: 5,
    name: 'Breach Details',
    field_ids: [
      'wales_fault_grounds',
      'evidence_exists',
      'evidence_guidance',
      'arrears_weeks_unpaid',
      'arrears_amount',
      'arrears_schedule_confirmed',
      'asb_incident_description',
      'asb_supporting_records_confirmed',
      'breach_clause_identified',
      'breach_description',
      'false_statement_description',
      'false_statement_discovery_date',
    ],
    description: 'Ground selection and breach particulars (confirm evidence exists; do not upload evidence)',
  },
  {
    order: 6,
    name: 'Safeguards',
    field_ids: ['retaliatory_eviction_complaint', 'local_authority_investigation'],
    description: 'Retaliatory eviction and local authority safeguard checks',
  },
  {
    order: 7,
    name: 'Review & Declaration',
    field_ids: ['user_declaration'],
    description: 'Final review and sign-off',
  },
];

/**
 * Complete Wales Compliance Schema
 */
export const WALES_COMPLIANCE_SCHEMA: WalesComplianceSchema = {
  schema_version: '1.1',
  jurisdiction: 'wales',
  product: 'notice_only',
  notice_type: 'fault_based_breach',
  legislation: 'Renting Homes (Wales) Act 2016',
  compliance_fields: WALES_COMPLIANCE_FIELDS,
  wizard_tabs: WALES_WIZARD_TABS,
};

// ============================================
// Helper utilities
// ============================================

/**
 * Normalize wales_fault_grounds to a consistent string[] shape.
 * Handles backward compatibility with legacy data formats:
 * - string -> [string]
 * - undefined/null -> []
 * - array -> array (as-is)
 *
 * This ensures all components read/write using the canonical array shape.
 */
export function normalizeWalesFaultGrounds(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string') {
    return value.trim() ? [value] : [];
  }
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '');
  }
  return [];
}

/**
 * Check if any arrears ground is selected in wales_fault_grounds.
 * Useful for conditionally showing arrears-related UI/guidance.
 */
export function hasArrearsGroundSelected(walesFaultGrounds: unknown): boolean {
  const grounds = normalizeWalesFaultGrounds(walesFaultGrounds);
  return grounds.includes('rent_arrears_serious') || grounds.includes('rent_arrears_other');
}

/**
 * Get a compliance field by ID
 */
export function getComplianceFieldById(fieldId: string): ComplianceField | undefined {
  return WALES_COMPLIANCE_FIELDS.find((f) => f.field_id === fieldId);
}

/**
 * Get fields for a specific wizard tab
 */
export function getFieldsForTab(tabName: string): ComplianceField[] {
  const tab = WALES_WIZARD_TABS.find((t) => t.name === tabName);
  if (!tab) return [];
  return tab.field_ids
    .map((id) => getComplianceFieldById(id))
    .filter((f): f is ComplianceField => f !== undefined);
}

/**
 * Evaluate a simple condition language used in applies_if.
 *
 * Supported patterns (no parentheses):
 * - "field === true|false|'<string>'|<number>"
 * - "field !== true|false|'<string>'|<number>"
 * - "arrayField.includes('value')"
 * - Combine with "&&" and "||"
 */
export function evaluateCondition(expr: string, facts: Record<string, unknown>): boolean {
  const trimmed = expr.trim();
  if (!trimmed) return true;

  // OR-split
  const orParts = trimmed.split('||').map((p) => p.trim()).filter(Boolean);
  if (orParts.length > 1) {
    return orParts.some((p) => evaluateCondition(p, facts));
  }

  // AND-split
  const andParts = trimmed.split('&&').map((p) => p.trim()).filter(Boolean);
  if (andParts.length > 1) {
    return andParts.every((p) => evaluateCondition(p, facts));
  }

  // includes()
  const includesMatch = trimmed.match(/^([a-zA-Z_]\w*)\.includes\((['"])(.+?)\2\)$/);
  if (includesMatch) {
    const [, key, , value] = includesMatch;
    const arr = facts[key];
    return Array.isArray(arr) ? arr.includes(value) : false;
  }

  // === / !==
  const eqMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*(===|!==)\s*(.+)$/);
  if (eqMatch) {
    const [, key, op, raw] = eqMatch;
    const factValue = facts[key];

    let rhs: unknown = raw.trim();

    // booleans
    if (rhs === 'true') rhs = true;
    else if (rhs === 'false') rhs = false;
    // quoted strings
    else {
      const strMatch = String(rhs).match(/^(['"])(.*)\1$/);
      if (strMatch) rhs = strMatch[2];
      else {
        // numbers
        const n = Number(rhs);
        if (!Number.isNaN(n) && String(rhs).match(/^\d+(\.\d+)?$/)) rhs = n;
      }
    }

    return op === '===' ? factValue === rhs : factValue !== rhs;
  }

  // If we can't parse it safely, default to showing the field (fail-open)
  return true;
}

/**
 * Check if a field should be displayed based on applies_if condition
 */
export function shouldFieldApply(fieldId: string, facts: Record<string, unknown>): boolean {
  const field = getComplianceFieldById(fieldId);
  if (!field) return false;
  if (!field.applies_if) return true;
  return evaluateCondition(field.applies_if, facts);
}

/**
 * Helper function to check if a numeric value is "missing" for validation purposes.
 *
 * FIX FOR ISSUE B: Numeric fields should be considered missing ONLY if:
 * - undefined, null, or NaN
 *
 * 0 is a VALID numeric value and should NOT be treated as missing.
 * This function returns true if the value is genuinely missing.
 */
export function isNumericValueMissing(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value !== 'number') return true;
  if (Number.isNaN(value)) return true;
  // 0 is a valid numeric value, NOT missing
  return false;
}

/**
 * Helper function to check if an arrears-related numeric value requires > 0.
 *
 * FIX FOR ISSUE B: When arrears grounds are selected, arrears_amount and
 * arrears_weeks_unpaid must be greater than 0. This provides a clear message
 * rather than treating 0 as "missing".
 */
export function isArrearsValueInvalid(
  fieldId: string,
  value: unknown,
  facts: Record<string, unknown>
): { invalid: boolean; message?: string } {
  const grounds = normalizeWalesFaultGrounds(facts['wales_fault_grounds']);
  const hasArrearsGround = grounds.includes('rent_arrears_serious') || grounds.includes('rent_arrears_other');

  // Only apply this validation to arrears-related fields when arrears ground selected
  if (!hasArrearsGround) return { invalid: false };

  const arrearsFields = ['arrears_amount', 'arrears_weeks_unpaid'];
  if (!arrearsFields.includes(fieldId)) return { invalid: false };

  // If value is a number and is 0, that's invalid for arrears (must be > 0)
  if (typeof value === 'number' && value === 0) {
    if (fieldId === 'arrears_amount') {
      return {
        invalid: true,
        message: 'Arrears amount must be greater than zero when claiming rent arrears grounds.',
      };
    }
    if (fieldId === 'arrears_weeks_unpaid') {
      return {
        invalid: true,
        message: 'Weeks unpaid must be greater than zero when claiming rent arrears grounds.',
      };
    }
  }

  return { invalid: false };
}

/**
 * Ground-specific validation (Notice Only / pre-service).
 * Enforces:
 * - serious arrears requires >= 8 weeks unpaid
 * - "other arrears" must be < 8 weeks (otherwise select serious)
 * - arrears_amount must be > 0 when arrears grounds selected (Issue B fix)
 *
 * Note: wales_fault_grounds is now an array (string[]), so we use
 * normalizeWalesFaultGrounds() and .includes() for checking.
 */
export function getGroundLogicViolations(
  facts: Record<string, unknown>
): Array<{ message: string }> {
  const violations: Array<{ message: string }> = [];

  const grounds = normalizeWalesFaultGrounds(facts['wales_fault_grounds']);
  const weeksRaw = facts['arrears_weeks_unpaid'];
  const weeks = typeof weeksRaw === 'number' && !Number.isNaN(weeksRaw) ? weeksRaw : null;

  const amountRaw = facts['arrears_amount'];
  const amount = typeof amountRaw === 'number' && !Number.isNaN(amountRaw) ? amountRaw : null;

  const hasSerious = grounds.includes('rent_arrears_serious');
  const hasOther = grounds.includes('rent_arrears_other');
  const hasAnyArrears = hasSerious || hasOther;

  // FIX FOR ISSUE B: Arrears amount must be > 0 when arrears grounds selected
  if (hasAnyArrears) {
    // Check arrears amount (0 is invalid, not "missing")
    if (amount === null) {
      violations.push({ message: 'Please provide the arrears amount for rent arrears grounds.' });
    } else if (amount === 0) {
      violations.push({ message: 'Arrears amount must be greater than zero when claiming rent arrears grounds.' });
    }
  }

  if (hasSerious) {
    if (weeks === null) {
      violations.push({ message: 'Please provide the number of weeks of rent unpaid for serious rent arrears.' });
    } else if (weeks === 0) {
      violations.push({ message: 'Weeks unpaid must be greater than zero for serious rent arrears.' });
    } else if (weeks < 8) {
      violations.push({ message: 'Serious rent arrears requires at least 8 weeks unpaid. Select "Other rent arrears" or adjust the ground.' });
    }
  }

  if (hasOther) {
    if (weeks === null) {
      violations.push({ message: 'Please provide the number of weeks of rent unpaid for rent arrears.' });
    } else if (weeks === 0) {
      violations.push({ message: 'Weeks unpaid must be greater than zero for rent arrears.' });
    } else if (weeks >= 8) {
      violations.push({ message: 'You have 8+ weeks unpaid. Select "Serious rent arrears" instead of "Other rent arrears".' });
    }
  }

  return violations;
}

/**
 * Get all HARD_BLOCK violations that are not satisfied.
 * Note: For boolean fields we use expected_boolean_value (default true).
 */
export function getBlockingViolations(
  facts: Record<string, unknown>
): Array<{ field: ComplianceField; message: string }> {
  const violations: Array<{ field: ComplianceField; message: string }> = [];

  for (const field of WALES_COMPLIANCE_FIELDS) {
    if (field.blocking_level !== 'HARD_BLOCK') continue;
    if (!shouldFieldApply(field.field_id, facts)) continue;

    const value = facts[field.field_id];

    // Boolean compliance
    if (field.input_type === 'boolean') {
      const expected = field.expected_boolean_value ?? true;
      if (value !== expected) {
        violations.push({
          field,
          message: field.block_message || `${field.label} requirement not met`,
        });
      }
      continue;
    }

    // Required text/number/date for HARD_BLOCK fields
    if (field.input_type === 'text') {
      if (value === undefined || value === null || String(value).trim() === '') {
        violations.push({ field, message: field.block_message || `${field.label} is required` });
      }
      continue;
    }

    if (field.input_type === 'number') {
      // FIX FOR ISSUE B: Use helper that treats 0 as valid, not missing
      if (isNumericValueMissing(value)) {
        violations.push({ field, message: field.block_message || `${field.label} is required` });
      } else {
        // FIX FOR ISSUE B: Check if arrears fields require > 0
        const arrearsCheck = isArrearsValueInvalid(field.field_id, value, facts);
        if (arrearsCheck.invalid && arrearsCheck.message) {
          violations.push({ field, message: arrearsCheck.message });
        }
      }
      continue;
    }

    if (field.input_type === 'date') {
      if (value === undefined || value === null || String(value).trim() === '') {
        violations.push({ field, message: field.block_message || `${field.label} is required` });
      }
      continue;
    }

    if (field.input_type === 'enum') {
      if (value === undefined || value === null || String(value).trim() === '') {
        violations.push({ field, message: field.block_message || `${field.label} is required` });
      }
      continue;
    }

    if (field.input_type === 'enum_multi') {
      if (!Array.isArray(value) || value.length === 0) {
        violations.push({
          field,
          message: field.block_message || `At least one ${field.label} must be selected`,
        });
      }
      continue;
    }
  }

  // Add ground logic hard violations as HARD_BLOCK style messages
  // (kept separate so the UI can display them clearly)
  const groundViolations = getGroundLogicViolations(facts);
  for (const v of groundViolations) {
    violations.push({
      field: {
        field_id: 'wales_fault_grounds',
        category: 'fault_based_grounds',
        label: 'Ground Selection',
        question_text: '',
        input_type: 'enum_multi',
        applies_if: null,
        blocking_level: 'HARD_BLOCK',
        legal_basis: '',
        source_reference: '',
        feeds_documents: ['pre_service_checklist'],
        appears_on_notice: false,
      },
      message: v.message,
    });
  }

  return violations;
}

/**
 * Get all SOFT_BLOCK warnings.
 * Note: For boolean fields we use expected_boolean_value (default true).
 */
export function getSoftBlockWarnings(
  facts: Record<string, unknown>
): Array<{ field: ComplianceField; message: string }> {
  const warnings: Array<{ field: ComplianceField; message: string }> = [];

  for (const field of WALES_COMPLIANCE_FIELDS) {
    if (field.blocking_level !== 'SOFT_BLOCK') continue;
    if (!shouldFieldApply(field.field_id, facts)) continue;

    const value = facts[field.field_id];

    if (field.input_type === 'boolean') {
      const expected = field.expected_boolean_value ?? true;
      if (value !== expected) {
        warnings.push({
          field,
          message: field.block_message || `Warning: ${field.label} may not be compliant`,
        });
      }
      continue;
    }

    // For SOFT_BLOCK non-boolean fields, warn if empty
    if (value === undefined || value === null || String(value).trim() === '') {
      warnings.push({
        field,
        message: field.block_message || `Warning: ${field.label} is recommended`,
      });
    }
  }

  return warnings;
}

// ============================================
// LEGACY CASE MIGRATION (Issue C)
// ============================================

/**
 * Legacy key mappings for Wales notice-only cases.
 *
 * FIX FOR ISSUE C: Older Wales cases may have used different fact keys.
 * This mapping defines the canonical (new) key and its possible legacy sources.
 *
 * Migration rule: If the new key is empty but a legacy key has data, copy the value.
 * NEVER overwrite if the new key already has data.
 */
const LEGACY_KEY_MAPPINGS: Array<{
  newKey: string;
  legacyKeys: string[];
  type: 'string' | 'string[]' | 'number' | 'boolean' | 'object' | 'array';
}> = [
  // Wales fault grounds - legacy might be a string, normalize to string[]
  {
    newKey: 'wales_fault_grounds',
    legacyKeys: ['wales_ground', 'fault_ground', 'selected_ground'],
    type: 'string[]',
  },

  // ASB description - might be in different locations
  {
    newKey: 'wales_asb_description',
    legacyKeys: ['asb_description', 'asb_details', 'antisocial_behaviour_description'],
    type: 'string',
  },
  {
    newKey: 'wales_asb_incident_date',
    legacyKeys: ['asb_incident_date', 'asb_date'],
    type: 'string',
  },
  {
    newKey: 'wales_asb_incident_time',
    legacyKeys: ['asb_incident_time', 'asb_time'],
    type: 'string',
  },
  {
    newKey: 'wales_asb_location',
    legacyKeys: ['asb_location'],
    type: 'string',
  },
  {
    newKey: 'wales_asb_police_involved',
    legacyKeys: ['asb_police_involved', 'police_involved'],
    type: 'boolean',
  },
  {
    newKey: 'wales_asb_police_ref',
    legacyKeys: ['asb_police_ref', 'police_reference'],
    type: 'string',
  },
  {
    newKey: 'wales_asb_witness_details',
    legacyKeys: ['asb_witness_details', 'witness_details'],
    type: 'string',
  },

  // Breach of contract
  {
    newKey: 'wales_breach_clause',
    legacyKeys: ['breach_clause', 'breached_clause', 'contract_clause'],
    type: 'string',
  },
  {
    newKey: 'wales_breach_dates',
    legacyKeys: ['breach_dates', 'breach_date', 'breach_period'],
    type: 'string',
  },
  {
    newKey: 'wales_breach_evidence',
    legacyKeys: ['breach_evidence', 'breach_evidence_summary'],
    type: 'string',
  },

  // False statement
  {
    newKey: 'wales_false_statement_summary',
    legacyKeys: ['false_statement_summary', 'false_statement_description', 'false_statement_details'],
    type: 'string',
  },
  {
    newKey: 'wales_false_statement_discovered_date',
    legacyKeys: ['false_statement_discovered_date', 'false_statement_discovery_date'],
    type: 'string',
  },
  {
    newKey: 'wales_false_statement_evidence',
    legacyKeys: ['false_statement_evidence'],
    type: 'string',
  },

  // Arrears data
  {
    newKey: 'arrears_amount',
    legacyKeys: ['total_arrears', 'rent_arrears_amount', 'arrears_total'],
    type: 'number',
  },
  {
    newKey: 'arrears_weeks_unpaid',
    legacyKeys: ['weeks_unpaid', 'arrears_weeks', 'unpaid_weeks'],
    type: 'number',
  },

  // Arrears schedule items - check multiple possible locations
  {
    newKey: 'arrears_items',
    legacyKeys: ['rent_arrears_items', 'arrears_schedule'],
    type: 'array',
  },

  // Part D particulars
  {
    newKey: 'wales_part_d_particulars',
    legacyKeys: ['part_d_particulars', 'particulars_of_claim', 'breach_particulars'],
    type: 'string',
  },
];

/**
 * Checks if a value is considered "empty" for migration purposes.
 */
function isValueEmpty(value: unknown, type: string): boolean {
  if (value === undefined || value === null) return true;
  if (type === 'string' && (value === '' || (typeof value === 'string' && value.trim() === ''))) return true;
  if (type === 'string[]' && (!Array.isArray(value) || value.length === 0)) return true;
  if (type === 'array' && (!Array.isArray(value) || value.length === 0)) return true;
  if (type === 'number' && (typeof value !== 'number' || Number.isNaN(value))) return true;
  if (type === 'boolean' && typeof value !== 'boolean') return true;
  return false;
}

/**
 * Attempts to get a value from nested object paths.
 * E.g., "issues.rent_arrears.arrears_items" -> facts.issues?.rent_arrears?.arrears_items
 */
function getNestedValue(facts: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = facts;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/**
 * Migrate legacy Wales case facts to canonical keys.
 *
 * FIX FOR ISSUE C: On load (Wales + notice_only only), this function:
 * - Normalizes wales_fault_grounds into string[]
 * - Copies values from legacy keys to new keys if new keys are empty
 * - NEVER overwrites if the new key already has data
 *
 * IMPORTANT: This function is idempotent and safe to call multiple times.
 * It only modifies facts if legacy data needs to be migrated.
 *
 * @param facts - The loaded wizard facts
 * @param jurisdiction - The jurisdiction (only runs for 'wales')
 * @param product - The product (only runs for 'notice_only')
 * @returns The migrated facts (new object, does not mutate input)
 */
export function migrateWalesLegacyFacts(
  facts: Record<string, unknown>,
  jurisdiction: string,
  product: string
): Record<string, unknown> {
  // Only run migration for Wales notice_only
  if (jurisdiction !== 'wales' || product !== 'notice_only') {
    return facts;
  }

  // Create a shallow copy to avoid mutating the original
  const migrated: Record<string, unknown> = { ...facts };
  const migrationLog: string[] = [];

  // 1. Normalize wales_fault_grounds to string[]
  const currentGrounds = migrated['wales_fault_grounds'];
  const normalizedGrounds = normalizeWalesFaultGrounds(currentGrounds);
  if (currentGrounds !== undefined && !Array.isArray(currentGrounds)) {
    migrated['wales_fault_grounds'] = normalizedGrounds;
    migrationLog.push(`Normalized wales_fault_grounds from ${typeof currentGrounds} to string[]`);
  }

  // 2. Migrate legacy keys to new keys
  for (const mapping of LEGACY_KEY_MAPPINGS) {
    const currentValue = migrated[mapping.newKey];

    // Skip if new key already has data
    if (!isValueEmpty(currentValue, mapping.type)) {
      continue;
    }

    // Try each legacy key
    for (const legacyKey of mapping.legacyKeys) {
      // Try direct key first
      let legacyValue = migrated[legacyKey];

      // Also try nested paths (e.g., issues.rent_arrears.arrears_items)
      if (legacyValue === undefined) {
        legacyValue = getNestedValue(migrated, legacyKey);
      }

      // If legacy value exists and is not empty, migrate it
      if (!isValueEmpty(legacyValue, mapping.type)) {
        // Special handling for string[] type (normalize to array)
        if (mapping.type === 'string[]') {
          migrated[mapping.newKey] = normalizeWalesFaultGrounds(legacyValue);
        } else {
          migrated[mapping.newKey] = legacyValue;
        }
        migrationLog.push(`Migrated ${legacyKey} -> ${mapping.newKey}`);
        break; // Use first found value
      }
    }
  }

  // 3. Special case: Check nested issues.rent_arrears.arrears_items
  if (isValueEmpty(migrated['arrears_items'], 'array')) {
    const nestedArrearsItems = getNestedValue(migrated, 'issues.rent_arrears.arrears_items');
    if (!isValueEmpty(nestedArrearsItems, 'array')) {
      migrated['arrears_items'] = nestedArrearsItems;
      migrationLog.push('Migrated issues.rent_arrears.arrears_items -> arrears_items');
    }
  }

  // Log migration if any changes were made (for debugging)
  if (migrationLog.length > 0) {
    console.debug('[Wales Legacy Migration]', migrationLog);
  }

  return migrated;
}
