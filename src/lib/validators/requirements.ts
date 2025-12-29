import type { QuestionDefinition } from '@/lib/validators/question-schema';

export type RequirementKey =
  | 'england_s21'
  | 'england_s8'
  | 'wales_notice'
  | 'scotland_notice'
  | 'money_claim'
  | 'tenancy_agreement_standard'
  | 'tenancy_agreement_premium';

export interface RequirementDefinition {
  key: RequirementKey;
  requiredFacts: QuestionDefinition[];
  requiredEvidence: string[];
}

const yesNo = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'yes_no',
});

const currency = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'currency',
});

const dateQuestion = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'date',
});

const text = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'text',
});

const select = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'select',
});

const multiSelect = (input: Omit<QuestionDefinition, 'type'>): QuestionDefinition => ({
  ...input,
  type: 'multi_select',
});

const tenancyAgreementStandardFacts: QuestionDefinition[] = [
  text({
    id: 'landlord_full_name',
    factKey: 'landlord_full_name',
    question: 'What is the landlord’s full name?',
    required: true,
  }),
  text({
    id: 'tenant_full_name',
    factKey: 'tenant_full_name',
    question: 'What is the tenant’s full name?',
    required: true,
  }),
  text({
    id: 'property_address_line1',
    factKey: 'property_address_line1',
    question: 'What is the property address?',
    required: true,
  }),
  currency({
    id: 'rent_amount',
    factKey: 'rent_amount',
    question: 'What is the rent amount?',
    required: true,
    validation: { min: 0 },
  }),
  currency({
    id: 'deposit_amount',
    factKey: 'deposit_amount',
    question: 'What is the deposit amount?',
    required: true,
    validation: { min: 0 },
  }),
  dateQuestion({
    id: 'tenancy_start_date',
    factKey: 'tenancy_start_date',
    question: 'What is the tenancy start date?',
    required: true,
  }),
];

const tenancyAgreementPremiumExtras: QuestionDefinition[] = [
  yesNo({
    id: 'break_clause_included',
    factKey: 'break_clause_included',
    question: 'Should the agreement include a break clause?',
    required: true,
  }),
  yesNo({
    id: 'pets_policy_included',
    factKey: 'pets_policy_included',
    question: 'Should the agreement include a pets policy?',
    required: true,
  }),
  yesNo({
    id: 'repair_obligations_included',
    factKey: 'repair_obligations_included',
    question: 'Should detailed repair obligations be included?',
    required: true,
  }),
];

