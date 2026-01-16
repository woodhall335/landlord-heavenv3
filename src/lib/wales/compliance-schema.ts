/**
 * Wales Fault-Based Breach Notice Compliance Schema
 *
 * SINGLE SOURCE OF TRUTH for pre-service compliance requirements under the
 * Renting Homes (Wales) Act 2016.
 *
 * This module defines:
 * - All compliance fields for the wizard
 * - Validation and blocking rules
 * - Document generation mappings
 *
 * Used by:
 * - Wizard validation
 * - Pre-service checklist generation
 * - Service & validity checklist population
 *
 * SCOPE: Pre-service stage ONLY. No court application logic.
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
  | 'date'
  | 'upload';

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
  /** Conditional logic for when field applies */
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
  /** Block message shown to user */
  block_message?: string;
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
    question_text: 'Are you registered with Rent Smart Wales as a landlord?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Under the Housing (Wales) Act 2014, all landlords in Wales must be registered with Rent Smart Wales. An unregistered landlord cannot lawfully let property or serve valid notices.',
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
    question_text: 'Enter your Rent Smart Wales registration number',
    input_type: 'text',
    applies_if: 'rent_smart_wales_registered === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Registration number required for audit trail and compliance verification.',
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
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Under RH(W)A 2016 s.31, the landlord must provide a written statement of the occupation contract within 14 days. Failure to comply may result in compensation claims and undermines notice validity.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 2',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'The written statement of the occupation contract must be provided within 14 days. Proceeding without compliance may expose you to compensation claims. Do you wish to continue?',
  },
  {
    field_id: 'written_statement_date',
    category: 'occupation_contract',
    label: 'Written Statement Date',
    question_text: 'When was the written statement provided to the contract-holder?',
    input_type: 'date',
    applies_if: 'written_statement_provided === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Date verification ensures the 14-day requirement was met.',
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
    legal_basis:
      'Determines whether deposit protection requirements apply under the Housing (Wales) Act 2014.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'deposit_protected',
    category: 'deposit',
    label: 'Deposit Protected',
    question_text:
      'Has the deposit been protected in a Welsh Government-approved tenancy deposit scheme?',
    input_type: 'boolean',
    applies_if: 'deposit_taken === true',
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Under the Housing (Wales) Act 2014, deposits must be protected within 30 days. Failure to protect may expose landlord to compensation claims of up to 3x deposit amount. While not a statutory bar to fault-based notices, non-compliance creates defence opportunities.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'The deposit has not been protected. While not a statutory bar to fault-based notices, this may expose you to compensation claims of up to 3x deposit and create defence opportunities. Do you wish to continue?',
  },
  {
    field_id: 'deposit_scheme',
    category: 'deposit',
    label: 'Deposit Scheme',
    question_text: 'Which approved deposit scheme is the deposit protected with?',
    input_type: 'enum',
    enum_values: ['mydeposits_wales', 'dps', 'tds'],
    applies_if: 'deposit_protected === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Only Welsh Government-approved schemes are valid.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'prescribed_info_served',
    category: 'deposit',
    label: 'Prescribed Information Served',
    question_text:
      'Have you served the prescribed information about the deposit on the contract-holder within 30 days of receiving the deposit?',
    input_type: 'boolean',
    applies_if: 'deposit_taken === true',
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Prescribed information must be served within 30 days. Failure to comply may result in compensation awards and provide defence grounds.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'Prescribed deposit information has not been served within 30 days. This may result in compensation claims. Do you wish to continue?',
  },
  {
    field_id: 'prescribed_info_date',
    category: 'deposit',
    label: 'Prescribed Information Date',
    question_text: 'When was the prescribed information served on the contract-holder?',
    input_type: 'date',
    applies_if: 'prescribed_info_served === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Date verification ensures the 30-day requirement was met.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 3',
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
    question_text: 'Does the property have a gas supply?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'INFO_ONLY',
    legal_basis:
      'Determines applicability of Gas Safety (Installation and Use) Regulations 1998.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'gas_safety_certificate_valid',
    category: 'property_safety',
    label: 'Valid Gas Safety Certificate',
    question_text:
      'Do you have a valid Gas Safety Certificate (dated within the last 12 months)?',
    input_type: 'boolean',
    applies_if: 'gas_supply_present === true',
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Under the Gas Safety (Installation and Use) Regulations 1998, landlords must have gas appliances checked annually. Non-compliance is a criminal offence and may undermine possession proceedings.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'No valid Gas Safety Certificate. This is a criminal offence and may undermine your possession claim. Do you wish to continue?',
  },
  {
    field_id: 'gas_cert_expiry_date',
    category: 'property_safety',
    label: 'Gas Certificate Expiry Date',
    question_text: 'What is the expiry date of the current Gas Safety Certificate?',
    input_type: 'date',
    applies_if: 'gas_safety_certificate_valid === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Validates certificate is current at time of notice service.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.1',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'eicr_valid',
    category: 'property_safety',
    label: 'Valid EICR',
    question_text:
      'Do you have a valid Electrical Installation Condition Report (EICR) dated within the last 5 years?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'The Renting Homes (Wales) Act 2016 requires electrical safety standards. An EICR must be valid (within 5 years) and show satisfactory condition.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.2',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'No valid EICR. Electrical safety is required under Welsh law. Do you wish to continue?',
  },
  {
    field_id: 'eicr_next_inspection_date',
    category: 'property_safety',
    label: 'EICR Next Inspection Date',
    question_text: 'What is the next inspection due date on the EICR?',
    input_type: 'date',
    applies_if: 'eicr_valid === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Ensures EICR will remain valid throughout notice period.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.2',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'smoke_alarms_installed',
    category: 'property_safety',
    label: 'Smoke Alarms Installed',
    question_text: 'Are working smoke alarms installed on each floor of the property?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Under the Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022, smoke alarms must be installed and tested to confirm they are in working order at the start of each occupation.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'Smoke alarms must be installed on each floor. This is a fitness requirement under Welsh law. Do you wish to continue?',
  },
  {
    field_id: 'smoke_alarms_tested',
    category: 'property_safety',
    label: 'Smoke Alarms Tested',
    question_text: 'Have you tested the smoke alarms to confirm they are in working order?',
    input_type: 'boolean',
    applies_if: 'smoke_alarms_installed === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Testing requirement ensures alarms function correctly at occupation start.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.3',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'co_alarm_required',
    category: 'property_safety',
    label: 'CO Alarm Required',
    question_text:
      'Does the property have a solid fuel burning appliance (e.g., wood burner, coal fire) or gas appliance in a room used as sleeping accommodation?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Determines applicability of carbon monoxide alarm requirement.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.4',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'co_alarm_installed',
    category: 'property_safety',
    label: 'CO Alarm Installed',
    question_text: 'Is a working carbon monoxide alarm installed in the relevant rooms?',
    input_type: 'boolean',
    applies_if: 'co_alarm_required === true',
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Carbon monoxide alarms are required in rooms with solid fuel appliances under Welsh fitness standards.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.4',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'Carbon monoxide alarm required but not installed. Do you wish to continue?',
  },
  {
    field_id: 'property_fit_for_habitation',
    category: 'property_safety',
    label: 'Property Fit for Human Habitation',
    question_text:
      'Is the property fit for human habitation under the Renting Homes (Fitness for Human Habitation) (Wales) Regulations 2022?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Under RH(W)A 2016 and the Fitness Regulations, the landlord must ensure the dwelling is fit for human habitation. Non-compliance may provide defences to possession claims.',
    source_reference: 'PRE-SERVICE COMPLIANCE CHECKLIST - Wales, Item 4.5',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'Property may not be fit for human habitation. This may provide defences to your possession claim. Do you wish to continue?',
  },

  // ============================================
  // EVICTION SAFEGUARDS
  // ============================================
  {
    field_id: 'retaliatory_eviction_complaint',
    category: 'eviction_safeguards',
    label: 'Retaliatory Eviction Protection',
    question_text:
      'Has the contract-holder made a complaint about the condition of the property in the last 6 months?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'Section 217 RH(W)A 2016 provides protection against retaliatory eviction. If the contract-holder complained about property condition and the landlord served notice within 6 months, the court may refuse possession if it considers the notice was served in retaliation.',
    source_reference: 'SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message:
      'The contract-holder has complained about property condition in the last 6 months. The court may refuse possession if it considers this notice retaliatory under s.217 RH(W)A 2016. Do you wish to continue?',
  },
  {
    field_id: 'complaint_date',
    category: 'eviction_safeguards',
    label: 'Complaint Date',
    question_text: 'When did the contract-holder make the complaint?',
    input_type: 'date',
    applies_if: 'retaliatory_eviction_complaint === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Date required to assess 6-month retaliatory eviction protection window.',
    source_reference: 'SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'local_authority_investigation',
    category: 'eviction_safeguards',
    label: 'Local Authority Investigation',
    question_text:
      'Is there an ongoing local authority investigation or improvement notice relating to the property?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'An ongoing local authority investigation or enforcement action may trigger retaliatory eviction protections under s.217 RH(W)A 2016.',
    source_reference: 'SERVICE AND VALIDITY CHECKLIST - Wales, Safeguards Section',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message:
      'An ongoing local authority investigation may trigger retaliatory eviction protections. Do you wish to continue?',
  },

  // ============================================
  // FAULT-BASED GROUNDS
  // ============================================
  {
    field_id: 'wales_fault_grounds',
    category: 'fault_based_grounds',
    label: 'Statutory Ground Selection',
    question_text: 'Select the statutory ground(s) for the fault-based breach notice:',
    input_type: 'enum_multi',
    enum_values: [
      'rent_arrears_serious',
      'rent_arrears_other',
      'antisocial_behaviour',
      'breach_of_contract',
      'false_statement',
      'domestic_abuse',
    ],
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'At least one valid statutory ground must be selected under Sections 157, 159, 161, or 162 of RH(W)A 2016.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist', 'service_validity_checklist'],
    appears_on_notice: false,
    block_message: 'You must select at least one statutory ground for the fault-based notice.',
  },

  // ============================================
  // BREACH EVIDENCE
  // ============================================
  {
    field_id: 'evidence_exists',
    category: 'breach_evidence',
    label: 'Evidence Available',
    question_text: 'Do you have evidence to support the breach?',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Evidence of the breach is essential for a possession claim. Without evidence, the court cannot be satisfied the ground is made out.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'You must have evidence to support the breach. Without evidence, your possession claim will fail.',
  },
  {
    field_id: 'evidence_type',
    category: 'breach_evidence',
    label: 'Evidence Type',
    question_text: 'What type of evidence do you have? (Select all that apply)',
    input_type: 'enum_multi',
    enum_values: [
      'rent_statement',
      'bank_statements',
      'payment_records',
      'incident_log',
      'witness_statements',
      'police_reports',
      'local_authority_reports',
      'photographs',
      'correspondence',
      'contract_documents',
      'other',
    ],
    applies_if: 'evidence_exists === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Evidence type must be appropriate to the ground relied upon.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'arrears_amount',
    category: 'breach_evidence',
    label: 'Arrears Amount',
    question_text: 'What is the total amount of rent arrears outstanding?',
    input_type: 'number',
    applies_if:
      "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Arrears amount required for Section 157/159 grounds. Section 157 requires at least 2 months (or 8 weeks) unpaid.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'You must specify the arrears amount for rent arrears grounds.',
  },
  {
    field_id: 'arrears_schedule',
    category: 'breach_evidence',
    label: 'Arrears Schedule',
    question_text: 'Upload or enter the rent arrears schedule showing payment history:',
    input_type: 'upload',
    applies_if:
      "wales_fault_grounds.includes('rent_arrears_serious') || wales_fault_grounds.includes('rent_arrears_other')",
    blocking_level: 'SOFT_BLOCK',
    legal_basis:
      'A detailed arrears schedule strengthens the possession claim and demonstrates the arrears threshold is met.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'An arrears schedule is strongly recommended to support your claim. Do you wish to continue without one?',
  },
  {
    field_id: 'asb_incident_description',
    category: 'breach_evidence',
    label: 'ASB Incident Description',
    question_text:
      'Describe the anti-social behaviour incidents (include dates, times, locations, and what occurred):',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('antisocial_behaviour')",
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Particulars of the anti-social behaviour must be provided to support a Section 161 claim.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'You must describe the anti-social behaviour incidents to proceed with Section 161.',
  },
  {
    field_id: 'asb_police_involved',
    category: 'breach_evidence',
    label: 'Police Involvement',
    question_text: 'Have the police been involved in any of the ASB incidents?',
    input_type: 'boolean',
    applies_if: "wales_fault_grounds.includes('antisocial_behaviour')",
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Police involvement strengthens evidence but is not mandatory.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'asb_police_reference',
    category: 'breach_evidence',
    label: 'Police Reference Number',
    question_text: 'Enter the police crime reference number(s):',
    input_type: 'text',
    applies_if: 'asb_police_involved === true',
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Reference numbers allow verification and strengthen evidence.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'asb_witness_statements',
    category: 'breach_evidence',
    label: 'Witness Statements Available',
    question_text: 'Do you have witness statements supporting the ASB allegations?',
    input_type: 'boolean',
    applies_if: "wales_fault_grounds.includes('antisocial_behaviour')",
    blocking_level: 'SOFT_BLOCK',
    legal_basis: 'Witness statements provide independent corroboration of ASB incidents.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'Witness statements strengthen ASB claims. Do you wish to continue without them?',
  },
  {
    field_id: 'breach_clause_identified',
    category: 'breach_evidence',
    label: 'Breached Clause Identified',
    question_text: 'Which clause or term of the occupation contract has been breached?',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('breach_of_contract')",
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'The specific breached term must be identified for a Section 159 breach claim.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message:
      'You must identify the specific clause breached to proceed with Section 159/162.',
  },
  {
    field_id: 'breach_description',
    category: 'breach_evidence',
    label: 'Breach Description',
    question_text: 'Describe how the contract-holder has breached this term:',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('breach_of_contract')",
    blocking_level: 'HARD_BLOCK',
    legal_basis: 'Particulars of the breach must be provided to support the claim.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'You must describe how the clause was breached.',
  },
  {
    field_id: 'false_statement_description',
    category: 'breach_evidence',
    label: 'False Statement Description',
    question_text:
      'What false statement did the contract-holder make to obtain the contract?',
    input_type: 'text',
    applies_if: "wales_fault_grounds.includes('false_statement')",
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'The specific false statement must be identified for a Section 159 false statement claim.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'You must describe the false statement made.',
  },
  {
    field_id: 'false_statement_discovery_date',
    category: 'breach_evidence',
    label: 'Discovery Date',
    question_text: 'When did you discover the statement was false?',
    input_type: 'date',
    applies_if: "wales_fault_grounds.includes('false_statement')",
    blocking_level: 'INFO_ONLY',
    legal_basis: 'Date of discovery relevant to timing and reasonableness.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
  },
  {
    field_id: 'user_declaration',
    category: 'breach_evidence',
    label: 'User Declaration',
    question_text:
      'I confirm that the information provided is true and accurate to the best of my knowledge, and I understand that serving a notice without proper grounds or evidence may result in legal liability.',
    input_type: 'boolean',
    applies_if: null,
    blocking_level: 'HARD_BLOCK',
    legal_basis:
      'Declaration required for audit trail and user acknowledgment of responsibilities.',
    source_reference: 'Service Instructions for Fault-Based Breach Notice (Wales)',
    feeds_documents: ['pre_service_checklist'],
    appears_on_notice: false,
    block_message: 'You must confirm the declaration to proceed.',
  },
];

