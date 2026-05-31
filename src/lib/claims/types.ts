export type ClaimTypeId =
  | 'landlord_debt_claim'
  | 'unpaid_invoice'
  | 'loan_or_money_owed'
  | 'faulty_goods_refund'
  | 'poor_service_contractor_dispute'
  | 'builder_tradesperson_dispute'
  | 'deposit_refund'
  | 'vehicle_repair_damage_dispute';

export type ClaimFlowMode = 'landlord_money_claim' | 'generic_small_claim';

export type ClaimAccent =
  | 'purple'
  | 'lavender'
  | 'green'
  | 'amber'
  | 'orange'
  | 'teal'
  | 'rose';

export type CommercialPriority = 'highest' | 'high' | 'medium';

export type ClaimStepId =
  | 'claim_type'
  | 'about'
  | 'details'
  | 'evidence'
  | 'check'
  | 'results';

export type ClaimAnswerType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'currency'
  | 'address'
  | 'yes_no'
  | 'single_choice'
  | 'multi_choice'
  | 'line_items'
  | 'evidence_checklist';

export type ClaimQuestionConfig = {
  id: string;
  questionText: string;
  typingText?: string;
  helperText: string;
  fieldPath: string;
  answerType: ClaimAnswerType;
  required: boolean;
  showWhen?: string;
  options?: Array<{ label: string; value: string; helperText?: string }>;
  mapsToDocument: boolean;
  validation?: {
    minLength?: number;
    minAmount?: number;
    requiredMessage?: string;
  };
};

export type ClaimStepConfig = {
  stepId: ClaimStepId;
  title: string;
  aiIntro: string;
  questions: ClaimQuestionConfig[];
};

export type ClaimLineItemCategory = {
  id: string;
  label: string;
  helperText: string;
};

export type ClaimEvidenceCategory = {
  id: string;
  label: string;
  helperText: string;
  description?: string;
  recommended?: boolean;
  requiredForDocument?: boolean;
  tips?: string[];
  showWhen?: string;
  keywordTriggers?: string[];
  aiHint?: string;
};

export type ClaimTypeConfig = {
  id: ClaimTypeId;
  slug: string;
  label: string;
  cardDescription: string;
  icon: string;
  accent: ClaimAccent;
  flowMode: ClaimFlowMode;
  commercialPriority: CommercialPriority;
  price: number;
  stepFlow: ClaimStepConfig[];
  lineItemCategories: ClaimLineItemCategory[];
  evidenceCategories: ClaimEvidenceCategory[];
  requiredDocumentFields: string[];
  packOutputs: string[];
  suitabilityBlockers: string[];
  seoKeywords: string[];
};

export type ClaimWizardAnswerValue =
  | string
  | boolean
  | string[]
  | Array<Record<string, string>>
  | Record<string, string>;

export type ClaimWizardAnswers = Record<string, ClaimWizardAnswerValue>;
