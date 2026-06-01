import { CLAIM_CONFIGS_BY_ID } from '@/lib/claims/config';
import {
  EVIDENCE_INDEX_FOOTER,
  buildGenericEvidenceIndexRows,
  getVisibleEvidenceItems,
} from '@/lib/claims/evidence';
import type {
  ClaimEvidenceCategory,
  ClaimTypeConfig,
  ClaimTypeId,
  ClaimWizardAnswers,
} from '@/lib/claims/types';
import {
  getGenericClaimLegalRules,
  type GenericClaimLegalRules,
} from '@/lib/claims/legal-rules';
import { calculateMoneyClaimFee } from '@/lib/court-fees/hmcts-fees';
import { generateDocument } from '@/lib/documents/generator';
import { assertOfficialFormExists, fillN1Form, type CaseData } from '@/lib/documents/official-forms-filler';

export type GenericClaimDocument = {
  title: string;
  description?: string;
  document_type: string;
  html?: string;
  pdf?: Buffer;
  file_name: string;
};

export type GenericClaimPack = {
  case_id: string;
  jurisdiction: 'england';
  pack_type: 'generic_small_claim_pack';
  generated_at: string;
  documents: GenericClaimDocument[];
  metadata: {
    brand: 'Claims by Landlord Heaven';
    total_documents: number;
    includes_official_pdf: boolean;
    total_claim_amount: number;
    court_fee: number;
    total_with_fees: number;
  };
};

type GenericClaimLineItem = {
  description: string;
  amount: number;
};

type GenericClaimCase = {
  brand_name: 'Claims by Landlord Heaven';
  case_id: string;
  generation_date: string;
  signature_date: string;
  jurisdiction: 'england';
  claim_category: ClaimTypeId;
  claim_label: string;
  claimant_name: string;
  claimant_address: string;
  claimant_postcode: string;
  claimant_email?: string;
  claimant_phone?: string;
  defendant_name: string;
  defendant_address: string;
  defendant_postcode: string;
  defendant_email?: string;
  claim_summary: string;
  category_context: string;
  pre_action_summary: string;
  pre_action_sent_date?: string;
  response_deadline?: string;
  preferred_filing_route?: string;
  line_items: GenericClaimLineItem[];
  total_claim_amount: number;
  court_fee: number;
  solicitor_costs: number;
  total_with_fees: number;
  claim_interest: boolean;
  interest_rate: number | null;
  interest_start_date?: string;
  daily_interest: number | null;
  interest_to_date: number | null;
  evidence_rows: Array<{ id: string; label: string; description: string }>;
  evidence_footer: string;
  visible_evidence_items: ClaimEvidenceCategory[];
  legal_rules: GenericClaimLegalRules;
  category_facts: Array<{ label: string; value: string }>;
  required_element_checks: Array<{ element: string; captured: boolean }>;
  official_forms: string[];
  particulars_of_claim: string;
  n1_brief_details: string;
  signatory_name: string;
};

const BRAND_NAME = 'Claims by Landlord Heaven' as const;
const TEMPLATE_BASE = 'uk/england/templates/claims';

const GENERIC_CLAIM_DOCUMENTS = [
  {
    document_type: 'generic_letter_before_claim',
    title: 'Letter Before Claim',
    file_name: '01-letter-before-claim.pdf',
    template: 'letter_before_claim.hbs',
    description: 'Pre-action letter setting out the claim, amount, and response deadline.',
  },
  {
    document_type: 'generic_particulars_of_claim',
    title: 'Particulars of Claim',
    file_name: '02-particulars-of-claim.pdf',
    template: 'particulars_of_claim.hbs',
    description: 'Structured particulars for the small claim.',
  },
  {
    document_type: 'generic_schedule_of_loss',
    title: 'Schedule of Loss',
    file_name: '03-schedule-of-loss.pdf',
    template: 'schedule_of_loss.hbs',
    description: 'Money breakdown based on the user-entered line items.',
  },
  {
    document_type: 'generic_evidence_index',
    title: 'Evidence Index',
    file_name: '04-evidence-index.pdf',
    template: 'evidence_index.hbs',
    description: 'Index of selected evidence and what each item shows.',
  },
  {
    document_type: 'generic_filing_guide',
    title: 'Filing Guide',
    file_name: '05-filing-guide.pdf',
    template: 'filing_guide.hbs',
    description: 'Step-by-step filing guidance for the user.',
  },
  {
    document_type: 'generic_service_guide',
    title: 'Service Guide',
    file_name: '06-service-guide.pdf',
    template: 'service_guide.hbs',
    description: 'Guidance on sending documents and keeping proof.',
  },
  {
    document_type: 'generic_hearing_preparation',
    title: 'Hearing Preparation',
    file_name: '07-hearing-preparation.pdf',
    template: 'hearing_preparation.hbs',
    description: 'Practical hearing preparation checklist.',
  },
  {
    document_type: 'generic_enforcement_guide',
    title: 'Enforcement Guide',
    file_name: '08-enforcement-guide.pdf',
    template: 'enforcement_guide.hbs',
    description: 'Post-judgment enforcement options.',
  },
] as const;

