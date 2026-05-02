import {
  RESIDENTIAL_LETTING_PRODUCTS,
  type ResidentialLettingProductSku,
} from '@/lib/residential-letting/products';
import { getAgreementSuitabilityFacts } from '@/lib/tenancy/agreement-suitability';
import { getEnglandTenancyPurpose } from '@/lib/tenancy/england-reform';

export type StandaloneFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'currency'
  | 'radio'
  | 'multiselect'
  | 'repeater'
  | 'tenant_builder'
  | 'room_builder'
  | 'upload'
  | 'advisory';

export interface StandaloneFieldOption {
  value: string;
  label: string;
}

export interface StandaloneRepeaterColumnConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'date' | 'number' | 'currency' | 'select';
  options?: StandaloneFieldOption[];
  placeholder?: string;
  required?: boolean;
}

export interface StandaloneRoomRecord {
  id: string;
  name: string;
  condition?: string;
  cleanliness?: string;
  notes?: string;
  fixtures?: string;
  defects?: string;
  actions?: string;
  tenant_comments?: string;
  photo_reference?: string;
  items?: Array<{
    item: string;
    condition?: string;
    cleanliness?: string;
    notes?: string;
  }>;
}

export interface StandaloneTenantRecord {
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface StandaloneFieldConfig {
  id: string;
  label: string;
  type: StandaloneFieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: StandaloneFieldOption[];
  visibleWhen?: (facts: Record<string, any>) => boolean;
  tone?: 'info' | 'warning' | 'success';
  items?: string[];
  columns?: StandaloneRepeaterColumnConfig[];
  addLabel?: string;
  emptyRow?: Record<string, any>;
  roomTemplates?: string[];
  roomMode?: 'inspection' | 'inventory';
  evidenceCategory?: string;
  description?: string;
}

export interface StandaloneStepConfig {
  id: string;
  title: string;
  description: string;
  fields?: StandaloneFieldConfig[];
  visibleWhen?: (facts: Record<string, any>) => boolean;
}

export type StandaloneRequiredFacts =
  | string[]
  | ((facts: Record<string, any>) => string[]);

export interface ResidentialStandaloneFlowConfig {
  product: ResidentialLettingProductSku;
  documentTitle: string;
  reviewTitle: string;
  warnings: string[];
  upsellRecommendations: ResidentialLettingProductSku[];
  reviewSummaryFields: string[];
  requiredFacts: StandaloneRequiredFacts;
  completionRules: Array<(facts: Record<string, any>) => string | null>;
  steps: StandaloneStepConfig[];
}

export interface ArrearsScheduleRow {
  due_date: string;
  period_covered: string;
  amount_due: number;
  amount_paid: number;
  amount_outstanding: number;
  payment_received_date?: string;
  note?: string;
}

export interface StandaloneScheduleRow {
  [key: string]: string | number | boolean | undefined;
}

export function calculateArrearsScheduleTotal(rows: ArrearsScheduleRow[]): number {
  return rows.reduce((sum, row) => sum + Number(row.amount_outstanding || 0), 0);
}

export function validateArrearsScheduleRows(rows: ArrearsScheduleRow[]): string[] {
  const issues: string[] = [];
  rows.forEach((row, index) => {
    if (!row.due_date) issues.push(`Row ${index + 1}: due date is required`);
    if (!row.period_covered) issues.push(`Row ${index + 1}: period covered is required`);
    if (Number.isNaN(Number(row.amount_due))) issues.push(`Row ${index + 1}: amount due must be a number`);
    if (Number.isNaN(Number(row.amount_paid))) issues.push(`Row ${index + 1}: amount paid must be a number`);

    const computedOutstanding = Number(row.amount_due || 0) - Number(row.amount_paid || 0);
    if (Math.abs(computedOutstanding - Number(row.amount_outstanding || 0)) > 0.01) {
      issues.push(`Row ${index + 1}: outstanding amount must equal due minus paid`);
    }
  });

  return issues;
}

function toOrdinalDayLabel(day: number): string {
  if (day <= 0) return '';
  const mod100 = day % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${day}th`;
  const mod10 = day % 10;
  if (mod10 === 1) return `${day}st`;
  if (mod10 === 2) return `${day}nd`;
  if (mod10 === 3) return `${day}rd`;
  return `${day}th`;
}

const TENANT_COUNT_OPTIONS: StandaloneFieldOption[] = Array.from({ length: 6 }, (_, index) => ({
  value: String(index + 1),
  label: String(index + 1),
}));

const ENGLAND_RENT_WEEKDAY_OPTIONS: StandaloneFieldOption[] = [
  { value: 'Monday', label: 'Monday' },
  { value: 'Tuesday', label: 'Tuesday' },
  { value: 'Wednesday', label: 'Wednesday' },
  { value: 'Thursday', label: 'Thursday' },
  { value: 'Friday', label: 'Friday' },
  { value: 'Saturday', label: 'Saturday' },
  { value: 'Sunday', label: 'Sunday' },
];

const ENGLAND_RENT_DAY_OF_MONTH_OPTIONS: StandaloneFieldOption[] = Array.from(
  { length: 30 },
  (_, index) => ({
    value: toOrdinalDayLabel(index + 1),
    label: toOrdinalDayLabel(index + 1),
  })
);

const ENGLAND_PAYMENT_METHOD_OPTIONS: StandaloneFieldOption[] = [
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cash', label: 'Cash' },
];

const INCLUDED_BILL_OPTIONS: StandaloneFieldOption[] = [
  { value: 'council_tax', label: 'Council tax' },
  { value: 'gas', label: 'Gas' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'water_sewerage', label: 'Water / sewerage' },
  { value: 'internet_broadband', label: 'Internet / broadband' },
  { value: 'communications', label: 'Communications: telephone, internet, cable, satellite' },
  { value: 'tv_licence', label: 'TV licence' },
  { value: 'green_deal', label: 'Green Deal energy efficiency payments' },
];

function commonPropertyStep(description = 'Identify the property covered by this legal document.'): StandaloneStepConfig {
  return {
    id: 'property_details',
    title: 'Property details',
    description,
    fields: [
      { id: 'property_address_line1', label: 'Address line 1', type: 'text', required: true },
      { id: 'property_address_line2', label: 'Address line 2', type: 'text' },
      { id: 'property_address_town', label: 'Town / city', type: 'text', required: true },
      { id: 'property_address_postcode', label: 'Postcode', type: 'text', required: true },
      {
        id: 'property_type',
        label: 'Property type',
        type: 'select',
        required: true,
        options: [
          { value: 'flat', label: 'Flat' },
          { value: 'house', label: 'House' },
          { value: 'room', label: 'Room only' },
          { value: 'other', label: 'Other' },
        ],
      },
    ],
  };
}

function commonEvidenceAdvisory(items: string[]): StandaloneFieldConfig {
  return {
    id: `advisory_${items[0]?.slice(0, 12) || 'premium'}`,
    label: 'Premium drafting notes',
    type: 'advisory',
    tone: 'info',
    items,
  };
}

function commonPropertyProfileStep(): StandaloneStepConfig {
  return {
    id: 'property_profile',
    title: 'Property profile',
    description: 'Capture the practical setup of the property and what is being let.',
    fields: [
      {
        id: 'number_of_bedrooms',
        label: 'Number of bedrooms',
        type: 'number',
        required: true,
      },
      {
        id: 'furnished_status',
        label: 'Furnished status',
        type: 'select',
        required: true,
        options: [
          { value: 'furnished', label: 'Furnished' },
          { value: 'part_furnished', label: 'Part furnished' },
          { value: 'unfurnished', label: 'Unfurnished' },
        ],
      },
      {
        id: 'parking_available',
        label: 'Parking included',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  };
}

function commonLandlordStep(title = 'Landlord details'): StandaloneStepConfig {
  return {
    id: 'landlord',
    title,
    description: 'Capture the landlord identity and contact details for the agreement and notices.',
    fields: [
      { id: 'landlord_full_name', label: 'Landlord full name', type: 'text', required: true },
      { id: 'landlord_email', label: 'Landlord email', type: 'text', required: true },
      { id: 'landlord_phone', label: 'Landlord phone', type: 'text', required: true },
      { id: 'landlord_address_line1', label: 'Landlord service address line 1', type: 'text', required: true },
      { id: 'landlord_address_town', label: 'Landlord town / city', type: 'text', required: true },
      { id: 'landlord_address_postcode', label: 'Landlord postcode', type: 'text', required: true },
      {
        id: 'additional_landlords',
        label: 'Additional joint landlords',
        type: 'repeater',
        addLabel: 'Add joint landlord',
        helpText:
          'Optional: add any other landlord who should be named in the agreement alongside the main landlord.',
        columns: [
          {
            id: 'full_name',
            label: 'Full name',
            type: 'text',
            required: true,
          },
          {
            id: 'service_address',
            label: 'Service address',
            type: 'text',
            placeholder: 'Optional: use if different from the main landlord service address',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'text',
          },
          {
            id: 'phone',
            label: 'Phone',
            type: 'text',
          },
        ],
        emptyRow: { full_name: '', service_address: '', email: '', phone: '' },
      },
    ],
  };
}

function commonTenantStep(title = 'Tenant details', description = 'Identify the occupier or tenant group who will sign the agreement.'): StandaloneStepConfig {
  return {
    id: 'tenant',
    title,
    description,
    fields: [
      {
        id: 'number_of_tenants',
        label: 'How many named tenants will be on the agreement?',
        type: 'select',
        required: true,
        options: TENANT_COUNT_OPTIONS,
        helpText: 'We will open a separate section for each tenant so they can all be named properly in the agreement.',
      },
      {
        id: 'tenants',
        label: 'Named tenant details',
        type: 'tenant_builder',
        required: true,
        helpText: 'Enter the full name, email address, and phone number for each named tenant.',
      },
    ],
  };
}

function commonTenancyCommercialsStep(title = 'Tenancy terms'): StandaloneStepConfig {
  return {
    id: 'tenancy_terms',
    title,
    description: 'Set the start date, payment cycle, and key commercial terms for the agreement.',
    fields: [
      { id: 'tenancy_start_date', label: 'Start date', type: 'date', required: true },
      { id: 'rent_amount', label: 'Rent amount', type: 'currency', required: true },
      {
        id: 'rent_frequency',
        label: 'Rent frequency',
        type: 'select',
        required: true,
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'yearly', label: 'Yearly' },
        ],
      },
      { id: 'rent_due_day', label: 'Rent due day', type: 'text', required: true },
      {
        id: 'payment_method',
        label: 'Payment method',
        type: 'select',
        required: true,
        options: [
          { value: 'bank_transfer', label: 'Bank transfer' },
          { value: 'standing_order', label: 'Standing order' },
          { value: 'cash', label: 'Cash' },
        ],
      },
      { id: 'deposit_amount', label: 'Deposit amount', type: 'currency', required: true },
      {
        id: 'bills_included_in_rent',
        label: 'Bills included in rent',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'included_bills_notes',
        label: 'Included bills details',
        type: 'textarea',
        visibleWhen: (facts) => facts.bills_included_in_rent === 'yes',
      },
    ],
  };
}

function commonRulesAndAccessStep(): StandaloneStepConfig {
  return {
    id: 'rules_and_access',
    title: 'Rules and access',
    description: 'Capture the practical occupation rules and access expectations for the finished agreement.',
    fields: [
      {
        id: 'landlord_access_notice',
        label: 'Non-emergency access notice',
        type: 'select',
        required: true,
        options: [
          { value: '24 hours', label: '24 hours' },
          { value: '48 hours', label: '48 hours' },
          { value: '72 hours', label: '72 hours' },
        ],
      },
      {
        id: 'inspection_frequency',
        label: 'Inspection frequency',
        type: 'select',
        required: true,
        options: [
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'every_6_months', label: 'Every 6 months' },
          { value: 'annually', label: 'Annually' },
          { value: 'as_needed', label: 'As needed' },
        ],
      },
      {
        id: 'pets_allowed',
        label: 'Pets authorised at the start',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'smoking_allowed',
        label: 'Smoking inside',
        type: 'select',
        required: true,
        options: [
          { value: 'no', label: 'No' },
          { value: 'yes', label: 'Yes' },
          { value: 'vaping_only', label: 'Vaping only' },
        ],
      },
      {
        id: 'subletting_allowed',
        label: 'Subletting / Airbnb policy',
        type: 'select',
        required: true,
        options: [
          { value: 'not_allowed', label: 'Not allowed' },
          { value: 'written_consent', label: 'Only with written consent' },
          { value: 'allowed', label: 'Allowed' },
        ],
      },
      { id: 'additional_terms', label: 'Additional bespoke terms', type: 'textarea' },
    ],
  };
}

const ENGLAND_ASSURED_PRODUCTS = new Set<ResidentialLettingProductSku>([
  'england_standard_tenancy_agreement',
  'england_premium_tenancy_agreement',
  'england_student_tenancy_agreement',
  'england_hmo_shared_house_tenancy_agreement',
]);

const ENGLAND_ASSURED_TRANSITION_REQUIRED_FACTS: string[] = [
  'england_tenancy_purpose',
  'property_address_line1',
  'property_address_town',
  'property_address_postcode',
  'landlord_full_name',
  'landlord_address_line1',
  'landlord_address_town',
  'landlord_address_postcode',
  'landlord_email',
  'landlord_phone',
  'number_of_tenants',
  'tenants',
  'tenancy_start_date',
  'existing_written_tenancy_transition',
] as const;

const ENGLAND_ASSURED_BASE_REQUIRED_FACTS: string[] = [
  'england_tenancy_purpose',
  'property_address_line1',
  'property_address_town',
  'property_address_postcode',
  'landlord_full_name',
  'landlord_address_line1',
  'landlord_address_town',
  'landlord_address_postcode',
  'number_of_tenants',
  'tenants',
  'tenancy_start_date',
  'rent_amount',
  'rent_frequency',
  'payment_method',
  'deposit_amount',
  'tenant_notice_period',
  'rent_increase_method',
  'bills_included_in_rent',
  'england_rent_in_advance_compliant',
  'england_no_bidding_confirmed',
  'england_no_discrimination_confirmed',
  'tenant_improvements_allowed_with_consent',
  'supported_accommodation_tenancy',
  'relevant_gas_fitting_present',
  'epc_rating',
  'right_to_rent_check_date',
  'electrical_safety_certificate',
  'smoke_alarms_fitted',
  'carbon_monoxide_alarms',
  'how_to_rent_provided',
  'landlord_access_notice',
  'inspection_frequency',
  'pets_allowed',
  'smoking_allowed',
  'subletting_allowed',
] as const;

const PRIOR_NOTICE_GROUND_OPTIONS: StandaloneFieldOption[] = [
  { value: 'ground_2za_superior_lease_sale', label: 'Ground 2ZA: superior lease sale provision' },
  { value: 'ground_2zb_superior_lease_break', label: 'Ground 2ZB: superior lease break provision' },
  { value: 'ground_2zc_superior_lease_redevelopment', label: 'Ground 2ZC: superior lease redevelopment provision' },
  { value: 'ground_2zd_superior_lease_landlord_occupation', label: 'Ground 2ZD: superior lease occupation provision' },
  { value: 'ground_4_student_occupation', label: 'Ground 4: student occupation' },
  { value: 'ground_4a_students_for_new_students', label: 'Ground 4A: student property for incoming students' },
  { value: 'ground_5_minister_of_religion', label: 'Ground 5: minister of religion' },
  { value: 'ground_5a_agricultural_worker', label: 'Ground 5A: agricultural worker' },
  { value: 'ground_5b_employment_requirement', label: 'Ground 5B: employment requirement' },
  { value: 'ground_5c_end_of_landlord_employment', label: 'Ground 5C: end of landlord employment' },
  { value: 'ground_5d_end_of_employment_requirement', label: 'Ground 5D: end of employment requirement' },
  { value: 'ground_5e_supported_accommodation', label: 'Ground 5E: occupation as supported accommodation' },
  { value: 'ground_5f_supported_dwelling_house', label: 'Ground 5F: dwelling occupied as supported accommodation' },
  { value: 'ground_5g_homelessness_duty', label: 'Ground 5G: homelessness duty accommodation' },
  { value: 'ground_5h_stepping_stone', label: 'Ground 5H: stepping-stone accommodation' },
  { value: 'ground_18_supported_accommodation', label: 'Ground 18: supported accommodation' },
];

const SEPARATE_BILL_TYPE_OPTIONS: StandaloneFieldOption[] = [
  { value: 'council_tax', label: 'Council tax' },
  { value: 'gas_electric_water', label: 'Utilities: gas, electricity, water, or sewage' },
  { value: 'tv_licence', label: 'TV licence' },
  { value: 'communications', label: 'Communications: telephone, internet, cable, satellite' },
  { value: 'green_deal', label: 'Green Deal energy efficiency payments' },
];

function isEnglandAssuredProduct(product: ResidentialLettingProductSku): boolean {
  return ENGLAND_ASSURED_PRODUCTS.has(product);
}

function isTruthySelection(value: unknown): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'yes' || normalized === 'true' || normalized === '1';
  }

  return false;
}

function toFactText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function hasDepositAmount(facts: Record<string, any>): boolean {
  const numeric = Number(facts.deposit_amount);
  return Number.isFinite(numeric) && numeric > 0;
}

function hasPriorNoticeGround(facts: Record<string, any>, ground: string): boolean {
  return Array.isArray(facts.prior_notice_grounds) && facts.prior_notice_grounds.includes(ground);
}

function hasSupportedAccommodationGround(facts: Record<string, any>): boolean {
  return Array.isArray(facts.prior_notice_grounds)
    ? facts.prior_notice_grounds.some((ground: string) =>
        [
          'ground_5e_supported_accommodation',
          'ground_5f_supported_dwelling_house',
          'ground_5g_homelessness_duty',
          'ground_5h_stepping_stone',
          'ground_18_supported_accommodation',
        ].includes(ground)
      )
    : false;
}

function requiresEnglandRentDueWeekday(facts: Record<string, any>): boolean {
  return toFactText(facts.rent_frequency) === 'weekly';
}

function requiresEnglandRentDueDayOfMonth(facts: Record<string, any>): boolean {
  return ['monthly', 'quarterly', 'yearly'].includes(toFactText(facts.rent_frequency));
}

function shouldRecordPriorNoticeGrounds(facts: Record<string, any>): boolean {
  return isTruthySelection(facts.record_prior_notice_grounds);
}

function isExistingWrittenEnglandTenancy(facts: Record<string, any>): boolean {
  return getEnglandTenancyPurpose(facts.england_tenancy_purpose) === 'existing_written_tenancy';
}

function shouldShowEnglandAssuredAgreementSteps(facts: Record<string, any>): boolean {
  return !isExistingWrittenEnglandTenancy(facts);
}

function validateStructuredTenantFacts(facts: Record<string, any>): string | null {
  const requestedCount = Number(facts.number_of_tenants);
  const expectedCount =
    Number.isFinite(requestedCount) && requestedCount > 0 ? Math.floor(requestedCount) : 0;

  if (expectedCount === 0) return null;

  const tenants = Array.isArray(facts.tenants) ? facts.tenants : [];

  if (tenants.length < expectedCount) {
    return 'Add a separate tenant section for each named tenant on the agreement.';
  }

  for (let index = 0; index < expectedCount; index += 1) {
    const tenant = tenants[index] || {};
    if (!toFactText(tenant.full_name)) {
      return `Add the full name for tenant ${index + 1}.`;
    }

    if (!toFactText(tenant.email)) {
      return `Add the email address for tenant ${index + 1}.`;
    }

    if (!toFactText(tenant.phone)) {
      return `Add the phone number for tenant ${index + 1}.`;
    }
  }

  return null;
}

function getConfigRequiredFacts(config: ResidentialStandaloneFlowConfig, facts: Record<string, any>) {
  return typeof config.requiredFacts === 'function' ? config.requiredFacts(facts) : config.requiredFacts;
}

function createEnglandAssuredRequiredFacts(productSpecificFacts: string[] = []): StandaloneRequiredFacts {
  return (facts) => {
    const purpose = getEnglandTenancyPurpose(facts.england_tenancy_purpose);

    if (purpose === 'existing_written_tenancy') {
      return [...ENGLAND_ASSURED_TRANSITION_REQUIRED_FACTS];
    }

    const required = [...ENGLAND_ASSURED_BASE_REQUIRED_FACTS];

    if (purpose === 'existing_verbal_tenancy') {
      required.push('existing_verbal_tenancy_summary');
    }

    if (requiresEnglandRentDueWeekday(facts)) {
      required.push('rent_due_weekday');
    } else if (requiresEnglandRentDueDayOfMonth(facts)) {
      required.push('rent_due_day_of_month');
    }

    if (facts.bills_included_in_rent === 'yes') {
      required.push('included_bills');
    }

    if (toFactText(facts.payment_method) === 'bank_transfer') {
      required.push('payment_account_name', 'payment_sort_code', 'payment_account_number');
    }

    if (isTruthySelection(facts.separate_bill_payments_taken)) {
      required.push('separate_bill_payment_rows');
    }

    if (hasDepositAmount(facts)) {
      required.push('deposit_scheme_name');
    }

    if (isTruthySelection(facts.relevant_gas_fitting_present)) {
      required.push('gas_safety_certificate');
    }

    return [...required, ...productSpecificFacts];
  };
}

function commonEnglandTenancyPurposeStep(productLabel: string): StandaloneStepConfig {
  return {
    id: 'england_tenancy_purpose',
    title: 'Tenancy purpose',
    description: `Tell us whether this England ${productLabel.toLowerCase()} is for a new tenancy or for an existing verbal tenancy that now needs written terms.`,
    fields: [
      {
        id: 'england_tenancy_purpose',
        label: 'What are you doing today?',
        type: 'select',
        required: true,
        options: [
          { value: 'new_agreement', label: 'Create a new tenancy agreement' },
          { value: 'existing_verbal_tenancy', label: 'Prepare written terms for an existing verbal tenancy' },
        ],
        helpText:
          'From 1 May 2026, new England tenancies generally use the assured periodic route, and existing verbal tenancies need written terms recorded by 31 May 2026.',
      },
      {
        id: 'existing_written_tenancy_transition_note',
        label: 'Existing written tenancy route',
        type: 'advisory',
        tone: 'warning',
        visibleWhen: (facts) => isExistingWrittenEnglandTenancy(facts),
        items: [
          'This route prepares transition guidance and includes the exact Renters? Rights Act Information Sheet 2026 PDF instead of generating a fresh tenancy agreement.',
          'You still need to give the information sheet to every named tenant for an existing written England assured tenancy transition case by 31 May 2026.',
        ],
      },
      {
        id: 'existing_written_tenancy_transition',
        label: 'I understand this route is for transition guidance and the official information sheet, not a brand new tenancy agreement.',
        type: 'checkbox',
        required: true,
        visibleWhen: (facts) => isExistingWrittenEnglandTenancy(facts),
      },
      {
        id: 'existing_verbal_tenancy_summary_note',
        label: 'Existing verbal tenancy route',
        type: 'advisory',
        tone: 'info',
        visibleWhen: (facts) => getEnglandTenancyPurpose(facts.england_tenancy_purpose) === 'existing_verbal_tenancy',
        items: [
          'This route generates an England Written Statement of Terms for an existing verbal tenancy rather than pretending a brand new tenancy is being granted.',
          'You should still check the existing facts carefully and keep evidence of when the written terms were given.',
        ],
      },
      {
        id: 'existing_verbal_tenancy_summary',
        label: 'I understand this route records written terms for an existing verbal tenancy.',
        type: 'checkbox',
        required: true,
        visibleWhen: (facts) => getEnglandTenancyPurpose(facts.england_tenancy_purpose) === 'existing_verbal_tenancy',
      },
    ],
  };
}

function commonEnglandTransitionReferenceStep(): StandaloneStepConfig {
  return {
    id: 'england_transition_reference',
    title: 'Transition reference',
    description: 'Record the basic tenancy details that should appear on the transition guidance and information pack.',
    visibleWhen: (facts) => isExistingWrittenEnglandTenancy(facts),
    fields: [
      { id: 'property_address_line1', label: 'Property address line 1', type: 'text', required: true },
      { id: 'property_address_town', label: 'Town / city', type: 'text', required: true },
      { id: 'property_address_postcode', label: 'Postcode', type: 'text', required: true },
      { id: 'landlord_full_name', label: 'Landlord full name', type: 'text', required: true },
      { id: 'landlord_email', label: 'Landlord email', type: 'text', required: true },
      { id: 'landlord_phone', label: 'Landlord phone', type: 'text', required: true },
      { id: 'landlord_address_line1', label: 'Landlord service address line 1', type: 'text', required: true },
      { id: 'landlord_address_town', label: 'Landlord town / city', type: 'text', required: true },
      { id: 'landlord_address_postcode', label: 'Landlord postcode', type: 'text', required: true },
      {
        id: 'additional_landlords',
        label: 'Additional joint landlords',
        type: 'repeater',
        addLabel: 'Add joint landlord',
        helpText:
          'Optional: add any additional landlord who should be named on the transition reference and served information.',
        columns: [
          {
            id: 'full_name',
            label: 'Full name',
            type: 'text',
            required: true,
          },
          {
            id: 'service_address',
            label: 'Service address',
            type: 'text',
            placeholder: 'Optional: use if different from the main landlord service address',
          },
          {
            id: 'email',
            label: 'Email',
            type: 'text',
          },
          {
            id: 'phone',
            label: 'Phone',
            type: 'text',
          },
        ],
        emptyRow: { full_name: '', service_address: '', email: '', phone: '' },
      },
      {
        id: 'number_of_tenants',
        label: 'How many named tenants are on the current tenancy?',
        type: 'select',
        required: true,
        options: TENANT_COUNT_OPTIONS,
        helpText: 'We will open a separate section for each named tenant so the transition pack names everybody clearly.',
      },
      {
        id: 'tenants',
        label: 'Named tenant details',
        type: 'tenant_builder',
        required: true,
        helpText: 'Enter the details for each tenant who should receive the transition information sheet.',
      },
      {
        id: 'tenancy_start_date',
        label: 'Original tenancy start date',
        type: 'date',
        required: true,
        helpText: 'Use the date the current tenancy originally began.',
      },
      {
        id: 'england_transition_delivery_notes',
        label: 'Delivery or handover notes',
        type: 'textarea',
        helpText: 'Optional note for who will receive the information sheet and how you plan to serve it.',
      },
    ],
  };
}

function commonEnglandAssuredTenancyTermsStep(title = 'Tenancy terms'): StandaloneStepConfig {
  return {
    id: 'tenancy_terms',
    title,
    description: 'Set the commercial terms and the written-information items that must appear in the England tenancy wording.',
    visibleWhen: shouldShowEnglandAssuredAgreementSteps,
    fields: [
      { id: 'tenancy_start_date', label: 'Start date', type: 'date', required: true },
      { id: 'rent_amount', label: 'Rent amount', type: 'currency', required: true },
      {
        id: 'rent_frequency',
        label: 'Rent frequency',
        type: 'select',
        required: true,
        options: [
          { value: 'monthly', label: 'Monthly' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'quarterly', label: 'Quarterly' },
          { value: 'yearly', label: 'Yearly' },
        ],
      },
      {
        id: 'rent_due_weekday',
        label: 'Rent due day',
        type: 'select',
        required: true,
        options: ENGLAND_RENT_WEEKDAY_OPTIONS,
        visibleWhen: (facts) => facts.rent_frequency === 'weekly',
      },
      {
        id: 'rent_due_day_of_month',
        label: 'Rent due day',
        type: 'select',
        required: true,
        options: ENGLAND_RENT_DAY_OF_MONTH_OPTIONS,
        visibleWhen: (facts) =>
          ['monthly', 'quarterly', 'yearly'].includes(toFactText(facts.rent_frequency)),
      },
      {
        id: 'payment_method',
        label: 'Payment method',
        type: 'select',
        required: true,
        options: ENGLAND_PAYMENT_METHOD_OPTIONS,
      },
      {
        id: 'payment_account_name',
        label: 'Account name',
        type: 'text',
        required: true,
        visibleWhen: (facts) => toFactText(facts.payment_method) === 'bank_transfer',
      },
      {
        id: 'payment_sort_code',
        label: 'Sort code',
        type: 'text',
        required: true,
        placeholder: '12-34-56',
        visibleWhen: (facts) => toFactText(facts.payment_method) === 'bank_transfer',
      },
      {
        id: 'payment_account_number',
        label: 'Account number',
        type: 'text',
        required: true,
        placeholder: '12345678',
        visibleWhen: (facts) => toFactText(facts.payment_method) === 'bank_transfer',
      },
      {
        id: 'deposit_amount',
        label: 'Deposit amount',
        type: 'currency',
        required: true,
        helpText: 'Enter 0 if no deposit will be taken.',
      },
      {
        id: 'tenant_notice_period',
        label: 'Tenant notice period',
        type: 'select',
        required: true,
        options: [
          { value: '2 months', label: '2 months' },
          { value: '1 month', label: '1 month' },
          { value: '6 weeks', label: '6 weeks' },
          { value: '28 days', label: '28 days' },
        ],
        helpText: 'For an England assured tenancy, the tenant notice period cannot be more than 2 months.',
      },
      {
        id: 'rent_increase_method',
        label: 'Rent increase method',
        type: 'select',
        required: true,
        options: [{ value: 'section_13_notice', label: 'Section 13 notice process' }],
        helpText: 'England assured tenancy wording should refer to the statutory section 13 process.',
      },
      {
        id: 'bills_included_in_rent',
        label: 'Bills included in the rent',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'included_bills',
        label: 'Which bills are included?',
        type: 'multiselect',
        required: true,
        options: INCLUDED_BILL_OPTIONS,
        visibleWhen: (facts) => facts.bills_included_in_rent === 'yes',
        helpText: 'Tick each bill or service included in the rent.',
      },
      {
        id: 'included_bills_other_notes',
        label: 'Other included bills or services',
        type: 'textarea',
        visibleWhen: (facts) => facts.bills_included_in_rent === 'yes',
        helpText: 'Optional: add anything unusual that is included but does not fit the list above.',
      },
    ],
  };
}

function commonEnglandAssuredComplianceStep(): StandaloneStepConfig {
  return {
    id: 'england_written_information',
    title: 'England written information',
    description: 'Capture the statutory wording inputs that now need to be covered in the assured-tenancy paperwork.',
    visibleWhen: shouldShowEnglandAssuredAgreementSteps,
    fields: [
      {
        id: 'england_assured_written_information_note',
        label: 'Written information overview',
        type: 'advisory',
        tone: 'info',
        items: [
          'These answers drive the written information about tenant notice, rent increases, bills, possession, repairs, safety, disability adaptations, and pets.',
          'Most tenancies can leave the specialist prior-notice possession grounds section turned off unless you actually need it for a student or supported-accommodation setup.',
        ],
      },
      {
        id: 'england_rent_in_advance_compliant',
        label: 'I confirm the tenancy does not require prohibited rent-in-advance terms.',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'england_no_bidding_confirmed',
        label: 'I confirm the property is not being let through prohibited bidding practices.',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'england_no_discrimination_confirmed',
        label: 'I confirm the letting is not using prohibited discriminatory restrictions.',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'separate_bill_payments_taken',
        label: 'Will the tenant pay any permitted bills separately to the landlord or someone connected to the landlord?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'separate_bill_payment_rows',
        label: 'Separate bill payment details',
        type: 'repeater',
        addLabel: 'Add bill payment detail',
        visibleWhen: (facts) => isTruthySelection(facts.separate_bill_payments_taken),
        columns: [
          {
            id: 'bill_type',
            label: 'Bill type',
            type: 'select',
            required: true,
            options: SEPARATE_BILL_TYPE_OPTIONS,
          },
          {
            id: 'amount_detail',
            label: 'Amount or pricing explanation',
            type: 'text',
            required: true,
            placeholder: 'For example: £150 pcm or actual cost on invoice',
          },
          {
            id: 'due_detail',
            label: 'When it is due',
            type: 'text',
            required: true,
            placeholder: 'For example: monthly with rent or on invoice within 7 days',
          },
        ],
        emptyRow: { bill_type: '', amount_detail: '', due_detail: '' },
      },
      {
        id: 'record_prior_notice_grounds',
        label: 'Add specialist prior-notice possession grounds',
        type: 'checkbox',
        helpText: 'Leave this off unless you want the agreement to record specific future possession grounds from the start.',
      },
      {
        id: 'prior_notice_grounds',
        label: 'Prior-notice possession grounds to record at the start',
        type: 'multiselect',
        options: PRIOR_NOTICE_GROUND_OPTIONS,
        visibleWhen: (facts) => isTruthySelection(facts.record_prior_notice_grounds),
        helpText: 'Select only the grounds you actually want the tenancy wording to flag as possible future possession grounds.',
      },
      {
        id: 'prior_notice_ground_4_details',
        label: 'Ground 4 student occupation details',
        type: 'textarea',
        visibleWhen: (facts) =>
          isTruthySelection(facts.record_prior_notice_grounds) &&
          hasPriorNoticeGround(facts, 'ground_4_student_occupation'),
        helpText: 'Explain why this tenancy is being granted for student occupation and what supporting context should be recorded.',
      },
      {
        id: 'prior_notice_ground_4a_details',
        label: 'Ground 4A incoming students details',
        type: 'textarea',
        visibleWhen: (facts) =>
          isTruthySelection(facts.record_prior_notice_grounds) &&
          hasPriorNoticeGround(facts, 'ground_4a_students_for_new_students'),
        helpText: 'Explain the incoming-student arrangement or student turnover context that should be recorded.',
      },
      {
        id: 'prior_notice_supported_accommodation_details',
        label: 'Supported accommodation prior-notice details',
        type: 'textarea',
        visibleWhen: (facts) =>
          isTruthySelection(facts.record_prior_notice_grounds) &&
          hasSupportedAccommodationGround(facts),
        helpText: 'Explain the support, accommodation type, or homelessness duty context that should appear in the wording.',
      },
      {
        id: 'tenant_improvements_allowed_with_consent',
        label: 'Can the tenant make improvements to the property with the landlord consent?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
        helpText: 'This drives whether the Equality Act section 190 disability-adaptations wording should be included.',
      },
      {
        id: 'supported_accommodation_tenancy',
        label: 'Is this tenancy being granted as supported accommodation?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'supported_accommodation_explanation',
        label: 'Why it is supported accommodation',
        type: 'textarea',
        visibleWhen: (facts) => isTruthySelection(facts.supported_accommodation_tenancy),
        helpText: 'Explain why the tenancy meets the supported-accommodation definition and what support or supervision is being provided.',
      },
      {
        id: 'relevant_gas_fitting_present',
        label: 'Is there a relevant gas fitting or flue installed in or serving the property?',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  };
}

function commonEnglandPreTenancyComplianceStep(): StandaloneStepConfig {
  return {
    id: 'england_pre_tenancy_compliance',
    title: 'Pre-tenancy compliance',
    description: 'Record the operational compliance facts the England product pack should summarise and warn about.',
    visibleWhen: shouldShowEnglandAssuredAgreementSteps,
    fields: [
      {
        id: 'epc_rating',
        label: 'EPC rating',
        type: 'select',
        required: true,
        options: [
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
          { value: 'D', label: 'D' },
          { value: 'E', label: 'E' },
          { value: 'F', label: 'F' },
          { value: 'G', label: 'G' },
        ],
      },
      {
        id: 'right_to_rent_check_date',
        label: 'Right to Rent check date',
        type: 'date',
        required: true,
      },
      {
        id: 'how_to_rent_provided',
        label: 'Current How to Rent guide provided',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'gas_safety_certificate',
        label: 'Current gas safety certificate provided',
        type: 'radio',
        required: true,
        visibleWhen: (facts) => isTruthySelection(facts.relevant_gas_fitting_present),
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'electrical_safety_certificate',
        label: 'Electrical safety report (EICR) provided',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'smoke_alarms_fitted',
        label: 'Smoke alarms fitted and tested',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'carbon_monoxide_alarms',
        label: 'Carbon monoxide alarms fitted where required',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'deposit_scheme_name',
        label: 'Deposit protection scheme',
        type: 'select',
        required: true,
        visibleWhen: (facts) => hasDepositAmount(facts),
        options: [
          { value: 'DPS', label: 'DPS' },
          { value: 'MyDeposits', label: 'MyDeposits' },
          { value: 'TDS', label: 'TDS' },
          { value: 'Other', label: 'Other / not yet finalised' },
        ],
        helpText: 'Choose Other if the final scheme is not confirmed yet and you need a placeholder in the support documents.',
      },
      {
        id: 'deposit_reference_number',
        label: 'Deposit reference number',
        type: 'text',
        visibleWhen: (facts) => hasDepositAmount(facts),
        helpText: 'Optional. Leave blank if the final reference has not yet been issued.',
      },
    ],
  };
}

function commonEnglandRulesAndAccessStep(): StandaloneStepConfig {
  return {
    ...commonRulesAndAccessStep(),
    visibleWhen: shouldShowEnglandAssuredAgreementSteps,
    fields: [
      ...(commonRulesAndAccessStep().fields || []),
      {
        id: 'end_of_tenancy_viewings',
        label: 'Allow viewings once the tenancy is ending',
        type: 'radio',
        required: true,
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  };
}

function createEnglandAssuredCompletionRules(product: ResidentialLettingProductSku): Array<(facts: Record<string, any>) => string | null> {
  return [
    COMMON_RULES.englandOnly,
    (facts) => validateStructuredTenantFacts(facts),
    (facts) => {
      if (isExistingWrittenEnglandTenancy(facts)) return null;
      const suitability = getAgreementSuitabilityFacts(facts, { product });
      return suitability.tenantIsIndividual === true
        ? null
        : 'Confirm the occupier is an individual rather than a company for this agreement route.';
    },
    (facts) => {
      if (isExistingWrittenEnglandTenancy(facts)) return null;
      const suitability = getAgreementSuitabilityFacts(facts, { product });
      return suitability.mainHome === true
        ? null
        : 'Confirm the property will be the occupier main home for this agreement route.';
    },
    (facts) => {
      if (isExistingWrittenEnglandTenancy(facts)) return null;
      const suitability = getAgreementSuitabilityFacts(facts, { product });
      if (suitability.landlordLivesAtProperty === true) {
        return 'Choose the Lodger Agreement route instead if the landlord lives in the property.';
      }
      return suitability.landlordLivesAtProperty === false
        ? null
        : 'Confirm the landlord does not live in the property for this agreement route.';
    },
    (facts) => {
      if (isExistingWrittenEnglandTenancy(facts)) return null;
      const suitability = getAgreementSuitabilityFacts(facts, { product });
      if (suitability.holidayOrLicence === true) {
        return 'Holiday lets and licence-only arrangements need a different route.';
      }
      return suitability.holidayOrLicence === false
        ? null
        : 'Confirm this is not a holiday let or licence-only arrangement.';
    },
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : facts.bills_included_in_rent === 'yes' &&
            (!Array.isArray(facts.included_bills) || facts.included_bills.length === 0)
          ? 'Select at least one bill or service included in the rent.'
          : null,
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : isTruthySelection(facts.separate_bill_payments_taken) &&
            (!Array.isArray(facts.separate_bill_payment_rows) || facts.separate_bill_payment_rows.length === 0)
          ? 'Add at least one separate bill payment row where the tenant will pay permitted bills separately.'
          : null,
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : shouldRecordPriorNoticeGrounds(facts) &&
            hasPriorNoticeGround(facts, 'ground_4_student_occupation') &&
            !facts.prior_notice_ground_4_details
          ? 'Add student occupation detail for prior notice ground 4.'
          : null,
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : shouldRecordPriorNoticeGrounds(facts) &&
            hasPriorNoticeGround(facts, 'ground_4a_students_for_new_students') &&
            !facts.prior_notice_ground_4a_details
          ? 'Add incoming-student detail for prior notice ground 4A.'
          : null,
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : shouldRecordPriorNoticeGrounds(facts) &&
            hasSupportedAccommodationGround(facts) &&
            !facts.prior_notice_supported_accommodation_details
          ? 'Add supported accommodation detail for the selected prior-notice ground.'
          : null,
    (facts) =>
      isExistingWrittenEnglandTenancy(facts)
        ? null
        : isTruthySelection(facts.supported_accommodation_tenancy) &&
            !facts.supported_accommodation_explanation
          ? 'Add an explanation of why the tenancy is granted as supported accommodation.'
          : null,
    (facts) =>
      product === 'england_student_tenancy_agreement' &&
      shouldShowEnglandAssuredAgreementSteps(facts) &&
      facts.student_fixed_term_requested === 'yes'
        ? 'Student fixed-term requests should stay on the assured-periodic route unless separate legal sign-off is in place.'
        : null,
  ];
}

function createRowId() {
  return `row_${Math.random().toString(36).slice(2, 9)}`;
}

function createRoom(name: string): StandaloneRoomRecord {
  return {
    id: createRowId(),
    name,
    items: [],
  };
}

export function getDefaultStandaloneRoomTemplates(mode: 'inspection' | 'inventory'): string[] {
  const base = ['Entrance hall', 'Living room', 'Kitchen', 'Bedroom 1', 'Bathroom', 'External areas'];
  if (mode === 'inventory') {
    return [...base, 'Bedroom 2', 'Storage / utility area'];
  }
  return base;
}

const COMMON_RULES = {
  englandOnly: (facts: Record<string, any>) =>
    facts.jurisdiction === 'england' || facts.property_country === 'england'
      ? null
      : 'This standalone residential product is currently available for England only.',
};

const CONFIGS: Record<ResidentialLettingProductSku, ResidentialStandaloneFlowConfig> = {
  england_standard_tenancy_agreement: {
    product: 'england_standard_tenancy_agreement',
    documentTitle: 'Standard Tenancy Agreement & Setup Pack',
    reviewTitle: 'Standard tenancy setup pack review',
    warnings: [
      'Use this route for an ordinary England whole-property assured tenancy or, where relevant, a written statement of terms for an existing verbal tenancy.',
      'If the landlord lives in the property, the lodger agreement route is usually a better fit.',
    ],
    upsellRecommendations: ['inventory_schedule_condition', 'rental_inspection_report'],
    reviewSummaryFields: [
      'england_tenancy_purpose',
      'property_address_line1',
      'landlord_full_name',
      'tenant_full_name',
      'tenancy_start_date',
      'rent_amount',
      'tenant_notice_period',
    ],
    requiredFacts: createEnglandAssuredRequiredFacts([]),
    completionRules: createEnglandAssuredCompletionRules('england_standard_tenancy_agreement'),
    steps: [
      commonEnglandTenancyPurposeStep('Standard Tenancy Agreement & Setup Pack'),
      commonEnglandTransitionReferenceStep(),
      {
        id: 'suitability',
        title: 'Suitability',
        description: 'Use the standard route for an ordinary England residential letting.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          { id: 'tenant_is_individual', label: 'Occupier is an individual rather than a company', type: 'checkbox', required: true },
          { id: 'main_home', label: 'Property will be the occupier main home', type: 'checkbox', required: true },
          { id: 'landlord_not_resident_confirmed', label: 'Landlord does not live at the property', type: 'checkbox', required: true, helpText: 'Leave unticked if you actually need the lodger route.' },
          { id: 'not_holiday_or_licence_confirmed', label: 'This is not intended as a holiday let or licence-only arrangement', type: 'checkbox', required: true },
        ],
      },
      {
        ...commonPropertyStep('Identify the England property covered by the agreement.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonPropertyProfileStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonLandlordStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonTenantStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      commonEnglandAssuredTenancyTermsStep(),
      commonEnglandAssuredComplianceStep(),
      commonEnglandPreTenancyComplianceStep(),
      commonEnglandRulesAndAccessStep(),
    ],
  },
  england_premium_tenancy_agreement: {
    product: 'england_premium_tenancy_agreement',
    documentTitle: 'Premium Tenancy Agreement & Management Pack',
    reviewTitle: 'Premium tenancy management pack review',
    warnings: [
      'Premium is now a fuller ordinary-residential England agreement, not the HMO shortcut.',
      'Choose the HMO / Shared or Lodger route if the occupation setup is materially different.',
    ],
    upsellRecommendations: [
      'inventory_schedule_condition',
      'rental_inspection_report',
      'guarantor_agreement',
    ],
    reviewSummaryFields: [
      'england_tenancy_purpose',
      'property_address_line1',
      'landlord_full_name',
      'tenant_full_name',
      'tenancy_start_date',
      'rent_amount',
      'management_contact_channel',
      'routine_inspection_window',
      'premium_operational_notes',
    ],
    requiredFacts: createEnglandAssuredRequiredFacts([
      'premium_operational_notes',
      'management_contact_channel',
      'routine_inspection_window',
      'repair_reporting_contact',
      'repair_response_timeframe',
      'key_holders_summary',
      'check_in_documentation_expectation',
      'utilities_transfer_expectation',
      'handover_expectations',
    ]),
    completionRules: [
      ...createEnglandAssuredCompletionRules('england_premium_tenancy_agreement'),
      (facts) =>
        shouldShowEnglandAssuredAgreementSteps(facts) &&
        facts.guarantor_expected === 'yes' &&
        (!facts.guarantor_full_name || !facts.guarantor_address || !facts.guarantor_email)
          ? 'Add the guarantor name, address, and email to include the optional guarantor deed in the Premium pack.'
          : null,
    ],
    steps: [
      commonEnglandTenancyPurposeStep('Premium Tenancy Agreement & Management Pack'),
      commonEnglandTransitionReferenceStep(),
      {
        id: 'suitability',
        title: 'Suitability',
        description: 'Use Premium for an ordinary England residential let where you want fuller drafting.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          { id: 'tenant_is_individual', label: 'Occupier is an individual rather than a company', type: 'checkbox', required: true },
          { id: 'main_home', label: 'Property will be the occupier main home', type: 'checkbox', required: true },
          { id: 'landlord_not_resident_confirmed', label: 'Landlord does not live at the property', type: 'checkbox', required: true, helpText: 'Choose Lodger instead if the landlord is resident.' },
          { id: 'not_holiday_or_licence_confirmed', label: 'This is not intended as a holiday let or bare licence arrangement', type: 'checkbox', required: true },
        ],
      },
      {
        ...commonPropertyStep('Identify the England property covered by the premium agreement.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonPropertyProfileStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonLandlordStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonTenantStep('Tenant details', 'Identify the lead tenant or named tenant group for the premium England agreement.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      commonEnglandAssuredTenancyTermsStep('Commercial terms'),
      commonEnglandAssuredComplianceStep(),
      commonEnglandPreTenancyComplianceStep(),
      {
        id: 'premium_controls',
        title: 'Premium controls',
        description: 'Capture the extra operational detail that makes Premium distinct from Standard.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          {
            id: 'guarantor_expected',
            label: 'Guarantor likely to be used',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'guarantor_full_name',
            label: 'Guarantor full name',
            type: 'text',
            required: true,
            visibleWhen: (facts) => facts.guarantor_expected === 'yes',
          },
          {
            id: 'guarantor_address',
            label: 'Guarantor address',
            type: 'textarea',
            required: true,
            visibleWhen: (facts) => facts.guarantor_expected === 'yes',
          },
          {
            id: 'guarantor_email',
            label: 'Guarantor email',
            type: 'text',
            required: true,
            visibleWhen: (facts) => facts.guarantor_expected === 'yes',
          },
          {
            id: 'guarantor_phone',
            label: 'Guarantor phone',
            type: 'text',
            visibleWhen: (facts) => facts.guarantor_expected === 'yes',
          },
          {
            id: 'premium_operational_notes',
            label: 'Operational detail to emphasise',
            type: 'textarea',
            required: true,
            helpText: 'For example: access arrangements, maintenance reporting, key handling, or contractor coordination.',
          },
          {
            id: 'premium_management_schedule',
            label: 'Premium management schedule',
            type: 'textarea',
            helpText: 'Record any property-management expectations you want reflected in the drafting.',
          },
          {
            id: 'management_contact_channel',
            label: 'Primary management contact channel',
            type: 'select',
            required: true,
            options: [
              { value: 'email', label: 'Email' },
              { value: 'phone', label: 'Phone' },
              { value: 'managing_agent_portal', label: 'Managing agent portal' },
              { value: 'mixed_channels', label: 'Mixed channels depending on issue' },
            ],
            helpText: 'How routine tenancy communication should ordinarily be handled.',
          },
          {
            id: 'routine_inspection_window',
            label: 'Routine inspection window',
            type: 'select',
            required: true,
            options: [
              { value: 'quarterly_weekday_daytime', label: 'Quarterly weekday daytime visits' },
              { value: 'every_6_months_weekday_daytime', label: 'Every 6 months on weekday daytime visits' },
              { value: 'agreed_case_by_case', label: 'Agreed case by case with the tenant' },
              { value: 'reasonable_notice_flexible', label: 'Flexible timing with reasonable notice' },
            ],
            helpText: 'This strengthens the Premium schedule around inspections and planned access.',
          },
          {
            id: 'repair_reporting_contact',
            label: 'Repairs reporting contact',
            type: 'text',
            required: true,
            helpText: 'Who the tenant should contact first for repairs, maintenance reports, or urgent property issues.',
          },
          {
            id: 'repair_response_timeframe',
            label: 'Repairs response expectation',
            type: 'select',
            required: true,
            options: [
              { value: 'same_day_emergencies', label: 'Same day for emergencies' },
              { value: 'within_24_hours', label: 'Within 24 hours' },
              { value: 'within_48_hours', label: 'Within 48 hours' },
              { value: 'reasonable_time_by_severity', label: 'Reasonable time depending on severity' },
            ],
          },
          {
            id: 'key_holders_summary',
            label: 'Keys and access devices held',
            type: 'textarea',
            required: true,
            helpText: 'List keys, fobs, alarm details, or concierge access items that should be tracked at handover.',
          },
          {
            id: 'check_in_documentation_expectation',
            label: 'Check-in paperwork and evidence expectation',
            type: 'textarea',
            required: true,
            helpText: 'Summarise which inventory, photos, meter records, or sign-off documents the tenant should review at handover.',
          },
          {
            id: 'utilities_transfer_expectation',
            label: 'Utilities and account transfer expectation',
            type: 'textarea',
            required: true,
            helpText: 'Record how meter readings, council tax, broadband, and supplier handover should usually be handled.',
          },
          {
            id: 'contractor_access_procedure',
            label: 'Contractor access procedure',
            type: 'textarea',
            helpText: 'Record how contractors should be booked, supervised, or notified to the tenant.',
          },
          {
            id: 'contractor_key_release_policy',
            label: 'Contractor key release policy',
            type: 'textarea',
            helpText: 'If keys or fobs may be released temporarily for works, record the supervision or sign-out expectations.',
          },
          {
            id: 'handover_expectations',
            label: 'Move-out and hand-back expectations',
            type: 'textarea',
            required: true,
            helpText: 'Summarise keys, meter readings, cleaning, rubbish removal, and forwarding-address expectations.',
          },
        ],
      },
      commonEnglandRulesAndAccessStep(),
    ],
  },
  england_student_tenancy_agreement: {
    product: 'england_student_tenancy_agreement',
    documentTitle: 'Student Tenancy Agreement',
    reviewTitle: 'Student tenancy agreement review',
    warnings: [
      'Use this route for student-focused England lettings rather than relying on Premium as a bundle.',
      'Fixed-term student requests should be reviewed carefully before use.',
    ],
    upsellRecommendations: ['guarantor_agreement', 'inventory_schedule_condition', 'flatmate_agreement'],
    reviewSummaryFields: [
      'england_tenancy_purpose',
      'property_address_line1',
      'tenant_full_name',
      'all_tenants_full_time_students',
      'guarantor_required',
      'student_replacement_procedure',
    ],
    requiredFacts: createEnglandAssuredRequiredFacts([
      'guarantor_required',
      'all_tenants_full_time_students',
      'joint_tenancy',
      'student_replacement_procedure',
      'student_end_of_term_expectations',
      'student_move_out_keys_process',
      'student_cleaning_standard',
    ]),
    completionRules: [
      ...createEnglandAssuredCompletionRules('england_student_tenancy_agreement'),
      (facts) =>
        shouldShowEnglandAssuredAgreementSteps(facts) &&
        facts.guarantor_required === 'yes' &&
        (!facts.guarantor_full_name || !facts.guarantor_address || !facts.guarantor_email)
          ? 'Add the guarantor name, address, and email to include the optional guarantor deed in the student pack.'
          : null,
    ],
    steps: [
      commonEnglandTenancyPurposeStep('Student Tenancy Agreement'),
      commonEnglandTransitionReferenceStep(),
      {
        id: 'suitability',
        title: 'Student setup',
        description: 'Capture the student-specific occupation profile for the agreement.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          { id: 'tenant_is_individual', label: 'Occupiers are individuals rather than a company', type: 'checkbox', required: true },
          { id: 'main_home', label: 'Property is intended as the occupier main home', type: 'checkbox', required: true },
          { id: 'landlord_not_resident_confirmed', label: 'Landlord does not live at the property', type: 'checkbox', required: true },
          { id: 'not_holiday_or_licence_confirmed', label: 'This is not intended as a holiday let or licence-only arrangement', type: 'checkbox', required: true },
        ],
      },
      {
        ...commonPropertyStep('Identify the England property covered by the student agreement.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonPropertyProfileStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonLandlordStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonTenantStep('Student tenant details', 'Name the tenant group and record the lead contact details.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      commonEnglandAssuredTenancyTermsStep('Student tenancy terms'),
      commonEnglandAssuredComplianceStep(),
      commonEnglandPreTenancyComplianceStep(),
      {
        id: 'student_specifics',
        title: 'Student-specific details',
        description: 'Capture the clauses and expectations that make the student product distinct.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          {
            id: 'all_tenants_full_time_students',
            label: 'All named tenants are full-time students',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'guarantor_required',
            label: 'One or more tenants will have a guarantor',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'guarantor_full_name',
            label: 'Guarantor full name',
            type: 'text',
            required: true,
            visibleWhen: (facts) => facts.guarantor_required === 'yes',
          },
          {
            id: 'guarantor_address',
            label: 'Guarantor address',
            type: 'textarea',
            required: true,
            visibleWhen: (facts) => facts.guarantor_required === 'yes',
          },
          {
            id: 'guarantor_email',
            label: 'Guarantor email',
            type: 'text',
            required: true,
            visibleWhen: (facts) => facts.guarantor_required === 'yes',
          },
          {
            id: 'guarantor_phone',
            label: 'Guarantor phone',
            type: 'text',
            visibleWhen: (facts) => facts.guarantor_required === 'yes',
          },
          {
            id: 'joint_tenancy',
            label: 'All tenants are on one joint agreement',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'student_replacement_procedure',
            label: 'Include a tenant replacement procedure',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'student_guarantor_scope',
            label: 'Guarantor scope',
            type: 'select',
            required: true,
            visibleWhen: (facts) => facts.guarantor_required === 'yes',
            options: [
              { value: 'rent_and_all_tenant_obligations', label: 'Rent and all tenant obligations' },
              { value: 'rent_only', label: 'Rent only' },
              { value: 'rent_and_damage', label: 'Rent and damage obligations' },
            ],
          },
          {
            id: 'replacement_notice_window',
            label: 'Replacement request notice window',
            type: 'select',
            required: true,
            visibleWhen: (facts) => facts.student_replacement_procedure === 'yes',
            options: [
              { value: '14_days', label: '14 days' },
              { value: '21_days', label: '21 days' },
              { value: '28_days', label: '28 days' },
              { value: 'reasonable_notice', label: 'Reasonable notice' },
            ],
          },
          {
            id: 'replacement_cost_responsibility',
            label: 'Replacement documentation costs',
            type: 'select',
            required: true,
            visibleWhen: (facts) => facts.student_replacement_procedure === 'yes',
            options: [
              { value: 'outgoing_tenant', label: 'Outgoing tenant' },
              { value: 'incoming_tenant', label: 'Incoming tenant' },
              { value: 'agreed_case_by_case', label: 'Agreed case by case' },
            ],
          },
          { id: 'student_end_of_term_expectations', label: 'End-of-term return standard', type: 'textarea', required: true },
          {
            id: 'student_move_out_keys_process',
            label: 'Move-out keys and return process',
            type: 'textarea',
            required: true,
            helpText: 'Record how keys, fobs, post, and final room access should be returned at the end of occupation.',
          },
          {
            id: 'student_cleaning_standard',
            label: 'Student cleaning and room hand-back standard',
            type: 'textarea',
            required: true,
            helpText: 'Describe the practical cleaning and room-condition standard expected before departure.',
          },
          { id: 'vacation_period_notes', label: 'Vacation / non-occupation notes', type: 'textarea' },
          { id: 'student_fixed_term_requested', label: 'Fixed-term student arrangement requested', type: 'radio', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
        ],
      },
      commonEnglandRulesAndAccessStep(),
    ],
  },
  england_hmo_shared_house_tenancy_agreement: {
    product: 'england_hmo_shared_house_tenancy_agreement',
    documentTitle: 'HMO / Shared House Tenancy Agreement & House Management Pack',
    reviewTitle: 'HMO / shared house management pack review',
    warnings: [
      'Use this route for sharer and communal-area setups instead of treating HMO as a Premium synonym.',
      'Licensing and local HMO requirements still need factual confirmation outside the wizard.',
    ],
    upsellRecommendations: ['inventory_schedule_condition', 'rental_inspection_report', 'flatmate_agreement'],
    reviewSummaryFields: [
      'england_tenancy_purpose',
      'property_address_line1',
      'tenant_full_name',
      'number_of_sharers',
      'hmo_licence_status',
      'communal_areas',
    ],
    requiredFacts: createEnglandAssuredRequiredFacts([
      'number_of_sharers',
      'is_hmo',
      'communal_areas',
      'hmo_licence_status',
      'communal_cleaning',
      'visitor_policy',
      'waste_collection_arrangements',
      'fire_safety_notes',
    ]),
    completionRules: createEnglandAssuredCompletionRules('england_hmo_shared_house_tenancy_agreement'),
    steps: [
      commonEnglandTenancyPurposeStep('HMO / Shared House Tenancy Agreement & House Management Pack'),
      commonEnglandTransitionReferenceStep(),
      {
        id: 'suitability',
        title: 'Shared-house setup',
        description: 'Capture the facts that distinguish the HMO/shared-house route from Standard and Premium.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          { id: 'tenant_is_individual', label: 'Occupiers are individuals rather than a company', type: 'checkbox', required: true },
          { id: 'main_home', label: 'Property is intended as the occupier main home', type: 'checkbox', required: true },
          { id: 'landlord_not_resident_confirmed', label: 'Landlord does not live at the property', type: 'checkbox', required: true },
          { id: 'not_holiday_or_licence_confirmed', label: 'This is not intended as a holiday let or licence-only arrangement', type: 'checkbox', required: true },
          { id: 'room_by_room_occupation', label: 'Occupiers are taking rooms or sharing the house in a multi-occupier arrangement', type: 'checkbox', required: true },
          { id: 'unrelated_households', label: 'Occupiers come from separate households', type: 'checkbox', required: true },
        ],
      },
      {
        ...commonPropertyStep('Identify the England HMO or shared-house property.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonPropertyProfileStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonLandlordStep(),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      {
        ...commonTenantStep('Sharer details', 'Record the named tenant group or lead contact for the shared-house agreement.'),
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
      },
      commonEnglandAssuredTenancyTermsStep('Shared-house tenancy terms'),
      commonEnglandAssuredComplianceStep(),
      commonEnglandPreTenancyComplianceStep(),
      {
        id: 'hmo_specifics',
        title: 'HMO / communal areas',
        description: 'Record the shared-house details that belong only in the HMO/shared product.',
        visibleWhen: shouldShowEnglandAssuredAgreementSteps,
        fields: [
          {
            id: 'is_hmo',
            label: 'Property is an HMO or licensable shared house',
            type: 'radio',
            required: true,
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          { id: 'number_of_sharers', label: 'Number of sharers / rooms', type: 'number', required: true },
          { id: 'communal_areas', label: 'Shared / communal areas', type: 'textarea', required: true },
          {
            id: 'hmo_licence_status',
            label: 'HMO licence status',
            type: 'select',
            required: true,
            options: [
              { value: 'not_required', label: 'Not required' },
              { value: 'currently_licensed', label: 'Currently licensed' },
              { value: 'applied_awaiting', label: 'Applied / awaiting' },
            ],
          },
          {
            id: 'communal_cleaning',
            label: 'Communal area cleaning',
            type: 'select',
            required: true,
            options: [
              { value: 'professional_cleaner', label: 'Professional cleaner' },
              { value: 'tenants_share', label: 'Tenants share' },
              { value: 'landlord', label: 'Landlord' },
              { value: 'not_applicable', label: 'Not applicable' },
            ],
          },
          { id: 'communal_rules_notes', label: 'Communal-area rules', type: 'textarea' },
          { id: 'shared_facilities_schedule', label: 'Shared facilities schedule', type: 'textarea', helpText: 'List kitchens, bathrooms, lounges, gardens, storage, or utility spaces shared by the occupiers.' },
          { id: 'visitor_policy', label: 'Visitor and overnight guest policy', type: 'textarea', required: true },
          { id: 'quiet_hours', label: 'Quiet hours or noise expectations', type: 'text' },
          { id: 'waste_collection_arrangements', label: 'Waste and recycling arrangements', type: 'textarea', required: true },
          { id: 'fire_safety_notes', label: 'Fire safety and communal-safety notes', type: 'textarea', required: true },
        ],
      },
      commonEnglandRulesAndAccessStep(),
    ],
  },
  england_lodger_agreement: {
    product: 'england_lodger_agreement',
    documentTitle: 'Room Let / Lodger Agreement & Shared Home Pack',
    reviewTitle: 'Room let / shared home pack review',
    warnings: [
      'Use this route when the landlord lives at the property and the arrangement is a resident-landlord room let.',
      'This is separate from the ordinary residential tenancy products.',
    ],
    upsellRecommendations: ['inventory_schedule_condition', 'rental_inspection_report'],
    reviewSummaryFields: [
      'property_address_line1',
      'landlord_full_name',
      'tenant_full_name',
      'resident_landlord_confirmed',
      'licence_notice_period',
    ],
    requiredFacts: [
      'property_address_line1',
      'property_address_town',
      'property_address_postcode',
      'landlord_full_name',
      'tenant_full_name',
      'tenancy_start_date',
      'rent_amount',
      'rent_frequency',
      'resident_landlord_confirmed',
      'shared_kitchen_or_bathroom',
      'licence_notice_period',
      'let_room_description',
      'house_rules_notes',
      'guest_policy',
      'shared_space_cleaning',
      'key_return_expectations',
    ],
    completionRules: [COMMON_RULES.englandOnly, (facts) => validateStructuredTenantFacts(facts)],
    steps: [
      {
        id: 'suitability',
        title: 'Resident-landlord setup',
        description: 'Use the lodger route for a room let where the landlord lives in the property.',
        fields: [
          { id: 'resident_landlord_confirmed', label: 'Landlord is resident in the property', type: 'checkbox', required: true },
          { id: 'shared_kitchen_or_bathroom', label: 'Occupier shares kitchen or bathroom facilities with the landlord', type: 'checkbox', required: true },
          { id: 'main_home', label: 'Property is the occupier main home', type: 'checkbox', required: true },
        ],
      },
      commonPropertyStep('Identify the England property and room-let address.'),
      commonLandlordStep('Resident landlord details'),
      commonTenantStep('Lodger details', 'Identify the lodger and the main contact details for the room let.'),
      {
        id: 'lodger_terms',
        title: 'Lodger terms',
        description: 'Capture the room-let terms and house-sharing expectations.',
        fields: [
          { id: 'tenancy_start_date', label: 'Occupation start date', type: 'date', required: true },
          { id: 'rent_amount', label: 'Rent amount', type: 'currency', required: true },
          {
            id: 'rent_frequency',
            label: 'Payment frequency',
            type: 'select',
            required: true,
            options: [
              { value: 'monthly', label: 'Monthly' },
              { value: 'weekly', label: 'Weekly' },
            ],
          },
          {
            id: 'licence_notice_period',
            label: 'Licence notice period',
            type: 'select',
            required: true,
            options: [
              { value: '7 days', label: '7 days' },
              { value: '14 days', label: '14 days' },
              { value: '28 days', label: '28 days' },
              { value: '1 month', label: '1 month' },
            ],
          },
          { id: 'deposit_amount', label: 'Deposit amount', type: 'currency' },
          { id: 'let_room_description', label: 'Room or area being occupied', type: 'text', required: true },
          { id: 'services_included', label: 'Services or bills included', type: 'textarea' },
          { id: 'house_rules_notes', label: 'House rules and shared-space notes', type: 'textarea', required: true },
          { id: 'guest_policy', label: 'Guest and overnight stay policy', type: 'textarea', required: true },
          { id: 'quiet_hours', label: 'Quiet hours or household timing expectations', type: 'text' },
          { id: 'shared_space_cleaning', label: 'Shared-space cleaning arrangements', type: 'textarea', required: true },
          { id: 'key_return_expectations', label: 'Key return and room hand-back expectations', type: 'textarea', required: true },
        ],
      },
      {
        id: 'lodger_readiness',
        title: 'Room-let readiness',
        description: 'Capture the practical compliance and handover points that should appear in the lodger checklist.',
        fields: [
          { id: 'right_to_rent_check_date', label: 'Right to Rent check date', type: 'date' },
          {
            id: 'smoke_alarms_fitted',
            label: 'Smoke alarms fitted and tested',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
          {
            id: 'carbon_monoxide_alarms',
            label: 'Carbon monoxide alarms fitted where required',
            type: 'radio',
            options: [
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ],
          },
        ],
      },
    ],
  },
  guarantor_agreement: {
    product: 'guarantor_agreement',
    documentTitle: 'Guarantor Agreement',
    reviewTitle: 'Guarantor agreement review',
    warnings: ['A guarantor may be liable for rent, damages, legal costs, and continuing renewals depending on scope.'],
    upsellRecommendations: ['renewal_tenancy_agreement'],
    reviewSummaryFields: ['landlord_full_name', 'tenant_full_name', 'guarantor_full_name', 'rent_amount', 'guarantee_scope'],
    requiredFacts: ['property_address_line1', 'landlord_full_name', 'tenant_full_name', 'guarantor_full_name', 'tenancy_start_date', 'rent_amount', 'guarantee_scope'],
    completionRules: [COMMON_RULES.englandOnly, (facts) => !facts.guarantee_scope ? 'Set the scope of guarantee.' : null],
    steps: [
      { id: 'suitability', title: 'Suitability and overview', description: 'Confirm this document is for an England residential tenancy guarantee.', fields: [
        { id: 'jurisdiction_confirmed_england', label: 'I confirm the property is in England', type: 'checkbox', required: true },
        { id: 'guarantee_timing', label: 'Guarantee timing', type: 'select', required: true, options: [
          { value: 'before_move_in', label: 'Before move-in' }, { value: 'renewal', label: 'At tenancy renewal' }, { value: 'variation', label: 'At variation' }
        ] },
      ]},
      commonPropertyStep(),
      { id: 'landlord', title: 'Landlord / agent details', description: 'Who is enforcing the guarantee.', fields: [
        { id: 'landlord_full_name', label: 'Landlord full legal name', type: 'text', required: true },
        { id: 'landlord_type', label: 'Landlord type', type: 'select', required: true, options: [{value:'individual',label:'Individual'},{value:'company',label:'Company'}] },
        { id: 'landlord_service_address', label: 'Landlord service address', type: 'text', required: true },
        { id: 'landlord_email', label: 'Landlord email', type: 'text', required: true },
        { id: 'landlord_phone', label: 'Landlord phone', type: 'text' },
      ]},
      { id: 'tenant', title: 'Tenant details', description: 'Identify the guaranteed tenant obligations.', fields: [
        { id: 'tenant_full_name', label: 'Tenant full name', type: 'text', required: true },
        { id: 'tenant_current_address', label: 'Tenant current address', type: 'text', required: true },
        { id: 'tenant_email', label: 'Tenant email', type: 'text' },
        { id: 'tenant_phone', label: 'Tenant phone', type: 'text' },
      ]},
      { id: 'guarantor', title: 'Guarantor details', description: 'The guarantor identity and relationship.', fields: [
        { id: 'guarantor_full_name', label: 'Guarantor full name', type: 'text', required: true },
        { id: 'guarantor_address', label: 'Guarantor address', type: 'text', required: true },
        { id: 'guarantor_email', label: 'Guarantor email', type: 'text', required: true },
        { id: 'guarantor_phone', label: 'Guarantor phone', type: 'text' },
        { id: 'guarantor_relationship', label: 'Relationship to tenant', type: 'text', required: true },
      ]},
      { id: 'tenancy_reference', title: 'Tenancy reference details', description: 'Capture the tenancy being guaranteed.', fields: [
        { id: 'tenancy_start_date', label: 'Tenancy start date', type: 'date', required: true },
        { id: 'tenancy_term_type', label: 'Term type', type: 'select', required: true, options: [{value:'fixed',label:'Fixed term'},{value:'periodic',label:'Periodic'}]},
        { id: 'rent_amount', label: 'Rent amount', type: 'number', required: true },
        { id: 'rent_frequency', label: 'Rent frequency', type: 'select', required: true, options: [{value:'monthly',label:'Monthly'},{value:'weekly',label:'Weekly'}]},
      ]},
      { id: 'scope', title: 'Scope of guarantee', description: 'Define legal extent of guarantor liability.', fields: [
        { id: 'guarantee_scope', label: 'Scope of guarantee', type: 'select', required: true, options: [{value:'rent_only',label:'Rent only'},{value:'all_obligations',label:'All tenant obligations'}]},
        { id: 'guarantee_includes_costs', label: 'Include legal costs', type: 'checkbox' },
        { id: 'guarantee_is_capped', label: 'Liability is capped', type: 'checkbox' },
        { id: 'guarantee_cap_amount', label: 'Cap amount', type: 'number', visibleWhen: (facts) => Boolean(facts.guarantee_is_capped) },
      ]},
      { id: 'execution', title: 'Execution requirements', description: 'Capture signing formalities.', fields: [
        { id: 'signature_date', label: 'Signature date', type: 'date', required: true },
        { id: 'guarantee_as_deed', label: 'Execute as deed', type: 'checkbox' },
        { id: 'witness_required', label: 'Witness required', type: 'checkbox' },
      ]},
    ],
  },
  residential_sublet_agreement: { product: 'residential_sublet_agreement', documentTitle: 'Residential Sublet Agreement', reviewTitle: 'Sublet agreement review', warnings: ['Subletting does not transfer head tenant liability to landlord.'], upsellRecommendations: ['flatmate_agreement'], reviewSummaryFields: ['head_tenant_name','subtenant_name','sublet_start_date','sublet_rent_amount'], requiredFacts: ['property_address_line1','head_tenant_name','subtenant_name','sublet_start_date','sublet_rent_amount','landlord_consent_status'], completionRules: [COMMON_RULES.englandOnly], steps: [
    { id:'suitability', title:'Suitability and legal warning', description:'Confirm this is a sublet not an assignment.', fields:[
      {id:'sublet_not_assignment_confirmed',label:'I confirm this is subletting, not assignment',type:'checkbox',required:true},
      {id:'landlord_consent_status',label:'Landlord consent status',type:'select',required:true,options:[{value:'required_and_obtained',label:'Required and obtained'},{value:'required_not_obtained',label:'Required but not obtained'},{value:'not_required',label:'Not required'}]},
    ]},
    commonPropertyStep('Property and sublet area details.'),
    { id:'parties', title:'Head tenant and subtenant', description:'Capture both contracting parties.', fields:[
      {id:'head_tenant_name',label:'Head tenant full name',type:'text',required:true},
      {id:'head_tenant_email',label:'Head tenant email',type:'text',required:true},
      {id:'subtenant_name',label:'Subtenant full name',type:'text',required:true},
      {id:'subtenant_email',label:'Subtenant email',type:'text',required:true},
    ]},
    { id:'head_tenancy', title:'Head tenancy details', description:'Reference the original tenancy and consent terms.', fields:[
      {id:'head_landlord_name',label:'Landlord name',type:'text',required:true},
      {id:'head_tenancy_start_date',label:'Original tenancy start date',type:'date',required:true},
      {id:'head_tenancy_rent',label:'Current head tenancy rent',type:'number',required:true},
      {id:'consent_conditions',label:'Consent conditions',type:'textarea'},
    ]},
    { id:'sublet_term', title:'Sublet term and rent', description:'Commercial terms for the sublet.', fields:[
      {id:'sublet_start_date',label:'Sublet start date',type:'date',required:true},
      {id:'sublet_end_date',label:'Sublet end date (if fixed)',type:'date'},
      {id:'sublet_rent_amount',label:'Sublet rent amount',type:'number',required:true},
      {id:'sublet_deposit_amount',label:'Sublet deposit amount',type:'number'},
    ]},
  ]},
  lease_amendment: { product:'lease_amendment', documentTitle:'Lease Amendment', reviewTitle:'Lease amendment review', warnings:['This document amends an existing tenancy instead of replacing it.'], upsellRecommendations:['renewal_tenancy_agreement'], reviewSummaryFields:['landlord_full_name','tenant_full_name','original_agreement_date','amendment_effective_date'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','original_agreement_date','amendment_effective_date'], completionRules:[COMMON_RULES.englandOnly, (facts)=> Array.isArray(facts.amendment_rows) && facts.amendment_rows.length > 0 ? null : 'Add at least one amendment row.'], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm this is a variation and not a full renewal.',fields:[{id:'amendment_not_renewal_confirmed',label:'I confirm this is an amendment',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant(s) to the original tenancy.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'reference',title:'Original agreement reference',description:'Identify the agreement being amended.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'original_tenancy_start_date',label:'Original tenancy start',type:'date',required:true},{id:'current_rent_amount',label:'Current rent',type:'number'}]},
    {id:'categories',title:'Amendment categories',description:'Select amendments and detail changes.',fields:[
      {id:'amendment_title',label:'Amendment title',type:'text',placeholder:'e.g. Rent and pet clause amendment'},
      {id:'amendment_rows',label:'Clause amendment matrix',type:'repeater',required:true,addLabel:'Add amendment row',columns:[
        {id:'clause_reference',label:'Clause reference',type:'text',required:true},
        {id:'current_position',label:'Current wording summary',type:'textarea'},
        {id:'replacement_text',label:'Replacement wording',type:'textarea',required:true},
      ],emptyRow:{clause_reference:'',current_position:'',replacement_text:''}},
      {id:'amendment_details',label:'Additional amendment notes',type:'textarea'},
    ]},
    {id:'effective',title:'Effective date and continuation',description:'When changes apply and confirmation that other terms remain.',fields:[{id:'amendment_effective_date',label:'Effective date',type:'date',required:true},{id:'other_terms_unchanged_confirmed',label:'All other terms remain unchanged',type:'checkbox',required:true}]},
  ]},
  lease_assignment_agreement: { product:'lease_assignment_agreement', documentTitle:'Lease Assignment Agreement', reviewTitle:'Assignment agreement review', warnings:['Assignment transfers tenancy interest and should match consent requirements.'], upsellRecommendations:['renewal_tenancy_agreement'], reviewSummaryFields:['landlord_full_name','outgoing_tenant_name','incoming_tenant_name','assignment_date'], requiredFacts:['property_address_line1','landlord_full_name','outgoing_tenant_name','incoming_tenant_name','assignment_date','consent_status'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm assignment and landlord consent status.',fields:[{id:'assignment_not_sublet_confirmed',label:'I confirm this is assignment, not subletting',type:'checkbox',required:true},{id:'consent_status',label:'Landlord consent',type:'select',required:true,options:[{value:'obtained',label:'Obtained'},{value:'pending',label:'Pending'},{value:'not_required',label:'Not required'}]}]},
    commonPropertyStep(),
    {id:'landlord',title:'Landlord details',description:'Landlord consent and notices identity.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'landlord_address',label:'Landlord address',type:'text',required:true}]},
    {id:'tenants',title:'Outgoing and incoming tenant details',description:'Transfer from outgoing to incoming tenant.',fields:[{id:'outgoing_tenant_name',label:'Outgoing tenant name',type:'text',required:true},{id:'incoming_tenant_name',label:'Incoming tenant name',type:'text',required:true}]},
    {id:'reference',title:'Existing tenancy details',description:'Reference current tenancy terms.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'rent_amount',label:'Current rent',type:'number',required:true},{id:'deposit_amount',label:'Deposit amount',type:'number'}]},
    {id:'assignment',title:'Assignment terms',description:'Set assignment date and release terms.',fields:[
      {id:'assignment_date',label:'Assignment date',type:'date',required:true},
      {id:'outgoing_tenant_release',label:'Outgoing tenant release status',type:'radio',required:true,options:[{value:'full_release',label:'Full release'},{value:'partial_release',label:'Partial release'},{value:'no_release',label:'No release'}]},
      {id:'deposit_treatment',label:'Deposit treatment',type:'textarea'},
      {id:'assignment_apportionment_rows',label:'Apportionments',type:'repeater',addLabel:'Add apportionment row',columns:[
        {id:'item',label:'Item',type:'text',required:true},
        {id:'amount',label:'Amount',type:'currency'},
        {id:'note',label:'Note',type:'text'},
      ],emptyRow:{item:'',amount:'',note:''}},
      {id:'assignment_key_handover',label:'Key handover notes',type:'textarea'},
    ]},
  ]},
  rent_arrears_letter: { product:'rent_arrears_letter', documentTitle:'Rent Arrears Letter', reviewTitle:'Rent arrears letter review', warnings:['Use factual arrears figures. Consider pre-action protocol and proportionality before escalation.'], upsellRecommendations:['repayment_plan_agreement'], reviewSummaryFields:['sender_name','tenant_full_name','arrears_mode','arrears_total','arrears_as_at_date','final_deadline'], requiredFacts:['property_address_line1','sender_name','tenant_full_name','tenancy_start_date','rent_amount','arrears_as_at_date','final_deadline'], completionRules:[COMMON_RULES.englandOnly, (facts)=> facts.arrears_mode==='detailed_schedule' && (!Array.isArray(facts.arrears_schedule_rows)||facts.arrears_schedule_rows.length===0) ? 'Add at least one arrears schedule row.' : null], steps:[
    {id:'suitability',title:'Suitability and letter type',description:'Choose legal tone and context for demand.',fields:[{id:'letter_type',label:'Letter type',type:'select',required:true,options:[{value:'reminder',label:'Reminder'},{value:'formal_demand',label:'Formal demand'},{value:'final_warning',label:'Final warning'}]},{id:'tenant_in_occupation',label:'Tenant remains in occupation',type:'checkbox'}]},
    commonPropertyStep(),
    {id:'sender',title:'Sender details',description:'Landlord or agent issuing the letter.',fields:[{id:'sender_name',label:'Sender name',type:'text',required:true},{id:'sender_service_address',label:'Service address',type:'text',required:true},{id:'payment_instructions',label:'Payment instructions',type:'textarea',required:true}]},
    {id:'tenant',title:'Tenant details',description:'Tenant(s) receiving arrears demand.',fields:[{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true},{id:'tenant_last_known_address',label:'Last known address',type:'text',required:true},{id:'tenant_email',label:'Tenant email',type:'text'}]},
    {id:'tenancy',title:'Tenancy details',description:'Commercial tenancy facts behind arrears.',fields:[{id:'tenancy_start_date',label:'Tenancy start date',type:'date',required:true},{id:'rent_amount',label:'Current rent amount',type:'number',required:true},{id:'rent_frequency',label:'Rent frequency',type:'select',required:true,options:[{value:'monthly',label:'Monthly'},{value:'weekly',label:'Weekly'}]},{id:'rent_due_day',label:'Rent due day',type:'text'}]},
    {id:'mode',title:'Arrears calculation mode',description:'Choose quick total or detailed schedule rows.',fields:[{id:'arrears_mode',label:'Arrears mode',type:'select',required:true,options:[{value:'quick_summary',label:'Quick summary total'},{value:'detailed_schedule',label:'Detailed arrears schedule'}]},{id:'arrears_total',label:'Quick arrears total',type:'number',visibleWhen:(facts)=>facts.arrears_mode==='quick_summary'},{id:'arrears_quick_explanation',label:'Quick summary explanation',type:'textarea',visibleWhen:(facts)=>facts.arrears_mode==='quick_summary'}]},
    {id:'history',title:'Arrears history and communications',description:'Chronology and prior communications.',fields:[{id:'prior_reminders_sent',label:'Previous reminders sent',type:'checkbox'},{id:'repayment_plan_previously_offered',label:'Repayment plan offered before',type:'checkbox'},{id:'communications_summary',label:'Communications summary',type:'textarea'}]},
    {id:'demand',title:'Demand and deadlines',description:'Set arrears date and payment deadline.',fields:[{id:'arrears_as_at_date',label:'Arrears as at date',type:'date',required:true},{id:'final_deadline',label:'Final payment deadline',type:'date',required:true},{id:'court_action_if_unpaid',label:'State potential court action',type:'checkbox'}]},
  ]},
  repayment_plan_agreement: { product:'repayment_plan_agreement', documentTitle:'Repayment Plan Agreement', reviewTitle:'Repayment plan agreement review', warnings:['Confirm affordability and whether normal rent continues in addition to instalments.'], upsellRecommendations:['rent_arrears_letter'], reviewSummaryFields:['landlord_full_name','tenant_full_name','arrears_total','instalment_amount','instalment_frequency'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','arrears_total','repayment_start_date','default_consequence'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm this is an agreed repayment plan.',fields:[{id:'plan_agreed_confirmed',label:'Both parties agree to repayment plan',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'background',title:'Tenancy and arrears background',description:'Current arrears position.',fields:[{id:'tenancy_start_date',label:'Tenancy start date',type:'date',required:true},{id:'arrears_total',label:'Arrears total',type:'currency',required:true},{id:'arrears_as_at_date',label:'Arrears as at date',type:'date',required:true}]},
    {id:'structure',title:'Repayment structure',description:'Installment framework and rent continuity.',fields:[
      {id:'instalment_amount',label:'Headline instalment amount',type:'currency'},
      {id:'instalment_frequency',label:'Instalment frequency',type:'select',required:true,options:[{value:'weekly',label:'Weekly'},{value:'monthly',label:'Monthly'}]},
      {id:'repayment_start_date',label:'Repayment start date',type:'date',required:true},
      {id:'normal_rent_continues',label:'Normal rent continues in addition',type:'checkbox'},
      {id:'repayment_schedule_rows',label:'Repayment schedule',type:'repeater',addLabel:'Add instalment row',columns:[
        {id:'due_date',label:'Due date',type:'date',required:true},
        {id:'amount',label:'Amount',type:'currency',required:true},
        {id:'running_balance',label:'Running balance',type:'currency'},
        {id:'note',label:'Note',type:'text'},
      ],emptyRow:{due_date:'',amount:'',running_balance:'',note:''}},
    ]},
    {id:'default',title:'Default consequences',description:'What happens if plan is missed.',fields:[{id:'default_consequence',label:'Default consequence',type:'textarea',required:true},{id:'grace_period_days',label:'Grace period (days)',type:'number'},{id:'payment_details',label:'Payment details or reference',type:'textarea'}]},
  ]},
  residential_tenancy_application: { product:'residential_tenancy_application', documentTitle:'Residential Tenancy Application', reviewTitle:'Tenancy application review', warnings:['This is an application and evidence intake, not a tenancy contract.'], upsellRecommendations:['guarantor_agreement'], reviewSummaryFields:['applicant_full_name','proposed_move_in_date','proposed_rent','employment_status'], requiredFacts:['applicant_full_name','current_address','email','proposed_move_in_date','proposed_rent','employment_status','checks_consent'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'consent',title:'Suitability and consent',description:'Confirm applicant consent for data and checks.',fields:[{id:'checks_consent',label:'Consent to referencing / checks',type:'checkbox',required:true}]},
    commonPropertyStep('Property sought by applicant.'),
    {id:'applicant',title:'Applicant identity',description:'Applicant core identity details.',fields:[{id:'applicant_full_name',label:'Applicant full name',type:'text',required:true},{id:'date_of_birth',label:'Date of birth',type:'date',required:true},{id:'current_address',label:'Current address',type:'text',required:true},{id:'email',label:'Email',type:'text',required:true},{id:'phone',label:'Phone',type:'text',required:true}]},
    {id:'employment',title:'Employment and income',description:'Capture affordability facts.',fields:[{id:'employment_status',label:'Employment status',type:'select',required:true,options:[{value:'employed',label:'Employed'},{value:'self_employed',label:'Self-employed'},{value:'student',label:'Student'},{value:'unemployed',label:'Unemployed'}]},{id:'annual_income',label:'Annual income',type:'number',required:true},{id:'other_income',label:'Other income',type:'number'}]},
    {id:'occupancy',title:'Occupancy details',description:'Planned household composition.',fields:[{id:'occupier_count',label:'Number of occupiers',type:'number',required:true},{id:'pets',label:'Pets',type:'text'},{id:'smokers',label:'Any smokers',type:'checkbox'}]},
  ]},
  rental_inspection_report: { product:'rental_inspection_report', documentTitle:'Rental Inspection Report', reviewTitle:'Inspection report review', warnings:['Inspection facts should be objective and timestamped.'], upsellRecommendations:['inventory_schedule_condition'], reviewSummaryFields:['inspection_type','inspection_date','inspector_name','inspection_rooms'], requiredFacts:['property_address_line1','inspection_type','inspection_date','inspector_name','inspection_rooms'], completionRules:[COMMON_RULES.englandOnly, (facts)=> Array.isArray(facts.inspection_rooms) && facts.inspection_rooms.length > 0 ? null : 'Add at least one inspected room.'], steps:[
    {id:'inspection_type',title:'Inspection type',description:'Move-in, interim, or move-out.',fields:[
      commonEvidenceAdvisory(['This flagship report is designed to capture room-level findings, evidence references, and follow-up actions.', 'Use objective wording and keep comments tied to visible condition rather than opinion.']),
      {id:'inspection_type',label:'Inspection type',type:'radio',required:true,options:[{value:'move_in',label:'Move-in'},{value:'interim',label:'Interim'},{value:'move_out',label:'Move-out'}]},
      {id:'inspection_purpose',label:'Purpose of inspection',type:'textarea',helpText:'For example: check-in baseline, periodic management inspection, pre-checkout visit.'},
    ]},
    commonPropertyStep(),
    {id:'inspection',title:'Inspection details',description:'Date, inspector, attendance details.',fields:[
      {id:'inspection_date',label:'Inspection date',type:'date',required:true},
      {id:'inspection_time',label:'Inspection time',type:'text',placeholder:'e.g. 10:30am'},
      {id:'inspector_name',label:'Inspector name',type:'text',required:true},
      {id:'inspection_attended_by',label:'Who attended',type:'text',helpText:'List tenant, agent, contractor, or representative names.'},
      {id:'furnished_status',label:'Furnished status',type:'radio',options:[{value:'furnished',label:'Furnished'},{value:'part_furnished',label:'Part furnished'},{value:'unfurnished',label:'Unfurnished'}]},
    ]},
    {id:'rooms',title:'Room builder',description:'Add standard rooms, custom rooms, and room-level observations.',fields:[
      {id:'property_layout_notes',label:'Layout notes',type:'textarea',helpText:'Capture any unusual layout, access limitations, or external areas.'},
      {id:'inspection_rooms',label:'Inspected rooms',type:'room_builder',required:true,roomMode:'inspection',roomTemplates:getDefaultStandaloneRoomTemplates('inspection')},
    ]},
    {id:'utilities',title:'Utilities, keys, and safety',description:'Capture the operational evidence around the visit.',fields:[
      {id:'keys_provided_count',label:'Number of keys / fobs provided',type:'number'},
      {id:'keys_provided_summary',label:'Keys / access devices summary',type:'textarea'},
      {id:'meter_reading_gas',label:'Gas meter reading',type:'text'},
      {id:'meter_reading_electric',label:'Electric meter reading',type:'text'},
      {id:'meter_reading_water',label:'Water meter reading',type:'text'},
      {id:'safety_checks_summary',label:'Safety observations',type:'textarea'},
      {id:'alarm_test_summary',label:'Alarm or detector test summary',type:'textarea'},
      {id:'follow_up_items',label:'Follow-up actions',type:'repeater',addLabel:'Add follow-up item',columns:[
        {id:'action',label:'Action',type:'text',required:true},
        {id:'room',label:'Room / area',type:'text'},
        {id:'owner',label:'Owner',type:'text'},
        {id:'target_date',label:'Target date',type:'date'},
      ],emptyRow:{action:'',room:'',owner:'',target_date:''}},
    ]},
    {id:'evidence',title:'Evidence and sign-off',description:'Link supporting files, comments, and acknowledgment.',fields:[
      {id:'inspection_evidence_files',label:'Upload supporting photos or files',type:'upload',evidenceCategory:'photo',helpText:'Upload inspection photos, supporting files, or a video reference sheet.'},
      {id:'photo_schedule_reference',label:'Photo or video reference label',type:'text',placeholder:'e.g. Inspection set A / video walkthrough'},
      {id:'tenant_comments',label:'Occupier comments',type:'textarea'},
      {id:'inspector_certification',label:'Inspector certification note',type:'textarea',helpText:'Optional typed note to appear above the signature area.'},
    ]},
  ]},
  inventory_schedule_condition: { product:'inventory_schedule_condition', documentTitle:'Inventory & Schedule of Condition', reviewTitle:'Inventory schedule review', warnings:['Inventory should be detailed enough for check-in / check-out evidence.'], upsellRecommendations:['rental_inspection_report'], reviewSummaryFields:['inventory_date','landlord_full_name','tenant_full_name','inventory_rooms'], requiredFacts:['property_address_line1','inventory_date','landlord_full_name','tenant_full_name','inventory_rooms'], completionRules:[COMMON_RULES.englandOnly, (facts)=> Array.isArray(facts.inventory_rooms) && facts.inventory_rooms.length > 0 ? null : 'Add at least one inventory room.'], steps:[
    {id:'suitability',title:'Suitability',description:'Evidence purpose and handover context.',fields:[
      commonEvidenceAdvisory(['This premium inventory is designed to create a stronger room-by-room baseline than a blank checklist.', 'Capture condition, cleanliness, keys, handover notes, and evidence references while the property is in front of you.']),
      {id:'inventory_purpose_confirmed',label:'Prepared for tenancy handover evidence',type:'checkbox',required:true},
    ]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord or agent and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord or agent name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'overview',title:'Inventory overview',description:'Inventory date and overall presentation.',fields:[
      {id:'inventory_date',label:'Inventory date',type:'date',required:true},
      {id:'furnished_status',label:'Furnished status',type:'radio',options:[{value:'furnished',label:'Furnished'},{value:'part_furnished',label:'Part furnished'},{value:'unfurnished',label:'Unfurnished'}]},
      {id:'cleanliness_overview',label:'General cleanliness / presentation',type:'textarea'},
      {id:'manuals_provided',label:'Manuals or documents provided',type:'textarea'},
    ]},
    {id:'rooms',title:'Room and item schedule',description:'Build the inventory room by room.',fields:[
      {id:'inventory_rooms',label:'Inventory rooms',type:'room_builder',required:true,roomMode:'inventory',roomTemplates:getDefaultStandaloneRoomTemplates('inventory')},
    ]},
    {id:'utilities',title:'Utilities, keys, and handover',description:'Capture the practical handover baseline.',fields:[
      {id:'number_of_front_door_keys',label:'Front door keys',type:'number'},
      {id:'number_of_back_door_keys',label:'Back door keys',type:'number'},
      {id:'number_of_window_keys',label:'Window keys',type:'number'},
      {id:'number_of_mailbox_keys',label:'Mailbox keys',type:'number'},
      {id:'access_cards_fobs',label:'Access cards or fobs',type:'text'},
      {id:'meter_reading_gas',label:'Gas meter reading',type:'text'},
      {id:'meter_reading_electric',label:'Electric meter reading',type:'text'},
      {id:'meter_reading_water',label:'Water meter reading',type:'text'},
      {id:'document_handover_notes',label:'Handover notes',type:'textarea'},
    ]},
    {id:'evidence',title:'Evidence and acknowledgment',description:'Attach supporting references and comments.',fields:[
      {id:'inventory_evidence_files',label:'Upload supporting photos or files',type:'upload',evidenceCategory:'photo',helpText:'Upload check-in photos, handover evidence, or room reference images.'},
      {id:'photo_schedule_reference',label:'Photo or evidence reference label',type:'text'},
      {id:'tenant_comments',label:'Tenant comments or amendments',type:'textarea'},
    ]},
  ]},
  flatmate_agreement: { product:'flatmate_agreement', documentTitle:'Flatmate Agreement', reviewTitle:'Flatmate agreement review', warnings:['This agreement manages co-occupier obligations; it does not replace landlord tenancy rights.'], upsellRecommendations:['residential_sublet_agreement'], reviewSummaryFields:['flatmate_names','rent_split_summary','notice_period_between_flatmates'], requiredFacts:['property_address_line1','flatmate_names','room_allocation','rent_split_summary','notice_period_between_flatmates'], completionRules:[COMMON_RULES.englandOnly], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm shared occupation arrangement.',fields:[{id:'shared_occupation_confirmed',label:'I confirm this is a shared household arrangement',type:'checkbox',required:true}]},
    commonPropertyStep(),
    {id:'flatmates',title:'Flatmate details',description:'Identify all flatmates and lead tenant.',fields:[{id:'flatmate_names',label:'Flatmate names (comma separated)',type:'text',required:true},{id:'lead_tenant_name',label:'Lead/head tenant (if any)',type:'text'}]},
    {id:'allocation',title:'Room allocation',description:'Assign private and shared spaces.',fields:[{id:'room_allocation',label:'Room allocation details',type:'textarea',required:true}]},
    {id:'split',title:'Rent and bill split',description:'Contribution and household costs.',fields:[{id:'total_household_rent',label:'Total household rent',type:'number',required:true},{id:'rent_split_summary',label:'Rent/bills split summary',type:'textarea',required:true}]},
    {id:'rules',title:'House rules and exit',description:'Rules, notice and moving-out process.',fields:[{id:'house_rules',label:'House rules',type:'textarea',required:true},{id:'notice_period_between_flatmates',label:'Notice period between flatmates',type:'text',required:true}]},
  ]},
  renewal_tenancy_agreement: { product:'renewal_tenancy_agreement', documentTitle:'Renewal Tenancy Agreement', reviewTitle:'Renewal tenancy review', warnings:['Use renewal where a new term is intended; use amendment for isolated clause changes.'], upsellRecommendations:['lease_amendment'], reviewSummaryFields:['landlord_full_name','tenant_full_name','renewal_start_date','new_rent_amount'], requiredFacts:['property_address_line1','landlord_full_name','tenant_full_name','original_agreement_date','renewal_start_date','renewal_term_length','new_rent_amount'], completionRules:[COMMON_RULES.englandOnly, (facts)=> facts.renewal_start_date && facts.renewal_start_date >= '2026-05-01' && !facts.renewal_legal_warning_acknowledged ? 'Acknowledge the post-1 May 2026 renewal suitability warning before continuing.' : null], steps:[
    {id:'suitability',title:'Suitability',description:'Confirm renewal vs amendment.',fields:[
      {id:'renewal_not_amendment_confirmed',label:'This is a renewal with new term',type:'checkbox',required:true},
      {id:'renewal_legal_warning_acknowledged',label:'I understand this product may be legally sensitive for England assured tenancies starting on or after 1 May 2026',type:'checkbox',required:true},
    ]},
    commonPropertyStep(),
    {id:'parties',title:'Parties',description:'Landlord and tenant details.',fields:[{id:'landlord_full_name',label:'Landlord full name',type:'text',required:true},{id:'tenant_full_name',label:'Tenant full name',type:'text',required:true}]},
    {id:'existing',title:'Existing tenancy details',description:'Reference existing tenancy.',fields:[{id:'original_agreement_date',label:'Original agreement date',type:'date',required:true},{id:'current_term_end_date',label:'Current term end date',type:'date',required:true},{id:'current_rent_amount',label:'Current rent amount',type:'currency',required:true}]},
    {id:'renewal',title:'Renewal term details',description:'New term and updated commercial terms.',fields:[
      {id:'renewal_start_date',label:'Renewal start date',type:'date',required:true},
      {id:'renewal_term_length',label:'Renewal term length',type:'text',required:true},
      {id:'new_rent_amount',label:'New rent amount',type:'currency',required:true},
      {id:'changed_terms_schedule',label:'Changed terms schedule',type:'repeater',addLabel:'Add changed term',columns:[
        {id:'topic',label:'Topic',type:'text',required:true},
        {id:'current_position',label:'Current position',type:'text'},
        {id:'new_position',label:'New position',type:'text',required:true},
      ],emptyRow:{topic:'',current_position:'',new_position:''}},
      {id:'renewal_compliance_notes',label:'Compliance or deposit notes',type:'textarea'},
    ]},
  ]},
};

export function getResidentialStandaloneFlowConfig(product: ResidentialLettingProductSku): ResidentialStandaloneFlowConfig {
  return CONFIGS[product];
}

export function getResidentialStandaloneVisibleSteps(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>
): StandaloneStepConfig[] {
  const config = getResidentialStandaloneFlowConfig(product);
  return config.steps.filter((step) => !step.visibleWhen || step.visibleWhen(facts));
}

export function getResidentialStandaloneCompletionErrors(
  product: ResidentialLettingProductSku,
  facts: Record<string, any>,
): string[] {
  const config = getResidentialStandaloneFlowConfig(product);
  const requiredFacts = getConfigRequiredFacts(config, facts);
  const missingFacts = requiredFacts.filter((field) => {
    const value = facts[field];
    if (typeof value === 'boolean') return value === false;
    if (Array.isArray(value)) return value.length === 0;
    return value === undefined || value === null || value === '';
  });

  const errors = missingFacts.map((field) => `Missing required fact: ${field}`);

  config.completionRules.forEach((rule) => {
    const issue = rule(facts);
    if (issue) errors.push(issue);
  });

  if (product === 'rent_arrears_letter' && facts.arrears_mode === 'detailed_schedule') {
    const scheduleIssues = validateArrearsScheduleRows((facts.arrears_schedule_rows || []) as ArrearsScheduleRow[]);
    errors.push(...scheduleIssues);
  }

  return errors;
}

export function getResidentialStandaloneDisplayName(product: ResidentialLettingProductSku): string {
  return RESIDENTIAL_LETTING_PRODUCTS[product].label;
}
