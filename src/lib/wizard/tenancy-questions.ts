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
  warnings?: {
    value: string | string[];
    message: string;
    severity: 'warning' | 'error' | 'info';
  }[];
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
    id: 'property_details',
    section: 'Property Details',
    question: 'Property details',
    inputType: 'group',
    helperText: 'Additional property information',
    fields: [
      {
        id: 'property_type',
        label: 'Property type',
        inputType: 'select',
        options: ['House', 'Flat', 'Studio', 'Room in shared house'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'furnished_status',
        label: 'Furnished status',
        inputType: 'select',
        options: ['Furnished', 'Unfurnished', 'Part-furnished'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'number_of_bedrooms',
        label: 'Number of bedrooms',
        inputType: 'number',
        validation: { required: true, min: 0, max: 20 },
        width: 'half',
      },
    ],
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
    id: 'tenancy_term',
    section: 'Tenancy Term',
    question: 'Tenancy term details',
    inputType: 'group',
    helperText: 'When the tenancy starts and how long it lasts',
    fields: [
      {
        id: 'tenancy_start_date',
        label: 'Start date',
        inputType: 'date',
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'is_fixed_term',
        label: 'Tenancy type',
        inputType: 'select',
        options: ['Fixed term (set end date)', 'Periodic (rolling monthly)'],
        validation: { required: true },
        width: 'half',
      },
    ],
  },
  {
    id: 'fixed_term_details',
    section: 'Tenancy Term',
    question: 'Fixed term details',
    inputType: 'group',
    helperText: 'Required for fixed-term tenancies',
    dependsOn: { questionId: 'is_fixed_term', value: 'Fixed term (set end date)' },
    fields: [
      {
        id: 'term_length',
        label: 'Term length',
        inputType: 'select',
        options: ['6 months', '12 months', '18 months', '24 months', '36 months'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenancy_end_date',
        label: 'End date',
        inputType: 'date',
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 5: RENT
  // ============================================================================
  {
    id: 'rent_details',
    section: 'Rent',
    question: 'Rent payment details',
    inputType: 'group',
    helperText: 'Monthly rent amount and payment information',
    fields: [
      {
        id: 'rent_amount',
        label: 'Monthly rent',
        inputType: 'currency',
        placeholder: '1200',
        validation: { required: true, min: 1 },
        width: 'half',
      },
      {
        id: 'rent_due_day',
        label: 'Payment due date',
        inputType: 'select',
        options: Array.from({ length: 28 }, (_, i) => `${i + 1}${getOrdinalSuffix(i + 1)}`),
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'payment_method',
        label: 'Payment method',
        inputType: 'select',
        options: ['Standing Order', 'Bank Transfer', 'Direct Debit'],
        validation: { required: true },
        width: 'half',
      },
    ],
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
    id: 'deposit_details',
    section: 'Deposit',
    question: 'Deposit details',
    inputType: 'group',
    helperText: 'Security deposit amount and protection scheme (required by law)',
    fields: [
      {
        id: 'deposit_amount',
        label: 'Deposit amount',
        inputType: 'currency',
        placeholder: '1400',
        validation: { required: true, min: 0 },
        width: 'half',
      },
      {
        id: 'deposit_scheme',
        label: 'Deposit protection scheme',
        inputType: 'select',
        options: [], // Will be populated based on jurisdiction
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 7: BILLS & UTILITIES
  // ============================================================================
  {
    id: 'bills_utilities',
    section: 'Bills & Utilities',
    question: 'Bills & utilities responsibility',
    inputType: 'group',
    helperText: 'Who is responsible for paying each utility',
    fields: [
      {
        id: 'council_tax_responsibility',
        label: 'Council tax',
        inputType: 'select',
        options: ['Tenant', 'Landlord', 'Included in rent'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'utilities_responsibility',
        label: 'Utilities (gas, electric, water)',
        inputType: 'select',
        options: ['Tenant', 'Landlord', 'Included in rent'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'internet_responsibility',
        label: 'Internet/broadband',
        inputType: 'select',
        options: ['Tenant', 'Landlord', 'Included in rent'],
        validation: { required: true },
        width: 'third',
      },
    ],
  },

  // ============================================================================
  // SECTION 8: PROPERTY RULES
  // ============================================================================
  {
    id: 'property_rules',
    section: 'Property Rules',
    question: 'Property rules and restrictions',
    inputType: 'group',
    helperText: 'Rules regarding pets, smoking, and parking',
    fields: [
      {
        id: 'pets_allowed',
        label: 'Are pets allowed?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'smoking_allowed',
        label: 'Is smoking allowed inside?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'parking_available',
        label: 'Is parking included?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
    ],
  },
  {
    id: 'approved_pets',
    section: 'Property Rules',
    question: 'What pets are allowed?',
    inputType: 'multi_select',
    options: ['Cats', 'Dogs', 'Small caged animals (hamsters, etc.)', 'Fish'],
    dependsOn: { questionId: 'pets_allowed', value: 'Yes' },
  },
  {
    id: 'parking_details',
    section: 'Property Rules',
    question: 'Parking details',
    inputType: 'text',
    placeholder: 'Space number 12, or street parking permit',
    dependsOn: { questionId: 'parking_available', value: 'Yes' },
  },

  // ============================================================================
  // SECTION 9: LEGAL COMPLIANCE & SAFETY
  // ============================================================================
  {
    id: 'legal_compliance',
    section: 'Legal Compliance',
    question: 'Legal compliance & safety certificates',
    inputType: 'group',
    helperText: '⚠️ All required by UK law for residential tenancies',
    fields: [
      {
        id: 'gas_safety_certificate',
        label: 'Gas Safety Certificate (if applicable)',
        inputType: 'select',
        options: ['Yes', 'No', 'N/A - No gas appliances'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: 'No',
            message: '⚠️ CRITICAL: Gas Safety Certificate is required by law if you have gas appliances. The tenancy agreement could be invalid without it.',
            severity: 'error',
          },
        ],
      },
      {
        id: 'epc_rating',
        label: 'Energy Performance Certificate (EPC) rating',
        inputType: 'select',
        options: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'Not available'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: ['F', 'G', 'Not available'],
            message: '⚠️ WARNING: Properties must have a minimum EPC rating of E to be legally let. Your tenancy agreement may be invalid.',
            severity: 'error',
          },
        ],
      },
      {
        id: 'electrical_safety_certificate',
        label: 'Electrical Installation Condition Report (EICR)',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: 'No',
            message: '⚠️ WARNING: EICR is required every 5 years for private rentals (England). This is a legal requirement.',
            severity: 'warning',
          },
        ],
      },
      {
        id: 'smoke_alarms_fitted',
        label: 'Smoke alarms on every floor',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: 'No',
            message: '⚠️ CRITICAL: Smoke alarms on every floor are a legal requirement. You must install them before letting the property.',
            severity: 'error',
          },
        ],
      },
      {
        id: 'carbon_monoxide_alarms',
        label: 'Carbon monoxide alarms (if applicable)',
        inputType: 'select',
        options: ['Yes', 'No', 'N/A - No solid fuel appliances'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: 'No',
            message: '⚠️ WARNING: Carbon monoxide alarms are required in rooms with solid fuel appliances. This is a legal requirement.',
            severity: 'warning',
          },
        ],
      },
      {
        id: 'how_to_rent_guide_provided',
        label: 'Will provide "How to Rent" guide (England only)',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'half',
        warnings: [
          {
            value: 'No',
            message: '⚠️ WARNING: In England, you must provide the "How to Rent" guide before or at the start of the tenancy.',
            severity: 'warning',
          },
        ],
      },
    ],
  },

  // ============================================================================
  // SECTION 10: MAINTENANCE & REPAIRS
  // ============================================================================
  {
    id: 'maintenance_repairs',
    section: 'Maintenance & Repairs',
    question: 'Maintenance & repair responsibilities',
    inputType: 'group',
    helperText: 'Responsibilities and procedures for property maintenance',
    fields: [
      {
        id: 'landlord_maintenance_responsibilities',
        label: 'Structural repairs responsibility',
        inputType: 'select',
        options: ['Landlord (standard)', 'Shared responsibility', 'Other arrangement'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'garden_maintenance',
        label: 'Garden maintenance',
        inputType: 'select',
        options: ['No garden', 'Tenant maintains', 'Landlord maintains', 'Shared/professional gardener'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'repairs_reporting_method',
        label: 'How to report repairs',
        inputType: 'select',
        options: ['Email', 'Phone', 'Online portal', 'Via agent'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'emergency_contact',
        label: 'Emergency contact number (24/7)',
        inputType: 'tel',
        placeholder: '07700 900000',
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 11: PROPERTY CONDITION & INVENTORY
  // ============================================================================
  {
    id: 'property_condition',
    section: 'Property Condition',
    question: 'Property condition & inventory',
    inputType: 'group',
    helperText: 'Inventory requirements and property standards',
    fields: [
      {
        id: 'inventory_provided',
        label: 'Detailed inventory provided?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'professional_cleaning_required',
        label: 'Professional cleaning required at end?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'decoration_condition',
        label: 'Decoration/alterations policy',
        inputType: 'select',
        options: ['No alterations allowed', 'With written permission only', 'Minor alterations allowed (e.g., picture hooks)'],
        validation: { required: true },
        width: 'third',
      },
    ],
  },

  // ============================================================================
  // SECTION 12: TENANCY TERMS & CONDITIONS
  // ============================================================================
  {
    id: 'tenancy_terms',
    section: 'Tenancy Terms',
    question: 'Additional tenancy terms',
    inputType: 'group',
    helperText: 'Break clause, subletting, and rent increase policies',
    fields: [
      {
        id: 'break_clause',
        label: 'Include break clause?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'subletting_allowed',
        label: 'Subletting policy',
        inputType: 'select',
        options: ['Not allowed', 'With written permission only', 'Allowed'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'rent_increase_clause',
        label: 'Rent increase clause?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
    ],
  },
  {
    id: 'break_clause_details',
    section: 'Tenancy Terms',
    question: 'Break clause details',
    inputType: 'group',
    helperText: 'When and how the break clause can be exercised',
    dependsOn: { questionId: 'break_clause', value: 'Yes' },
    fields: [
      {
        id: 'break_clause_months',
        label: 'Can be exercised after',
        inputType: 'select',
        options: ['6 months', '9 months', '12 months'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'break_clause_notice_period',
        label: 'Notice period required',
        inputType: 'select',
        options: ['1 month', '2 months', '3 months'],
        validation: { required: true },
        width: 'half',
      },
    ],
  },
  {
    id: 'rent_increase_details',
    section: 'Tenancy Terms',
    question: 'Rent increase frequency',
    inputType: 'select',
    options: ['Annually', 'Every 2 years', 'At landlord discretion (with notice)'],
    helperText: 'How often rent can be reviewed/increased',
    validation: { required: true },
    dependsOn: { questionId: 'rent_increase_clause', value: 'Yes' },
  },

  // ============================================================================
  // SECTION 13: INSURANCE & LIABILITY
  // ============================================================================
  {
    id: 'insurance',
    section: 'Insurance',
    question: 'Insurance requirements',
    inputType: 'group',
    helperText: 'Landlord and tenant insurance policies',
    fields: [
      {
        id: 'landlord_insurance',
        label: 'Do you have landlord insurance?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'half',
      },
      {
        id: 'tenant_insurance_required',
        label: 'Tenant contents insurance',
        inputType: 'select',
        options: ['Not required', 'Recommended', 'Required'],
        validation: { required: true },
        width: 'half',
      },
    ],
  },

  // ============================================================================
  // SECTION 14: ACCESS & VIEWINGS
  // ============================================================================
  {
    id: 'access_viewings',
    section: 'Access & Viewings',
    question: 'Property access & viewings policy',
    inputType: 'group',
    helperText: 'Landlord access rights and inspection schedule',
    fields: [
      {
        id: 'landlord_access_notice',
        label: 'Notice required for access',
        inputType: 'select',
        options: ['24 hours', '48 hours', '1 week'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'inspection_frequency',
        label: 'Inspection frequency',
        inputType: 'select',
        options: ['Monthly', 'Quarterly', 'Every 6 months', 'Annually', 'As needed'],
        validation: { required: true },
        width: 'third',
      },
      {
        id: 'end_of_tenancy_viewings',
        label: 'Allow end-of-tenancy viewings?',
        inputType: 'select',
        options: ['Yes', 'No'],
        validation: { required: true },
        width: 'third',
      },
    ],
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
    default:
      return 0;
  }
}

// Get jurisdiction-specific questions
export function getJurisdictionQuestions(jurisdiction: string): WizardQuestion[] {
  return TENANCY_AGREEMENT_QUESTIONS.map(q => {
    // Update deposit scheme options in the grouped deposit_details field
    if (q.id === 'deposit_details' && q.fields) {
      return {
        ...q,
        fields: q.fields.map(f => {
          if (f.id === 'deposit_scheme') {
            return {
              ...f,
              options: getDepositSchemes(jurisdiction),
            };
          }
          return f;
        }),
      };
    }
    return q;
  });
}