const GENERIC_INTEREST_DOCUMENT = {
  document_type: 'generic_interest_calculation',
  title: 'Interest Calculation',
  file_name: '09-interest-calculation.pdf',
  template: 'interest_calculation.hbs',
  description: 'Interest review sheet for claims where the user wants interest considered.',
} as const;

const GENERIC_N1_DOCUMENT = {
  document_type: 'n1_claim',
  title: 'Form N1 (official PDF)',
  file_name: '10-n1-claim-form.pdf',
  description: 'Completed official N1 claim form for England County Court money claims.',
} as const;

function getFact(facts: Record<string, any>, path: string): unknown {
  if (Object.prototype.hasOwnProperty.call(facts, path)) {
    return facts[path];
  }

  return path.split('.').reduce<unknown>((cursor, part) => {
    if (!cursor || typeof cursor !== 'object') return undefined;
    return (cursor as Record<string, unknown>)[part];
  }, facts);
}

function textFact(facts: Record<string, any>, path: string, fallback = ''): string {
  const value = getFact(facts, path);
  if (typeof value === 'number') return String(value);
  return typeof value === 'string' ? value.trim() : fallback;
}

function booleanFact(facts: Record<string, any>, path: string): boolean {
  return getFact(facts, path) === true;
}

function stringArrayFact(facts: Record<string, any>, path: string): string[] {
  const value = getFact(facts, path);
  return Array.isArray(value) && value.every((item) => typeof item === 'string') ? value : [];
}

function recordFact(facts: Record<string, any>, path: string): Record<string, string> {
  const value = getFact(facts, path);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, string>;
}

function moneyFact(facts: Record<string, any>, path: string): number {
  const value = getFact(facts, path);
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const normalized = value.replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function roundMoney(value: number): number {
  return Number(value.toFixed(2));
}

function formatUKLegalDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/London',
  }).format(date);
}

function extractPostcode(address: string): string {
  const match = address.toUpperCase().match(/\b([A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})\b/);
  return match?.[1]?.replace(/\s+/, ' ').trim() ?? '';
}

function formatFilingRoute(value: string): string | undefined {
  if (value === 'online_if_suitable') return 'Online if suitable';
  if (value === 'paper_n1') return 'Paper Form N1';
  if (value === 'not_sure') return 'Not sure yet';
  return value.trim() || undefined;
}

function resolveClaimConfig(facts: Record<string, any>): ClaimTypeConfig {
  const claimCategory =
    textFact(facts, 'claim_category') ||
    textFact(facts, 'generic_claim.category') ||
    textFact(facts, '__meta.claim_category');
  const config = CLAIM_CONFIGS_BY_ID[claimCategory as ClaimTypeId];

  if (!config || config.flowMode !== 'generic_small_claim') {
    throw new Error('Generic small-claim pack requested without a generic claim category');
  }

  return config;
}

function factsToClaimAnswers(facts: Record<string, any>): ClaimWizardAnswers {
  return facts as ClaimWizardAnswers;
}

