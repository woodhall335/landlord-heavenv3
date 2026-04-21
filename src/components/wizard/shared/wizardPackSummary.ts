import type { WizardProduct } from './stepMetadata';

export interface WizardSummaryTabState {
  id: string;
  label: string;
  isCurrent: boolean;
  isComplete?: boolean;
  hasIssue?: boolean;
}

export interface WizardPackSummaryData {
  heading: string;
  subheading: string;
  includedDocuments: string[];
  outstandingSections: string[];
  sectionsNeedingAttention: string[];
  currentStepDocuments: string[];
}

const PACK_CONTENTS: Record<
  WizardProduct,
  { heading: string; subheading: string; includedDocuments: string[] }
> = {
  notice_only: {
    heading: 'Your notice pack',
    subheading: 'Current England Section 8 notice-stage documents',
    includedDocuments: [
      'Form 3A notice',
      'Service instructions',
      'Service and validity checklist',
      'Pre-service compliance declaration',
      'Rent schedule / arrears statement',
    ],
  },
  complete_pack: {
    heading: 'Your court-ready pack',
    subheading: 'Notice plus possession claim paperwork',
    includedDocuments: [
      'Form 3A notice',
      'Form N5',
      'Form N119',
      'Schedule of arrears',
      'Witness statement',
      'Court bundle and hearing support',
    ],
  },
  money_claim: {
    heading: 'Your debt recovery pack',
    subheading: 'Pre-action, claim, and enforcement support',
    includedDocuments: [
      'Letter before claim',
      'Reply form and financial statement',
      'Particulars of claim',
      'Arrears or damages schedules',
      'MCOL filing guide',
      'Enforcement guide',
    ],
  },
  money_claim_england_wales: {
    heading: 'Your debt recovery pack',
    subheading: 'Pre-action, claim, and enforcement support',
    includedDocuments: [
      'Letter before claim',
      'Reply form and financial statement',
      'Particulars of claim',
      'Arrears or damages schedules',
      'MCOL filing guide',
      'Enforcement guide',
    ],
  },
  money_claim_scotland: {
    heading: 'Your debt recovery pack',
    subheading: 'Pre-action, claim, and enforcement support',
    includedDocuments: [
      'Letter before claim',
      'Reply form and financial statement',
      'Particulars of claim',
      'Arrears or damages schedules',
      'Filing guidance',
      'Enforcement guide',
    ],
  },
  tenancy_agreement: {
    heading: 'Your tenancy file',
    subheading: 'Agreement and support documents for the let',
    includedDocuments: [
      'Tenancy agreement',
      'Prescribed information pack when relevant',
      'Deposit certificate when relevant',
      'Pre-tenancy checklist',
      'Supporting handover records',
    ],
  },
  ast_standard: {
    heading: 'Your standard tenancy file',
    subheading: 'Agreement and support documents for the let',
    includedDocuments: [
      'Assured periodic tenancy agreement',
      'Prescribed information pack when relevant',
      'Deposit certificate when relevant',
      'Pre-tenancy checklist',
      'Supporting handover records',
    ],
  },
  ast_premium: {
    heading: 'Your premium tenancy file',
    subheading: 'Agreement, support documents, and enhanced addenda',
    includedDocuments: [
      'Premium assured periodic tenancy agreement',
      'Prescribed information pack when relevant',
      'Deposit certificate when relevant',
      'Pre-tenancy checklist',
      'Supporting handover records and addenda',
    ],
  },
};