/**
 * Wizard tab definitions for Wales fault-based breach notice
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
    description: 'Contract compliance verification',
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
    description: 'Deposit protection compliance',
  },
  {
    order: 4,
    name: 'Property Compliance',
    field_ids: [
      'gas_supply_present',
      'gas_safety_certificate_valid',
      'gas_cert_expiry_date',
      'eicr_valid',
      'eicr_next_inspection_date',
      'smoke_alarms_installed',
      'smoke_alarms_tested',
      'co_alarm_required',
      'co_alarm_installed',
      'property_fit_for_habitation',
    ],
    description: 'Safety certificate verification',
  },
  {
    order: 5,
    name: 'Breach Details',
    field_ids: [
      'wales_fault_grounds',
      'evidence_exists',
      'evidence_type',
      'arrears_amount',
      'arrears_schedule',
      'asb_incident_description',
      'asb_police_involved',
      'asb_police_reference',
      'asb_witness_statements',
      'breach_clause_identified',
      'breach_description',
      'false_statement_description',
      'false_statement_discovery_date',
    ],
    description: 'Ground selection and evidence',
  },
  {
    order: 6,
    name: 'Safeguards',
    field_ids: [
      'retaliatory_eviction_complaint',
      'complaint_date',
      'local_authority_investigation',
    ],
    description: 'Eviction safeguard checks',
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
  schema_version: '1.0',
  jurisdiction: 'wales',
  product: 'notice_only',
  notice_type: 'fault_based_breach',
  legislation: 'Renting Homes (Wales) Act 2016',
  compliance_fields: WALES_COMPLIANCE_FIELDS,
  wizard_tabs: WALES_WIZARD_TABS,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a compliance field by ID
 */