function buildEvidenceRows(config: ClaimTypeConfig, facts: Record<string, any>) {
  const selectedIds = stringArrayFact(facts, 'generic_claim.evidence_items');
  const descriptions = recordFact(facts, 'generic_claim.evidence_descriptions');
  const visibleItems = getVisibleEvidenceItems(
    config.evidenceCategories,
    factsToClaimAnswers(facts)
  ).map((state) => state.item);

  return buildGenericEvidenceIndexRows({
    visibleItems,
    selectedIds,
    descriptions,
  });
}

function parseLineItems(facts: Record<string, any>): GenericClaimLineItem[] {
  const raw = getFact(facts, 'generic_claim.line_items');

  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const record = item as Record<string, unknown>;
        const description = String(record.description ?? record.label ?? '').trim();
        const amount = Number(record.amount ?? 0);
        return description && Number.isFinite(amount) ? { description, amount } : null;
      })
      .filter((item): item is GenericClaimLineItem => Boolean(item));
  }

  const text = typeof raw === 'string' ? raw : '';
  return text
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const amountMatch = line.match(/(£?\s*\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*$/);
      const amount = amountMatch ? Number(amountMatch[1].replace(/[^0-9.-]/g, '')) : 0;
      const description = amountMatch
        ? line.slice(0, amountMatch.index).replace(/[-:–—,/\s]+$/, '').trim()
        : line;
      return {
        description: description || line,
        amount: Number.isFinite(amount) ? amount : 0,
      };
    });
}

function flattenGenericFacts(facts: Record<string, any>): Array<{ label: string; value: string }> {
  const excluded = new Set([
    'category',
    'flow_mode',
    'value_estimate',
    'summary',
    'line_items',
    'pre_action',
    'interest',
    'evidence_items',
    'evidence_descriptions',
    'readiness_confirmed',
    'results_next_action',
  ]);
  const genericClaim = getFact(facts, 'generic_claim');
  const entries: Array<[string, unknown]> = [];

  if (genericClaim && typeof genericClaim === 'object' && !Array.isArray(genericClaim)) {
    for (const [key, value] of Object.entries(genericClaim)) {
      if (!excluded.has(key)) entries.push([key, value]);
    }
  }

  for (const [key, value] of Object.entries(facts)) {
    if (key.startsWith('generic_claim.') && !excluded.has(key.replace('generic_claim.', ''))) {
      entries.push([key.replace('generic_claim.', ''), value]);
    }
  }

  return entries
    .filter(([, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'object') return Object.keys(value).length > 0;
      return String(value).trim().length > 0;
    })
    .map(([key, value]) => ({
      label: key
        .split('.')
        .at(-1)!
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      value: Array.isArray(value)
        ? value.join(', ')
        : typeof value === 'object'
          ? Object.entries(value as Record<string, unknown>)
              .map(([nestedKey, nestedValue]) => `${nestedKey.replace(/_/g, ' ')}: ${String(nestedValue)}`)
              .join('; ')
          : String(value),
    }))
    .slice(0, 36);
}