export const REQUIREMENTS: Record<RequirementKey, RequirementDefinition> = {
  england_s21: {
    key: 'england_s21',
    requiredFacts: [
      yesNo({
        id: 'deposit_protected',
        factKey: 'deposit_protected',
        question: 'Was the tenant deposit protected?',
        required: true,
      }),
      yesNo({
        id: 'prescribed_info_served',
        factKey: 'prescribed_info_served',
        question: 'Was prescribed information served to the tenant?',
        required: true,
      }),
      yesNo({
        id: 'gas_safety_pre_move_in',
        factKey: 'gas_safety_pre_move_in',
        question: 'Was the gas safety certificate provided before move-in?',
        required: true,
      }),
      yesNo({
        id: 'epc_provided',
        factKey: 'epc_provided',
        question: 'Was the EPC provided to the tenant?',
        required: true,
      }),
      yesNo({
        id: 'how_to_rent_provided',
        factKey: 'how_to_rent_provided',
        question: 'Was the How to Rent guide provided?',
        required: true,
      }),
    ],
    requiredEvidence: ['tenancy_agreement', 'deposit_protection', 'gas_safety', 'epc', 'how_to_rent', 'prescribed_info'],
  },
  england_s8: {
    key: 'england_s8',
    requiredFacts: [
      multiSelect({
        id: 'grounds_selected',
        factKey: 'grounds_selected',
        question: 'Which Section 8 grounds are you relying on?',
        required: true,
        options: [
          { label: 'Ground 8 (Serious arrears)', value: 'ground_8' },
          { label: 'Ground 10 (Some arrears)', value: 'ground_10' },
          { label: 'Ground 11 (Persistent delay)', value: 'ground_11' },
          { label: 'Ground 12 (Breach of tenancy)', value: 'ground_12' },
        ],
      }),
      select({
        id: 'rent_frequency',
        factKey: 'rent_frequency',
        question: 'How often is rent due?',
        required: true,
        options: [
          { label: 'Weekly', value: 'weekly' },
          { label: 'Monthly', value: 'monthly' },
          { label: 'Quarterly', value: 'quarterly' },
        ],
      }),
      currency({
        id: 'rent_amount',
        factKey: 'rent_amount',
        question: 'What is the current rent amount?',
        required: true,
        validation: { min: 0 },
      }),
      currency({
        id: 'current_arrears',
        factKey: 'current_arrears',
        question: 'What is the total arrears amount today?',
        required: true,
        validation: { min: 0 },
      }),
      dateQuestion({
        id: 'arrears_start_date',
        factKey: 'arrears_start_date',
        question: 'When did the arrears first reach the current level?',
        required: true,
      }),
    ],
    requiredEvidence: ['notice_s8', 'rent_schedule', 'arrears_ledger', 'correspondence'],
  },
  money_claim: {
    key: 'money_claim',
    requiredFacts: [
      currency({
        id: 'arrears_amount',
        factKey: 'arrears_amount',
        question: 'What is the total arrears amount for this claim?',
        required: true,
        validation: { min: 0 },
      }),
      yesNo({
        id: 'pre_action_steps',
        factKey: 'pre_action_steps',
        question: 'Have you sent a Letter Before Action or rent demand?',
        required: true,
      }),
    ],
    requiredEvidence: ['rent_schedule', 'bank_statement', 'lba_letter'],
  },
  tenancy_agreement_standard: {
    key: 'tenancy_agreement_standard',
    requiredFacts: tenancyAgreementStandardFacts,
    requiredEvidence: ['tenancy_agreement'],
  },
  tenancy_agreement_premium: {
    key: 'tenancy_agreement_premium',
    requiredFacts: [...tenancyAgreementStandardFacts, ...tenancyAgreementPremiumExtras],
    requiredEvidence: ['tenancy_agreement'],
  },
  wales_notice: {
    key: 'wales_notice',
    requiredFacts: [
      yesNo({
        id: 'bilingual_notice_provided',
        factKey: 'bilingual_notice_provided',
        question: 'Is the notice provided in English and Welsh?',
        required: true,
      }),
    ],
    requiredEvidence: ['correspondence'],
  },
  scotland_notice: {
    key: 'scotland_notice',
    requiredFacts: [
      select({
        id: 'scotland_ground',
        factKey: 'scotland_ground',
        question: 'Which Notice to Leave ground are you relying on?',
        required: true,
        options: [
          { label: 'Rent arrears', value: 'rent_arrears' },
          { label: 'Landlord intends to sell', value: 'sell_property' },
          { label: 'Landlord intends to live in property', value: 'landlord_move_in' },
        ],
      }),
      yesNo({
        id: 'notice_to_leave_served',
        factKey: 'notice_to_leave_served',
        question: 'Has the Notice to Leave been served?',
        required: true,
      }),
    ],
    requiredEvidence: ['correspondence'],
  },
};

export function resolveRequirementKey(input: {
  product?: string | null;
  jurisdiction?: string | null;
  facts: Record<string, any>;
}): RequirementKey | null {
  const product = input.product || input.facts.__meta?.product || input.facts.product;
  const jurisdiction = (input.jurisdiction || input.facts.jurisdiction || '').toLowerCase();
  const route = (
    input.facts.selected_notice_route ||
    input.facts.eviction_route ||
    input.facts.notice_type ||
    ''
  ).toString().toLowerCase();

  if (!product) return null;

  if (product === 'money_claim') return 'money_claim';
  if (product === 'tenancy_agreement') {
    const tier =
      input.facts.meta?.product_tier ||
      input.facts.__meta?.product_tier ||
      input.facts.tenancy_tier ||
      null;
    return tier === 'premium' ? 'tenancy_agreement_premium' : 'tenancy_agreement_standard';
  }

  if (jurisdiction === 'wales') return 'wales_notice';
  if (jurisdiction === 'scotland') return 'scotland_notice';

  if (route.includes('section_8') || route.includes('section 8')) return 'england_s8';
  return 'england_s21';
}
