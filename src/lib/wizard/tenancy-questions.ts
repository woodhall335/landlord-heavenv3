/**
 * Fixed Tenancy Agreement Questions
 *
 * Structured, reliable question flow that guarantees all required fields are collected
 */

export interface WizardField {
  id: string;
  label: string;
  inputType: 'text' | 'email' | 'tel' | 'date' | 'select' | 'number' | 'currency';
  placeholder?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  width?: 'full' | 'half' | 'third';
}

export interface WizardQuestion {
  id: string;
  section: string;
  question: string;
  inputType: 'text' | 'email' | 'tel' | 'date' | 'select' | 'number' | 'currency' | 'yes_no' | 'multi_select' | 'group';
  placeholder?: string;
  helperText?: string;
  options?: string[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
  dependsOn?: {
    questionId: string;
    value: any;
  };
  // For grouped inputs (multiple fields on one page)
  fields?: WizardField[];
}

export const TENANCY_AGREEMENT_QUESTIONS: WizardQuestion[] = [
  // ============================================================================
  // SECTION 1: PROPERTY DETAILS
  // ============================================================================
  {
    id: 'property_address',
    section: 'Property Details',
    question: 'Property address',
    inputType: 'group',
    helperText: 'The full address of the rental property',
    fields: [
      {
        id: 'property_address_line1',
        label: 'Street address',
        inputType: 'text',
        placeholder: 'Flat 2, 123 High Street',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'property_address_town',
        label: 'Town/City',
        inputType: 'text',
        placeholder: 'London',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'property_address_postcode',
        label: 'Postcode',
        inputType: 'text',
        placeholder: 'SW1A 1AA',
        validation: { required: true, pattern: '^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$' },
        width: 'half',
      },
    ],
  },
  {
    id: 'property_type',
    section: 'Property Details',
    question: 'What type of property is it?',
    inputType: 'select',
    options: ['House', 'Flat', 'Studio', 'Room in shared house'],
    validation: { required: true },
  },
  {
    id: 'furnished_status',
    section: 'Property Details',
    question: 'Is the property furnished?',
    inputType: 'select',
    options: ['Furnished', 'Unfurnished', 'Part-furnished'],
    helperText: 'Furnished = includes furniture. Unfurnished = no furniture. Part-furnished = some items included.',
    validation: { required: true },
  },
  {
    id: 'number_of_bedrooms',
    section: 'Property Details',
    question: 'How many bedrooms does the property have?',
    inputType: 'number',
    validation: { required: true, min: 0, max: 20 },
  },

  // ============================================================================
  // SECTION 2: LANDLORD DETAILS
  // ============================================================================
  {
    id: 'landlord_details',
    section: 'Landlord Details',
    question: 'Your details (as landlord)',
    inputType: 'group',
    helperText: 'Your full name and contact information',
    fields: [
      {
        id: 'landlord_full_name',
        label: 'Full name',
        inputType: 'text',
        placeholder: 'John Smith',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'landlord_email',
        label: 'Email address',
        inputType: 'email',
        placeholder: 'landlord@example.com',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'landlord_phone',
        label: 'Phone number',
        inputType: 'tel',
        placeholder: '07700 900000',
        validation: { required: true },
        width: 'half',
      },
    ],
  },
  {
    id: 'landlord_address',
    section: 'Landlord Details',
    question: 'Your address',
    inputType: 'group',
    helperText: 'Your personal or business address (not the rental property)',
    fields: [
      {
        id: 'landlord_address_line1',
        label: 'Street address',
        inputType: 'text',
        placeholder: '456 Park Avenue',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'landlord_address_town',
        label: 'Town/City',
        inputType: 'text',
        placeholder: 'London',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'landlord_address_postcode',
        label: 'Postcode',
        inputType: 'text',
        placeholder: 'W1A 2BB',
        validation: { required: true, pattern: '^[A-Z]{1,2}\\d{1,2}[A-Z]?\\s?\\d[A-Z]{2}$' },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 3: TENANT DETAILS
  // ============================================================================
  {
    id: 'number_of_tenants',
    section: 'Tenant Details',
    question: 'How many tenants will be on the agreement?',
    inputType: 'select',
    options: ['1', '2', '3', '4', '5', '6'],
    validation: { required: true },
  },
  {
    id: 'tenant_1_details',
    section: 'Tenant Details',
    question: 'Tenant 1 details',
    inputType: 'group',
    helperText: 'Primary tenant information',
    fields: [
      {
        id: 'tenant_1_full_name',
        label: 'Full name',
        inputType: 'text',
        placeholder: 'Jane Doe',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'tenant_1_email',
        label: 'Email address',
        inputType: 'email',
        placeholder: 'jane@example.com',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenant_1_phone',
        label: 'Phone number',
        inputType: 'tel',
        placeholder: '07700 900001',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenant_1_dob',
        label: 'Date of birth',
        inputType: 'date',
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // Tenant 2 (conditional)
  {
    id: 'tenant_2_details',
    section: 'Tenant Details',
    question: 'Tenant 2 details',
    inputType: 'group',
    helperText: 'Second tenant information',
    dependsOn: { questionId: 'number_of_tenants', value: ['2', '3', '4', '5', '6'] },
    fields: [
      {
        id: 'tenant_2_full_name',
        label: 'Full name',
        inputType: 'text',
        placeholder: 'John Doe',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'tenant_2_email',
        label: 'Email address',
        inputType: 'email',
        placeholder: 'john@example.com',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenant_2_phone',
        label: 'Phone number',
        inputType: 'tel',
        placeholder: '07700 900002',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenant_2_dob',
        label: 'Date of birth',
        inputType: 'date',
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 4: TENANCY TERM
  // ============================================================================
  {
    id: 'tenancy_start_date',
    section: 'Tenancy Term',
    question: 'When does the tenancy start?',
    inputType: 'date',
    helperText: 'The date when the tenant can move in',
    validation: { required: true },
  },
  {
    id: 'is_fixed_term',
    section: 'Tenancy Term',
    question: 'Is this a fixed-term or periodic tenancy?',
    inputType: 'select',
    options: ['Fixed term (set end date)', 'Periodic (rolling monthly)'],
    helperText: 'Fixed term = specific end date. Periodic = continues month-to-month.',
    validation: { required: true },
  },
  {
    id: 'term_length',
    section: 'Tenancy Term',
    question: 'How long is the fixed term?',
    inputType: 'select',
    options: ['6 months', '12 months', '18 months', '24 months', '36 months'],
    validation: { required: true },
    dependsOn: { questionId: 'is_fixed_term', value: 'Fixed term (set end date)' },
  },
  {
    id: 'tenancy_end_date',
    section: 'Tenancy Term',
    question: 'When does the fixed term end?',
    inputType: 'date',
    helperText: 'The last day of the tenancy agreement',
    validation: { required: true },
    dependsOn: { questionId: 'is_fixed_term', value: 'Fixed term (set end date)' },
  },

  // ============================================================================
  // SECTION 5: RENT
  // ============================================================================
  {
    id: 'rent_amount',
    section: 'Rent',
    question: 'What is the monthly rent amount?',
    inputType: 'currency',
    placeholder: '1200',
    helperText: 'Enter the amount in pounds (e.g., 1200 for £1,200)',
    validation: { required: true, min: 1 },
  },
  {
    id: 'rent_due_day',
    section: 'Rent',
    question: 'What day of the month is rent due?',
    inputType: 'select',
    options: Array.from({ length: 28 }, (_, i) => `${i + 1}${getOrdinalSuffix(i + 1)}`),
    helperText: 'The day each month when rent must be paid',
    validation: { required: true },
  },
  {
    id: 'payment_method',
    section: 'Rent',
    question: 'How should rent be paid?',
    inputType: 'select',
    options: ['Standing Order', 'Bank Transfer', 'Direct Debit'],
    validation: { required: true },
  },
  {
    id: 'bank_details',
    section: 'Rent',
    question: 'Bank account details (to receive rent)',
    inputType: 'group',
    helperText: 'Your bank account information for receiving rent payments',
    fields: [
      {
        id: 'bank_account_name',
        label: 'Account name',
        inputType: 'text',
        placeholder: 'John Smith',
        validation: { required: true },
        width: 'full',
      },
      {
        id: 'bank_sort_code',
        label: 'Sort code',
        inputType: 'text',
        placeholder: '12-34-56',
        validation: { required: true, pattern: '^\\d{2}-\\d{2}-\\d{2}$' },
        width: 'half',
      },
      {
        id: 'bank_account_number',
        label: 'Account number',
        inputType: 'text',
        placeholder: '12345678',
        validation: { required: true, pattern: '^\\d{8}$' },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 6: DEPOSIT (Jurisdiction-specific)
  // ============================================================================
  {
    id: 'deposit_amount',
    section: 'Deposit',
    question: 'What is the deposit amount?',
    inputType: 'currency',
    placeholder: '1400',
    helperText: 'England & Wales: Max 5 weeks rent. Scotland: Max 2 months rent. Northern Ireland: Max 2 months rent (recommended)',
    validation: { required: true, min: 0 },
  },
  {
    id: 'deposit_scheme',
    section: 'Deposit',
    question: 'Which deposit protection scheme will you use?',
    inputType: 'select',
    options: [], // Will be populated based on jurisdiction
    helperText: 'Required by law to protect tenant deposits',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 7: BILLS & UTILITIES
  // ============================================================================
  {
    id: 'council_tax_responsibility',
    section: 'Bills & Utilities',
    question: 'Who pays council tax?',
    inputType: 'select',
    options: ['Tenant', 'Landlord', 'Included in rent'],
    validation: { required: true },
  },
  {
    id: 'utilities_responsibility',
    section: 'Bills & Utilities',
    question: 'Who pays utilities (gas, electric, water)?',
    inputType: 'select',
    options: ['Tenant', 'Landlord', 'Included in rent'],
    validation: { required: true },
  },
  {
    id: 'internet_responsibility',
    section: 'Bills & Utilities',
    question: 'Who pays for internet/broadband?',
    inputType: 'select',
    options: ['Tenant', 'Landlord', 'Included in rent'],
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 8: PROPERTY RULES
  // ============================================================================
  {
    id: 'pets_allowed',
    section: 'Property Rules',
    question: 'Are pets allowed?',
    inputType: 'yes_no',
    validation: { required: true },
  },
  {
    id: 'approved_pets',
    section: 'Property Rules',
    question: 'What pets are allowed?',
    inputType: 'multi_select',
    options: ['Cats', 'Dogs', 'Small caged animals (hamsters, etc.)', 'Fish'],
    dependsOn: { questionId: 'pets_allowed', value: 'yes' },
  },
  {
    id: 'smoking_allowed',
    section: 'Property Rules',
    question: 'Is smoking allowed inside the property?',
    inputType: 'yes_no',
    validation: { required: true },
  },
  {
    id: 'parking_available',
    section: 'Property Rules',
    question: 'Is parking included?',
    inputType: 'yes_no',
    validation: { required: true },
  },
  {
    id: 'parking_details',
    section: 'Property Rules',
    question: 'Parking details',
    inputType: 'text',
    placeholder: 'Space number 12, or street parking permit',
    dependsOn: { questionId: 'parking_available', value: 'yes' },
  },

  // ============================================================================
  // SECTION 9: LEGAL COMPLIANCE & SAFETY
  // ============================================================================
  {
    id: 'gas_safety_certificate',
    section: 'Legal Compliance',
    question: 'Do you have a valid Gas Safety Certificate?',
    inputType: 'yes_no',
    helperText: 'Required by law if property has gas appliances. Must be renewed annually.',
    validation: { required: true },
  },
  {
    id: 'epc_rating',
    section: 'Legal Compliance',
    question: 'What is the Energy Performance Certificate (EPC) rating?',
    inputType: 'select',
    options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    helperText: 'Minimum rating E required for new tenancies. Must be valid and provided to tenant.',
    validation: { required: true },
  },
  {
    id: 'electrical_safety_certificate',
    section: 'Legal Compliance',
    question: 'Do you have an Electrical Installation Condition Report (EICR)?',
    inputType: 'yes_no',
    helperText: 'Required every 5 years for private rented properties (England from June 2020)',
    validation: { required: true },
  },
  {
    id: 'smoke_alarms_fitted',
    section: 'Legal Compliance',
    question: 'Are smoke alarms fitted on every floor?',
    inputType: 'yes_no',
    helperText: 'Legal requirement: smoke alarms on every storey',
    validation: { required: true },
  },
  {
    id: 'carbon_monoxide_alarms',
    section: 'Legal Compliance',
    question: 'Are carbon monoxide alarms fitted?',
    inputType: 'yes_no',
    helperText: 'Required in rooms with solid fuel appliances (e.g., coal fire, wood burner)',
    validation: { required: true },
  },
  {
    id: 'how_to_rent_guide_provided',
    section: 'Legal Compliance',
    question: 'Will you provide the "How to Rent" guide to tenants?',
    inputType: 'yes_no',
    helperText: 'England only: Must provide latest version before or at start of tenancy',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 10: MAINTENANCE & REPAIRS
  // ============================================================================
  {
    id: 'landlord_maintenance_responsibilities',
    section: 'Maintenance & Repairs',
    question: 'Who is responsible for repairs to the structure and exterior?',
    inputType: 'select',
    options: ['Landlord (standard)', 'Shared responsibility', 'Other arrangement'],
    helperText: 'Usually landlord by law for structure, exterior, heating, water, sanitation',
    validation: { required: true },
  },
  {
    id: 'garden_maintenance',
    section: 'Maintenance & Repairs',
    question: 'Is there a garden? If yes, who maintains it?',
    inputType: 'select',
    options: ['No garden', 'Tenant maintains', 'Landlord maintains', 'Shared/professional gardener'],
    helperText: 'Specify garden maintenance responsibilities',
    validation: { required: true },
  },
  {
    id: 'repairs_reporting_method',
    section: 'Maintenance & Repairs',
    question: 'How should tenants report repairs?',
    inputType: 'select',
    options: ['Email', 'Phone', 'Online portal', 'Via agent'],
    helperText: 'Preferred method for repair requests',
    validation: { required: true },
  },
  {
    id: 'emergency_contact',
    section: 'Maintenance & Repairs',
    question: 'Emergency contact number (24/7)',
    inputType: 'tel',
    placeholder: '07700 900000',
    helperText: 'For urgent repairs (e.g., burst pipes, no heating in winter)',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 11: PROPERTY CONDITION & INVENTORY
  // ============================================================================
  {
    id: 'inventory_provided',
    section: 'Property Condition',
    question: 'Will a detailed inventory be provided?',
    inputType: 'yes_no',
    helperText: 'Recommended: detailed inventory with photos protects both parties',
    validation: { required: true },
  },
  {
    id: 'professional_cleaning_required',
    section: 'Property Condition',
    question: 'Is professional cleaning required at end of tenancy?',
    inputType: 'yes_no',
    helperText: 'If yes, tenant must return property to same cleanliness standard',
    validation: { required: true },
  },
  {
    id: 'decoration_condition',
    section: 'Property Condition',
    question: 'Are tenants allowed to decorate/make alterations?',
    inputType: 'select',
    options: ['No alterations allowed', 'With written permission only', 'Minor alterations allowed (e.g., picture hooks)'],
    helperText: 'Specify decoration and alteration policy',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 12: TENANCY TERMS & CONDITIONS
  // ============================================================================
  {
    id: 'break_clause',
    section: 'Tenancy Terms',
    question: 'Is there a break clause?',
    inputType: 'yes_no',
    helperText: 'Break clause allows either party to end tenancy early',
    validation: { required: true },
  },
  {
    id: 'break_clause_months',
    section: 'Tenancy Terms',
    question: 'Break clause can be exercised after how many months?',
    inputType: 'select',
    options: ['6 months', '9 months', '12 months'],
    helperText: 'When break clause becomes active',
    validation: { required: true },
    dependsOn: { questionId: 'break_clause', value: 'yes' },
  },
  {
    id: 'break_clause_notice_period',
    section: 'Tenancy Terms',
    question: 'How much notice for break clause?',
    inputType: 'select',
    options: ['1 month', '2 months', '3 months'],
    helperText: 'Notice period required to activate break clause',
    validation: { required: true },
    dependsOn: { questionId: 'break_clause', value: 'yes' },
  },
  {
    id: 'subletting_allowed',
    section: 'Tenancy Terms',
    question: 'Is subletting allowed?',
    inputType: 'select',
    options: ['Not allowed', 'With written permission only', 'Allowed'],
    helperText: 'Can tenant rent rooms to others? Usually not allowed.',
    validation: { required: true },
  },
  {
    id: 'rent_increase_clause',
    section: 'Tenancy Terms',
    question: 'Is there a rent review/increase clause?',
    inputType: 'yes_no',
    helperText: 'Allow rent increases during tenancy (must follow legal procedures)',
    validation: { required: true },
  },
  {
    id: 'rent_increase_frequency',
    section: 'Tenancy Terms',
    question: 'How often can rent be reviewed?',
    inputType: 'select',
    options: ['Annually', 'Every 2 years', 'At landlord discretion (with notice)'],
    helperText: 'Frequency of permitted rent reviews',
    validation: { required: true },
    dependsOn: { questionId: 'rent_increase_clause', value: 'yes' },
  },

  // ============================================================================
  // SECTION 13: INSURANCE & LIABILITY
  // ============================================================================
  {
    id: 'landlord_insurance',
    section: 'Insurance',
    question: 'Do you have landlord insurance?',
    inputType: 'yes_no',
    helperText: 'Landlord insurance covers building, landlord liability',
    validation: { required: true },
  },
  {
    id: 'tenant_insurance_required',
    section: 'Insurance',
    question: 'Do you require tenants to have contents insurance?',
    inputType: 'select',
    options: ['Not required', 'Recommended', 'Required'],
    helperText: 'Tenant contents insurance protects their belongings',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 14: ACCESS & VIEWINGS
  // ============================================================================
  {
    id: 'landlord_access_notice',
    section: 'Access & Viewings',
    question: 'How much notice for landlord access (inspections)?',
    inputType: 'select',
    options: ['24 hours', '48 hours', '1 week'],
    helperText: 'Legally must give 24 hours notice except emergencies',
    validation: { required: true },
  },
  {
    id: 'inspection_frequency',
    section: 'Access & Viewings',
    question: 'How often will property inspections occur?',
    inputType: 'select',
    options: ['Monthly', 'Quarterly', 'Every 6 months', 'Annually', 'As needed'],
    helperText: 'Regular inspections to check property condition',
    validation: { required: true },
  },
  {
    id: 'end_of_tenancy_viewings',
    section: 'Access & Viewings',
    question: 'Allow viewings for new tenants during final month?',
    inputType: 'yes_no',
    helperText: 'Can landlord show property to prospective tenants before current tenancy ends?',
    validation: { required: true },
  },

  // ============================================================================
  // SECTION 15: ADDITIONAL TERMS
  // ============================================================================
  {
    id: 'white_goods_included',
    section: 'Additional Terms',
    question: 'What white goods/appliances are included?',
    inputType: 'multi_select',
    options: ['Washing machine', 'Dishwasher', 'Fridge/freezer', 'Oven/hob', 'Microwave', 'Tumble dryer'],
    helperText: 'Select all appliances included in the property',
  },
  {
    id: 'communal_areas',
    section: 'Additional Terms',
    question: 'Are there shared/communal areas?',
    inputType: 'yes_no',
    helperText: 'e.g., shared hallway, stairwell, garden (common in flats)',
    validation: { required: true },
  },
  {
    id: 'communal_cleaning',
    section: 'Additional Terms',
    question: 'Who cleans communal areas?',
    inputType: 'select',
    options: ['Professional cleaner', 'Tenants share', 'Landlord', 'Not applicable'],
    helperText: 'Responsibility for maintaining shared spaces',
    validation: { required: true },
    dependsOn: { questionId: 'communal_areas', value: 'yes' },
  },
  {
    id: 'recycling_bins',
    section: 'Additional Terms',
    question: 'Are recycling bins provided?',
    inputType: 'yes_no',
    helperText: 'Information about waste disposal arrangements',
    validation: { required: true },
  },
];


// Helper function for ordinal suffixes
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// Get jurisdiction-specific deposit schemes
export function getDepositSchemes(jurisdiction: string): string[] {
  switch (jurisdiction) {
    case 'england-wales':
      return [
        'Deposit Protection Service (DPS)',
        'MyDeposits',
        'Tenancy Deposit Scheme (TDS)',
      ];
    case 'scotland':
      return [
        'SafeDeposits Scotland',
        'MyDeposits Scotland',
        'Letting Protection Service Scotland',
      ];
    case 'northern-ireland':
      return [
        'TDS Northern Ireland',
        'MyDeposits Northern Ireland',
      ];
    default:
      return [];
  }
}

// Get jurisdiction-specific max deposit
export function getMaxDeposit(jurisdiction: string, rentAmount: number): number {
  const monthlyRent = rentAmount;
  const weeklyRent = monthlyRent / 4.33;

  switch (jurisdiction) {
    case 'england-wales':
      // Tenant Fees Act 2019: 5 weeks (or 6 if annual rent > £50k)
      const annualRent = monthlyRent * 12;
      const maxWeeks = annualRent > 50000 ? 6 : 5;
      return weeklyRent * maxWeeks;
    case 'scotland':
      // Scotland: Max 2 months rent
      return monthlyRent * 2;
    case 'northern-ireland':
      // NI: Max 2 months rent (guidance)
      return monthlyRent * 2;
    default:
      return 0;
  }
}

// Get jurisdiction-specific questions
export function getJurisdictionQuestions(jurisdiction: string): WizardQuestion[] {
  return TENANCY_AGREEMENT_QUESTIONS.map(q => {
    // Update deposit scheme options
    if (q.id === 'deposit_scheme') {
      return {
        ...q,
        options: getDepositSchemes(jurisdiction),
      };
    }
    return q;
  });
}