function buildGenericClaimCase(config: ClaimTypeConfig, facts: Record<string, any>): GenericClaimCase {
  const lineItems = parseLineItems(facts);
  const valueEstimate = moneyFact(facts, 'generic_claim.value_estimate');
  const lineItemTotal = roundMoney(lineItems.reduce((total, item) => total + item.amount, 0));
  const totalClaimAmount = lineItemTotal > 0 ? lineItemTotal : valueEstimate;
  const courtFee = calculateMoneyClaimFee(totalClaimAmount);
  const claimInterest = booleanFact(facts, 'generic_claim.interest');
  const interestRate = claimInterest ? 8 : null;
  const dailyInterest = claimInterest ? roundMoney((totalClaimAmount * 0.08) / 365) : null;
  const legalRules = getGenericClaimLegalRules(config.id);
  if (!legalRules) {
    throw new Error(`Missing generic legal rules for claim category: ${config.id}`);
  }
  const claimantAddress = textFact(facts, 'claimant.address');
  const defendantAddress = textFact(facts, 'defendant.address');
  const claimSummary = textFact(facts, 'generic_claim.summary');
  const categoryContext = textFact(facts, 'generic_claim.category_context');
  const preActionSummary = textFact(facts, 'generic_claim.pre_action');
  const preActionSentDate = formatUKLegalDate(textFact(facts, 'generic_claim.key_dates.pre_action_sent_date')) || undefined;
  const responseDeadline = formatUKLegalDate(textFact(facts, 'generic_claim.key_dates.response_deadline')) || undefined;
  const interestStartDate = formatUKLegalDate(textFact(facts, 'generic_claim.key_dates.interest_start_date')) || undefined;
  const preferredFilingRoute = formatFilingRoute(textFact(facts, 'generic_claim.preferred_filing_route'));
  const evidenceRows = buildEvidenceRows(config, facts);
  const particulars = [
    `${textFact(facts, 'claimant.name', 'The Claimant')} claims against ${textFact(facts, 'defendant.name', 'the Defendant')} for ${config.label.toLowerCase()}.`,
    claimSummary,
    `The sum claimed is £${totalClaimAmount.toFixed(2)} plus the court fee and any interest the court allows.`,
    'Full particulars are attached.',
  ].filter(Boolean).join('\n\n');

  return {
    brand_name: BRAND_NAME,
    case_id: textFact(facts, 'case_id') || `CLAIMS-${Date.now()}`,
    generation_date: formatUKLegalDate(new Date()),
    signature_date: formatUKLegalDate(new Date()),
    jurisdiction: 'england',
    claim_category: config.id,
    claim_label: config.label,
    claimant_name: textFact(facts, 'claimant.name', 'Claimant'),
    claimant_address: claimantAddress,
    claimant_postcode: textFact(facts, 'claimant.postcode') || extractPostcode(claimantAddress),
    claimant_email: textFact(facts, 'claimant.email') || undefined,
    claimant_phone: textFact(facts, 'claimant.phone') || undefined,
    defendant_name: textFact(facts, 'defendant.name', 'Defendant'),
    defendant_address: defendantAddress,
    defendant_postcode: textFact(facts, 'defendant.postcode') || extractPostcode(defendantAddress),
    defendant_email: textFact(facts, 'defendant.email') || undefined,
    claim_summary: claimSummary,
    category_context: categoryContext,
    pre_action_summary: preActionSummary,
    pre_action_sent_date: preActionSentDate,
    response_deadline: responseDeadline,
    preferred_filing_route: preferredFilingRoute,
    line_items: lineItems.length > 0 ? lineItems : [{ description: 'Claim value estimate', amount: totalClaimAmount }],
    total_claim_amount: totalClaimAmount,
    court_fee: courtFee,
    solicitor_costs: 0,
    total_with_fees: roundMoney(totalClaimAmount + courtFee),
    claim_interest: claimInterest,
    interest_rate: interestRate,
    interest_start_date: interestStartDate,
    daily_interest: dailyInterest,
    interest_to_date: null,
    evidence_rows: evidenceRows,
    evidence_footer: EVIDENCE_INDEX_FOOTER,
    visible_evidence_items: getVisibleEvidenceItems(
      config.evidenceCategories,
      factsToClaimAnswers(facts)
    ).map((state) => state.item),
    legal_rules: legalRules,
    category_facts: flattenGenericFacts(facts),
    required_element_checks: legalRules.required_elements.map((element) => ({
      element,
      captured: true,
    })),
    official_forms: legalRules.official_forms,
    particulars_of_claim: particulars,
    n1_brief_details: `${config.label}. Particulars of Claim attached.`,
    signatory_name: textFact(facts, 'claimant.name', 'Claimant'),
  };
}

function buildGenericN1Payload(claim: GenericClaimCase): CaseData {
  return {
    jurisdiction: 'england',
    landlord_full_name: claim.claimant_name,
    landlord_address: claim.claimant_address,
    landlord_postcode: claim.claimant_postcode,
    landlord_email: claim.claimant_email,
    landlord_phone: claim.claimant_phone,
    tenant_full_name: claim.defendant_name,
    property_address: claim.defendant_address,
    property_postcode: claim.defendant_postcode,
    tenancy_start_date: '',
    rent_amount: 0,
    rent_frequency: 'monthly',
    particulars_of_claim: claim.particulars_of_claim,
    total_claim_amount: claim.total_claim_amount,
    court_fee: claim.court_fee,
    solicitor_costs: claim.solicitor_costs,
    claimant_reference: claim.case_id,
    signatory_name: claim.signatory_name,
    signature_date: new Date().toISOString().split('T')[0],
    service_address_line1: claim.claimant_address,
    service_postcode: claim.claimant_postcode,
    service_phone: claim.claimant_phone,
    service_email: claim.claimant_email,
  };
}

