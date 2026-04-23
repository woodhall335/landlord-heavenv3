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
  proofCards: Array<{
    title: string;
    detail: string;
    note: string;
  }>;
  proofPreviews: Array<{
    title: string;
    detail: string;
    note: string;
    thumbnailHref: string;
    embedHref: string;
  }>;
}

function buildProofPreview(
  packKey: string,
  documentType: string,
  title: string,
  detail: string,
  note: string
) {
  const encodedType = encodeURIComponent(documentType);
  return {
    title,
    detail,
    note,
    thumbnailHref: `/api/golden-pack-samples/${packKey}/${encodedType}/thumbnail`,
    embedHref: `/api/golden-pack-samples/${packKey}/${encodedType}/embed`,
  };
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
  section13_standard: {
    heading: 'Your Standard Section 13 Pack',
    subheading: 'Form 4A notice, service record, and evidence-led support',
    includedDocuments: [
      'Form 4A rent increase notice',
      'Rent increase justification report',
      'Proof of service record',
      'Rent increase cover letter',
    ],
  },
  section13_defensive: {
    heading: 'Your Challenge-Ready Section 13 Defence Pack',
    subheading: 'Form 4A notice plus tribunal-ready support documents',
    includedDocuments: [
      'Form 4A rent increase notice',
      'Rent increase justification report',
      'Proof of service record',
      'Tribunal argument summary',
      'Tribunal defence guide',
      'Landlord response template',
      'Tribunal legal briefing',
      'Evidence checklist',
      'Negotiation email template',
      'Merged tribunal bundle PDF',
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
  section13_standard: {
    tenancy: ['Form 4A rent increase notice', 'Rent increase justification report'],
    landlord: ['Form 4A rent increase notice', 'Rent increase cover letter'],
    proposal: ['Form 4A rent increase notice', 'Proof of service record'],
    charges: ['Rent increase justification report', 'Rent increase cover letter'],
    comparables: ['Rent increase justification report', 'Form 4A rent increase notice'],
    adjustments: ['Rent increase justification report', 'Form 4A rent increase notice'],
    preview: ['Form 4A rent increase notice', 'Standard Section 13 Pack'],
    outputs: ['Standard Section 13 Pack'],
  },
  section13_defensive: {
    tenancy: ['Form 4A rent increase notice', 'Rent increase justification report'],
    landlord: ['Form 4A rent increase notice', 'Rent increase cover letter'],
    proposal: ['Form 4A rent increase notice', 'Proof of service record'],
    charges: ['Rent increase justification report', 'Rent increase cover letter'],
    comparables: ['Rent increase justification report', 'Tribunal argument summary'],
    adjustments: ['Rent increase justification report', 'Tribunal argument summary'],
    preview: ['Form 4A rent increase notice', 'Challenge-Ready Section 13 Defence Pack'],
    outputs: ['Merged tribunal bundle PDF', 'Tribunal defence guide'],
  },
};

const PROOF_CARD_COPY: Partial<
  Record<WizardProduct, Array<{ title: string; detail: string; note: string }>>
> = {
  notice_only: [
    { title: 'Form 3A notice', detail: 'Official notice', note: 'Prepared from your grounds, dates, and service answers.' },
    { title: 'Service checklist', detail: 'Notice-stage guidance', note: 'Keeps service and validity steps aligned before you serve.' },
  ],
  complete_pack: [
    { title: 'Form N5', detail: 'Court claim form', note: 'Built from your party, tenancy, and possession details.' },
    { title: 'Witness statement', detail: 'Court-ready narrative', note: 'Ties the notice, arrears, and evidence into one file.' },
  ],
  money_claim: [
    { title: 'Letter before claim', detail: 'Pre-action document', note: 'Generated from your debt story and tenant details.' },
    { title: 'Particulars of claim', detail: 'Court narrative', note: 'Turns your claim basis and schedules into filing-ready wording.' },
  ],
  money_claim_england_wales: [
    { title: 'Letter before claim', detail: 'Pre-action document', note: 'Generated from your debt story and tenant details.' },
    { title: 'Particulars of claim', detail: 'Court narrative', note: 'Turns your claim basis and schedules into filing-ready wording.' },
  ],
  money_claim_scotland: [
    { title: 'Demand letter', detail: 'Pre-action document', note: 'Generated from your debt story and tenant details.' },
    { title: 'Particulars of claim', detail: 'Court narrative', note: 'Turns your claim basis and schedules into filing-ready wording.' },
  ],
  tenancy_agreement: [
    { title: 'Tenancy agreement', detail: 'Main document', note: 'Built from the property, tenancy, and landlord answers you provide.' },
    { title: 'Support records', detail: 'Handover file', note: 'Keeps the let organised from day one.' },
  ],
  ast_standard: [
    { title: 'Tenancy agreement', detail: 'Main document', note: 'Built from the property, tenancy, and landlord answers you provide.' },
    { title: 'Support records', detail: 'Handover file', note: 'Keeps the let organised from day one.' },
  ],
  ast_premium: [
    { title: 'Premium agreement', detail: 'Main document', note: 'Includes the enhanced clause set and supporting addenda.' },
    { title: 'Support addenda', detail: 'Operational file', note: 'Adds the stronger tenancy controls in the premium pack.' },
  ],
  section13_standard: [
    { title: 'Form 4A notice', detail: 'Official notice', note: 'Prepared from your rent, date, and service answers.' },
    { title: 'Justification report', detail: 'Evidence-led support', note: 'Shows the comparable evidence behind the proposed rent.' },
  ],
  section13_defensive: [
    { title: 'Form 4A notice', detail: 'Official notice', note: 'Prepared from your rent, date, and service answers.' },
    { title: 'Tribunal bundle', detail: 'Defensive output', note: 'Pulls the notice, evidence, and argument support into one file.' },
  ],
};

const PROOF_PREVIEW_COPY: Partial<
  Record<WizardProduct, Array<{ title: string; detail: string; note: string; thumbnailHref: string; embedHref: string }>>
> = {
  notice_only: [
    buildProofPreview(
      'notice_only',
      'section8_notice',
      'Form 3A notice',
      'Official notice',
      'See the real completed notice generated from the sample pack answers.'
    ),
    buildProofPreview(
      'notice_only',
      'arrears_schedule',
      'Rent schedule / arrears statement',
      'Supporting evidence',
      'Shows how the notice-stage arrears evidence is laid out for service and review.'
    ),
  ],
  complete_pack: [
    buildProofPreview(
      'complete_pack',
      'n5_claim',
      'Form N5',
      'Court claim form',
      'See the possession claim form that carries the case into court.'
    ),
    buildProofPreview(
      'complete_pack',
      'witness_statement',
      'Witness statement',
      'Court-ready narrative',
      'Shows how the pack turns the case facts into one joined-up court story.'
    ),
  ],
  money_claim: [
    buildProofPreview(
      'money_claim',
      'letter_before_claim',
      'Letter before claim',
      'Pre-action document',
      'Shows the PAP-compliant demand document landlords see before court action.'
    ),
    buildProofPreview(
      'money_claim',
      'n1_claim',
      'Form N1 claim form',
      'Official court form',
      'Shows the live court-form output generated from the claim answers.'
    ),
  ],
  money_claim_england_wales: [
    buildProofPreview(
      'money_claim',
      'letter_before_claim',
      'Letter before claim',
      'Pre-action document',
      'Shows the PAP-compliant demand document landlords see before court action.'
    ),
    buildProofPreview(
      'money_claim',
      'n1_claim',
      'Form N1 claim form',
      'Official court form',
      'Shows the live court-form output generated from the claim answers.'
    ),
  ],
  section13_standard: [
    buildProofPreview(
      'section13_standard',
      'section13_form_4a',
      'Form 4A notice',
      'Official notice',
      'See the real completed notice used in the sample pack.'
    ),
    buildProofPreview(
      'section13_standard',
      'section13_justification_report',
      'Justification report',
      'Comparable evidence',
      'Shows the market-rent support and adjustments behind the increase.'
    ),
  ],
  section13_defensive: [
    buildProofPreview(
      'section13_defensive',
      'section13_form_4a',
      'Form 4A notice',
      'Official notice',
      'See the real completed notice used in the defensive sample pack.'
    ),
    buildProofPreview(
      'section13_defensive',
      'section13_tribunal_argument_summary',
      'Tribunal argument summary',
      'Defensive output',
      'Shows how the defensive pack turns your facts into a hearing-ready position.'
    ),
  ],
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
    proofCards: PROOF_CARD_COPY[product] || [],
    proofPreviews: PROOF_PREVIEW_COPY[product] || [],
  };
}