const STEP_DOCUMENT_FOCUS: Partial<Record<WizardProduct, Record<string, string[]>>> = {
  notice_only: {
    case_basics: ['Form 3A notice', 'Pre-service compliance declaration'],
    parties: ['Form 3A notice', 'Pre-service compliance declaration'],
    property: ['Form 3A notice', 'Pre-service compliance declaration'],
    tenancy: ['Form 3A notice', 'Rent schedule / arrears statement'],
    notice: ['Form 3A notice', 'Service instructions', 'Service and validity checklist'],
    section8_arrears: ['Rent schedule / arrears statement', 'Form 3A notice'],
    review: ['Final notice pack'],
  },
  complete_pack: {
    case_basics: ['Form 3A notice', 'Form N5', 'Form N119'],
    parties: ['Form N5', 'Form N119'],
    property: ['Form 3A notice', 'Form N119'],
    tenancy: ['Form 3A notice', 'Schedule of arrears'],
    notice: ['Form 3A notice', 'Proof of service certificate'],
    section8_arrears: ['Schedule of arrears', 'Witness statement'],
    evidence: ['Evidence collection checklist', 'Court bundle index', 'Witness statement'],
    court_signing: ['Form N5', 'Form N119', 'Court bundle index'],
    review: ['Complete Eviction Pack'],
  },
  money_claim: {
    claimant: ['Letter before claim', 'Particulars of claim'],
    defendant: ['Letter before claim', 'Particulars of claim'],
    claim_details: ['Particulars of claim', 'MCOL filing guide'],
    arrears: ['Arrears or damages schedules', 'Particulars of claim'],
    damages: ['Arrears or damages schedules', 'Particulars of claim'],
    claim_statement: ['Particulars of claim', 'Reply form and financial statement'],
    preaction: ['Letter before claim', 'Reply form and financial statement'],
    evidence: ['Arrears or damages schedules', 'Enforcement guide'],
    review: ['Debt recovery pack'],
  },
  money_claim_england_wales: {
    claimant: ['Letter before claim', 'Particulars of claim'],
    defendant: ['Letter before claim', 'Particulars of claim'],
    claim_details: ['Particulars of claim', 'MCOL filing guide'],
    arrears: ['Arrears or damages schedules', 'Particulars of claim'],
    damages: ['Arrears or damages schedules', 'Particulars of claim'],
    claim_statement: ['Particulars of claim', 'Reply form and financial statement'],
    preaction: ['Letter before claim', 'Reply form and financial statement'],
    evidence: ['Arrears or damages schedules', 'Enforcement guide'],
    review: ['Debt recovery pack'],
  },
  money_claim_scotland: {
    claimant: ['Letter before claim', 'Particulars of claim'],
    defendant: ['Letter before claim', 'Particulars of claim'],
    claim_details: ['Particulars of claim', 'Filing guidance'],
    arrears: ['Arrears or damages schedules', 'Particulars of claim'],
    damages: ['Arrears or damages schedules', 'Particulars of claim'],
    claim_statement: ['Particulars of claim', 'Reply form and financial statement'],
    preaction: ['Letter before claim', 'Reply form and financial statement'],
    evidence: ['Arrears or damages schedules', 'Enforcement guide'],
    review: ['Debt recovery pack'],
  },
  tenancy_agreement: {
    product: ['Tenancy agreement', 'Pre-tenancy checklist'],
    property: ['Tenancy agreement', 'Supporting handover records'],
    landlord: ['Tenancy agreement', 'Supporting handover records'],
    tenants: ['Tenancy agreement', 'Supporting handover records'],
    tenancy: ['Tenancy agreement', 'Pre-tenancy checklist'],
    rent: ['Tenancy agreement', 'Pre-tenancy checklist'],
    deposit: ['Prescribed information pack when relevant', 'Deposit certificate when relevant'],
    bills: ['Tenancy agreement', 'Supporting handover records'],
    compliance: ['Pre-tenancy checklist', 'Supporting handover records'],
    terms: ['Tenancy agreement', 'Supporting handover records'],
    premium: ['Tenancy agreement', 'Supporting handover records'],
    review: ['Tenancy file'],
  },
  ast_standard: {
    product: ['Assured periodic tenancy agreement', 'Pre-tenancy checklist'],
    property: ['Assured periodic tenancy agreement', 'Supporting handover records'],
    landlord: ['Assured periodic tenancy agreement', 'Supporting handover records'],
    tenants: ['Assured periodic tenancy agreement', 'Supporting handover records'],
    tenancy: ['Assured periodic tenancy agreement', 'Pre-tenancy checklist'],
    rent: ['Assured periodic tenancy agreement', 'Pre-tenancy checklist'],
    deposit: ['Prescribed information pack when relevant', 'Deposit certificate when relevant'],
    bills: ['Assured periodic tenancy agreement', 'Supporting handover records'],
    compliance: ['Pre-tenancy checklist', 'Supporting handover records'],
    terms: ['Assured periodic tenancy agreement', 'Supporting handover records'],
    review: ['Standard tenancy file'],
  },
  ast_premium: {
    product: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    property: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    landlord: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    tenants: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    tenancy: ['Premium assured periodic tenancy agreement', 'Pre-tenancy checklist'],
    rent: ['Premium assured periodic tenancy agreement', 'Pre-tenancy checklist'],
    deposit: ['Prescribed information pack when relevant', 'Deposit certificate when relevant'],
    bills: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    compliance: ['Pre-tenancy checklist', 'Supporting handover records and addenda'],
    terms: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    premium: ['Premium assured periodic tenancy agreement', 'Supporting handover records and addenda'],
    review: ['Premium tenancy file'],
  },
};

export function getWizardPackSummary(
  product: WizardProduct,
  tabs: WizardSummaryTabState[],
  currentStepId?: string
): WizardPackSummaryData {
  const base = PACK_CONTENTS[product];
  const outstandingSections = tabs
    .filter((tab) => !tab.isComplete && !tab.isCurrent)
    .map((tab) => tab.label)
    .slice(0, 4);
  const sectionsNeedingAttention = tabs
    .filter((tab) => tab.hasIssue)
    .map((tab) => tab.label)
    .slice(0, 3);
  const currentStepDocuments =
    (currentStepId ? STEP_DOCUMENT_FOCUS[product]?.[currentStepId] : undefined) ||
    base.includedDocuments.slice(0, 2);

  return {
    ...base,
    outstandingSections,
    sectionsNeedingAttention,
    currentStepDocuments,
  };
}