export function isGenericSmallClaimFacts(facts: Record<string, any> | null | undefined): boolean {
  if (!facts) return false;
  return (
    facts.claim_flow_mode === 'generic_small_claim' ||
    facts.__meta?.claim_flow_mode === 'generic_small_claim' ||
    facts.__meta?.generic_claim_pack === true ||
    facts.generic_claim?.flow_mode === 'generic_small_claim'
  );
}

export function getGenericSmallClaimPackContents() {
  return [
    ...GENERIC_CLAIM_DOCUMENTS.map((doc) => ({
      key: doc.document_type,
      title: doc.title,
      description: doc.description,
      category: doc.document_type === 'generic_evidence_index' || doc.document_type === 'generic_schedule_of_loss'
        ? 'Evidence' as const
        : doc.document_type === 'generic_particulars_of_claim'
          ? 'Court forms' as const
          : 'Guidance' as const,
      required: true,
    })),
    {
      key: GENERIC_INTEREST_DOCUMENT.document_type,
      title: GENERIC_INTEREST_DOCUMENT.title,
      description: GENERIC_INTEREST_DOCUMENT.description,
      category: 'Guidance' as const,
      required: false,
    },
    {
      key: GENERIC_N1_DOCUMENT.document_type,
      title: GENERIC_N1_DOCUMENT.title,
      description: GENERIC_N1_DOCUMENT.description,
      category: 'Court forms' as const,
      required: true,
    },
  ];
}

export async function generateGenericSmallClaimPack(facts: Record<string, any>): Promise<GenericClaimPack> {
  const config = resolveClaimConfig(facts);
  const claim = buildGenericClaimCase(config, facts);
  const documents: GenericClaimDocument[] = [];

  for (const doc of GENERIC_CLAIM_DOCUMENTS) {
    const rendered = await generateDocument({
      templatePath: `${TEMPLATE_BASE}/${doc.template}`,
      data: claim,
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: doc.title,
      description: doc.description,
      document_type: doc.document_type,
      html: rendered.html,
      pdf: rendered.pdf,
      file_name: doc.file_name,
    });
  }

  if (claim.claim_interest) {
    const rendered = await generateDocument({
      templatePath: `${TEMPLATE_BASE}/${GENERIC_INTEREST_DOCUMENT.template}`,
      data: claim,
      isPreview: false,
      outputFormat: 'both',
    });

    documents.push({
      title: GENERIC_INTEREST_DOCUMENT.title,
      description: GENERIC_INTEREST_DOCUMENT.description,
      document_type: GENERIC_INTEREST_DOCUMENT.document_type,
      html: rendered.html,
      pdf: rendered.pdf,
      file_name: GENERIC_INTEREST_DOCUMENT.file_name,
    });
  }

  await assertOfficialFormExists('N1_1224.pdf');
  const n1Pdf = await fillN1Form(buildGenericN1Payload(claim));

  documents.push({
    title: GENERIC_N1_DOCUMENT.title,
    description: GENERIC_N1_DOCUMENT.description,
    document_type: GENERIC_N1_DOCUMENT.document_type,
    pdf: Buffer.from(n1Pdf),
    file_name: GENERIC_N1_DOCUMENT.file_name,
  });

  return {
    case_id: claim.case_id,
    jurisdiction: 'england',
    pack_type: 'generic_small_claim_pack',
    generated_at: new Date().toISOString(),
    documents,
    metadata: {
      brand: BRAND_NAME,
      total_documents: documents.length,
      includes_official_pdf: true,
      total_claim_amount: claim.total_claim_amount,
      court_fee: claim.court_fee,
      total_with_fees: claim.total_with_fees,
    },
  };
}
