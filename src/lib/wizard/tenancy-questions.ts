/**
 * Fixed Tenancy Agreement Questions
 *
 * Structured, reliable question flow that guarantees all required fields are collected
 */

export interface WizardQuestion {
  id: string;
  section: string;
  question: string;
  inputType: 'text' | 'email' | 'tel' | 'date' | 'select' | 'number' | 'currency' | 'yes_no' | 'multi_select';
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
}

export const TENANCY_AGREEMENT_QUESTIONS: WizardQuestion[] = [
  // ============================================================================
  // SECTION 1: PROPERTY DETAILS
  // ============================================================================
  {
    id: 'property_address',
    section: 'Property Details',
    question: 'What is the full address of the property?',
    inputType: 'text',
    placeholder: '123 High Street, London, SW1A 1AA',
    helperText: 'Include house/flat number, street, city, and postcode',
    validation: { required: true },
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
    id: 'landlord_full_name',
    section: 'Landlord Details',
    question: 'What is your full name (as landlord)?',
    inputType: 'text',
    placeholder: 'John Smith',
    validation: { required: true },
  },
  {
    id: 'landlord_address',
    section: 'Landlord Details',
    question: 'What is your address (landlord)?',
    inputType: 'text',
    placeholder: '456 Park Avenue, London, W1A 2BB',
    helperText: 'Your personal or business address (not the rental property)',
    validation: { required: true },
  },
  {
    id: 'landlord_email',
    section: 'Landlord Details',
    question: 'What is your email address?',
    inputType: 'email',
    placeholder: 'landlord@example.com',
    validation: { required: true },
  },
  {
    id: 'landlord_phone',
    section: 'Landlord Details',
    question: 'What is your phone number?',
    inputType: 'tel',
    placeholder: '07700 900000',
    validation: { required: true },
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
    id: 'tenant_1_full_name',
    section: 'Tenant Details',
    question: 'Tenant 1: Full name',
    inputType: 'text',
    placeholder: 'Jane Doe',
    validation: { required: true },
  },
  {
    id: 'tenant_1_email',
    section: 'Tenant Details',
    question: 'Tenant 1: Email address',
    inputType: 'email',
    placeholder: 'jane@example.com',
    validation: { required: true },
  },
  {
    id: 'tenant_1_phone',
    section: 'Tenant Details',
    question: 'Tenant 1: Phone number',
    inputType: 'tel',
    placeholder: '07700 900001',
    validation: { required: true },
  },
  {
    id: 'tenant_1_dob',
    section: 'Tenant Details',
    question: 'Tenant 1: Date of birth',
    inputType: 'date',
    helperText: 'Required for legal identification',
    validation: { required: true },
  },

  // Tenant 2 (conditional)
  {
    id: 'tenant_2_full_name',
    section: 'Tenant Details',
    question: 'Tenant 2: Full name',
    inputType: 'text',
    placeholder: 'John Doe',
    validation: { required: true },
    dependsOn: { questionId: 'number_of_tenants', value: ['2', '3', '4', '5', '6'] },
  },
  {
    id: 'tenant_2_email',
    section: 'Tenant Details',
    question: 'Tenant 2: Email address',
    inputType: 'email',
    placeholder: 'john@example.com',
    validation: { required: true },
    dependsOn: { questionId: 'number_of_tenants', value: ['2', '3', '4', '5', '6'] },
  },
  {
    id: 'tenant_2_phone',
    section: 'Tenant Details',
    question: 'Tenant 2: Phone number',
    inputType: 'tel',
    placeholder: '07700 900002',
    validation: { required: true },
    dependsOn: { questionId: 'number_of_tenants', value: ['2', '3', '4', '5', '6'] },
  },
  {
    id: 'tenant_2_dob',
    section: 'Tenant Details',
    question: 'Tenant 2: Date of birth',
    inputType: 'date',
    validation: { required: true },
    dependsOn: { questionId: 'number_of_tenants', value: ['2', '3', '4', '5', '6'] },
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
    id: 'bank_account_name',
    section: 'Rent',
    question: 'Bank account name (to receive rent)',
    inputType: 'text',
    placeholder: 'John Smith',
    validation: { required: true },
  },
  {
    id: 'bank_sort_code',
    section: 'Rent',
    question: 'Sort code',
    inputType: 'text',
    placeholder: '12-34-56',
    validation: { required: true, pattern: '^\\d{2}-\\d{2}-\\d{2}$' },
  },
  {
    id: 'bank_account_number',
    section: 'Rent',
    question: 'Account number',
    inputType: 'text',
    placeholder: '12345678',
    validation: { required: true, pattern: '^\\d{8}$' },
  },

  // ============================================================================
  // SECTION 6: DEPOSIT
  // ============================================================================
  {
    id: 'deposit_amount',
    section: 'Deposit',
    question: 'What is the deposit amount?',
    inputType: 'currency',
    placeholder: '1400',
    helperText: 'Maximum: 5 weeks rent (calculated automatically)',
    validation: { required: true, min: 0 },
  },
  {
    id: 'deposit_scheme',
    section: 'Deposit',
    question: 'Which deposit protection scheme will you use?',
    inputType: 'select',
    options: [
      'Deposit Protection Service (DPS)',
      'MyDeposits',
      'Tenancy Deposit Scheme (TDS)',
    ],
    helperText: 'Required by law in England & Wales',
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