export function getComplianceFieldById(fieldId: string): ComplianceField | undefined {
  return WALES_COMPLIANCE_FIELDS.find((f) => f.field_id === fieldId);
}

/**
 * Get all compliance fields for a category
 */
export function getComplianceFieldsByCategory(category: ComplianceCategory): ComplianceField[] {
  return WALES_COMPLIANCE_FIELDS.filter((f) => f.category === category);
}

/**
 * Get all fields with a specific blocking level
 */
export function getFieldsByBlockingLevel(level: BlockingLevel): ComplianceField[] {
  return WALES_COMPLIANCE_FIELDS.filter((f) => f.blocking_level === level);
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
 * Check if a field should be displayed based on applies_if condition
 * Note: This is a simplified version - actual implementation should use
 * a proper expression evaluator
 */
export function shouldFieldApply(
  fieldId: string,
  facts: Record<string, unknown>
): boolean {
  const field = getComplianceFieldById(fieldId);
  if (!field) return false;
  if (!field.applies_if) return true;

  // Simple condition checking - extend as needed
  const condition = field.applies_if;

  // Handle simple boolean checks
  if (condition.includes('===')) {
    const [key, value] = condition.split('===').map((s) => s.trim());
    const factValue = facts[key];
    if (value === 'true') return factValue === true;
    if (value === 'false') return factValue === false;
    return String(factValue) === value;
  }

  // Handle includes checks for arrays
  if (condition.includes('.includes(')) {
    const match = condition.match(/(\w+)\.includes\(['"](\w+)['"]\)/);
    if (match) {
      const [, arrayKey, searchValue] = match;
      const arr = facts[arrayKey];
      if (Array.isArray(arr)) {
        return arr.includes(searchValue);
      }
    }
  }

  // Default: show field if condition parsing fails
  return true;
}

/**
 * Get all hard blocking fields that are not satisfied
 */
export function getBlockingViolations(
  facts: Record<string, unknown>
): Array<{ field: ComplianceField; message: string }> {
  const violations: Array<{ field: ComplianceField; message: string }> = [];

  for (const field of WALES_COMPLIANCE_FIELDS) {
    if (field.blocking_level !== 'HARD_BLOCK') continue;
    if (!shouldFieldApply(field.field_id, facts)) continue;

    const value = facts[field.field_id];

    // Check boolean fields that must be true
    if (field.input_type === 'boolean' && value !== true) {
      violations.push({
        field,
        message: field.block_message || `${field.label} is required`,
      });
    }

    // Check required text/number fields
    if (
      (field.input_type === 'text' || field.input_type === 'number') &&
      (value === undefined || value === null || value === '')
    ) {
      violations.push({
        field,
        message: field.block_message || `${field.label} is required`,
      });
    }

    // Check enum_multi fields require at least one selection
    if (
      field.input_type === 'enum_multi' &&
      (!Array.isArray(value) || value.length === 0)
    ) {
      violations.push({
        field,
        message: field.block_message || `At least one ${field.label} must be selected`,
      });
    }
  }

  return violations;
}

/**
 * Get all soft blocking warnings
 */
export function getSoftBlockWarnings(
  facts: Record<string, unknown>
): Array<{ field: ComplianceField; message: string }> {
  const warnings: Array<{ field: ComplianceField; message: string }> = [];

  for (const field of WALES_COMPLIANCE_FIELDS) {
    if (field.blocking_level !== 'SOFT_BLOCK') continue;
    if (!shouldFieldApply(field.field_id, facts)) continue;

    const value = facts[field.field_id];

    // Check boolean fields that should be true
    if (field.input_type === 'boolean' && value !== true) {
      warnings.push({
        field,
        message: field.block_message || `Warning: ${field.label} compliance issue`,
      });
    }
  }

  return warnings;
}
