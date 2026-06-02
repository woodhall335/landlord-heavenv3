import { PRODUCTS, type ProductSku } from '@/lib/pricing/products';
import { EvidenceCategory, EVIDENCE_CATEGORY_LABELS } from '@/lib/evidence/schema';

export type AssistedPrepService = 'section8' | 'money_claim' | 'possession';
export type AssistedPrepSku =
  | 'section8_assisted_prep'
  | 'money_claim_assisted_prep'
  | 'possession_claim_assisted_prep';

export type AssistedPrepStatus =
  | 'callback_pending'
  | 'callback_booked'
  | 'in_review'
  | 'blocked_refund_due'
  | 'pack_prepared'
  | 'sent_to_customer'
  | 'completed';

export const ASSISTED_PREP_STATUSES: AssistedPrepStatus[] = [
  'callback_pending',
  'callback_booked',
  'in_review',
  'blocked_refund_due',
  'pack_prepared',
  'sent_to_customer',
  'completed',
];

export function isAssistedPrepStatus(value: string | null | undefined): value is AssistedPrepStatus {
  return Boolean(value && (ASSISTED_PREP_STATUSES as string[]).includes(value));
}

export type AssistedPrepConfig = {
  service: AssistedPrepService;
  sku: AssistedPrepSku;
  caseType: 'eviction' | 'money_claim';
  label: string;
  shortLabel: string;
  priceLabel: string;
  duration: string;
  route: string;
  startHref: string;
  callbackHeadline: string;
  primaryCta: string;
  checklist: string[];
  finalChecklistNote: string;
};

export type AssistedEvidenceUploadSlot = {
  key: string;
  label: string;
  helperText: string;
  category: EvidenceCategory;
  questionId: string;
  services: AssistedPrepService[];
};

export type AssistedEvidenceFileSummary = {
  id: string;
  documentId?: string | null;
  fileName: string;
  category?: string | null;
  uploadedAt?: string | null;
};

export type AssistedEvidenceSummary = {
  uploaded_evidence_count: number;
  uploaded_evidence: AssistedEvidenceFileSummary[];
  missing_recommended_evidence: AssistedEvidenceUploadSlot[];
  latest_upload_at: string | null;
};

export const ASSISTED_PREP_CHECKLIST_INTRO =
  "To make the most of your callback, please gather these items (if you have them). Don't worry if something is missing - we'll work with what you have.";

export const ASSISTED_PREP_PROMISE =
  'Prepared for you. Checked with you. Approved and sent by you.';

export const ASSISTED_PREP_CONFIGS: Record<AssistedPrepService, AssistedPrepConfig> = {
  section8: {
    service: 'section8',
    sku: 'section8_assisted_prep',
    caseType: 'eviction',
    label: PRODUCTS.section8_assisted_prep.label,
    shortLabel: PRODUCTS.section8_assisted_prep.shortLabel,
    priceLabel: PRODUCTS.section8_assisted_prep.displayPrice,
    duration: '20-minute callback',
    route: '/section-8-notice-assisted-prep',
    startHref: '/assisted-prep/start?service=section8',
    callbackHeadline: 'Want us to prepare the Section 8 notice with you?',
    primaryCta: 'Book Section 8 assisted prep',
    checklist: [
      'Tenancy agreement (if available)',
      'Full names of all tenants',
      'Rental property address',
      "Tenant's current address (if different from the property)",
      "Rent amount and how often it's paid (e.g. GBP 900 pcm)",
      'Reason for seeking possession (e.g. rent arrears, breach, antisocial behaviour, sale)',
      'Rent statement or arrears ledger (if ground 8, 10, or 11)',
      'Any notice already served (e.g. a Section 8 notice - even if incomplete or out of date)',
      'Any proof of service (e.g. certificate of service, photo, receipt)',
      'Key correspondence with the tenant (e.g. warning letters, emails, texts)',
      'Deposit protection certificate and prescribed information (if relevant to your ground)',
      'Any gas safety, EPC, or How to Rent guide (if needed for the ground)',
    ],
    finalChecklistNote: "If you don't have something, that's fine - we'll discuss what we can do during the call.",
  },
  money_claim: {
    service: 'money_claim',
    sku: 'money_claim_assisted_prep',
    caseType: 'money_claim',
    label: PRODUCTS.money_claim_assisted_prep.label,
    shortLabel: PRODUCTS.money_claim_assisted_prep.shortLabel,
    priceLabel: PRODUCTS.money_claim_assisted_prep.displayPrice,
    duration: '30-minute callback',
    route: '/money-claim-assisted-prep',
    startHref: '/assisted-prep/start?service=money_claim',
    callbackHeadline: 'Want us to prepare the money claim with you?',
    primaryCta: 'Book money claim assisted prep',
    checklist: [
      'Tenancy agreement (if the debt relates to a tenancy)',
      'Full name and last known address of the tenant/debtor',
      'Amount claimed (exact figure)',
      'Rent ledger or debt breakdown (dates and amounts owed)',
      'Any invoices, receipts, or photos supporting the claim',
      'Any letter before claim already sent (with proof of postage or delivery)',
      'Any response from the tenant (e.g. promise to pay, dispute, silence)',
      "Tenant's current or forwarding address (if known)",
      'Any relevant correspondence (emails, texts, letters about the debt)',
    ],
    finalChecklistNote: "If you haven't sent a letter before claim, we'll help you draft one during or after the call.",
  },
  possession: {
    service: 'possession',
    sku: 'possession_claim_assisted_prep',
    caseType: 'eviction',
    label: PRODUCTS.possession_claim_assisted_prep.label,
    shortLabel: PRODUCTS.possession_claim_assisted_prep.shortLabel,
    priceLabel: PRODUCTS.possession_claim_assisted_prep.displayPrice,
    duration: '45-minute callback',
    route: '/possession-claim-assisted-prep',
    startHref: '/assisted-prep/start?service=possession',
    callbackHeadline: 'Want us to prepare the possession claim pack with you?',
    primaryCta: 'Book possession claim assisted prep',
    checklist: [
      'Tenancy agreement',
      'Full names of all tenants and any known guarantors',
      'Rental property address',
      'The notice you have already served (Section 8 or other) - upload a copy if possible',
      'Proof of service of that notice (e.g. certificate of service, photo, tracking, witness statement)',
      'Notice expiry date',
      'Rent schedule or arrears ledger (if possession is based on arrears)',
      'Any evidence bundle you have started (photos, correspondence, witness statements)',
      'Any tenant response or dispute (e.g. counterclaim, defence, complaint)',
      'Any court correspondence if you have already started a claim',
    ],
    finalChecklistNote: "If you haven't served a notice yet, we'll discuss the correct notice and timeline during the call.",
  },
};

export const ASSISTED_PREP_SERVICES = Object.values(ASSISTED_PREP_CONFIGS);

export const ASSISTED_PREP_SKUS = ASSISTED_PREP_SERVICES.map((service) => service.sku) as AssistedPrepSku[];

export const ASSISTED_EVIDENCE_UPLOAD_SLOTS: AssistedEvidenceUploadSlot[] = [
  {
    key: 'tenancy_agreement',
    label: EVIDENCE_CATEGORY_LABELS[EvidenceCategory.TENANCY_AGREEMENT],
    helperText: 'The signed tenancy agreement, if you have it.',
    category: EvidenceCategory.TENANCY_AGREEMENT,
    questionId: 'assisted_prep_tenancy_agreement',
    services: ['section8', 'money_claim', 'possession'],
  },
  {
    key: 'rent_records',
    label: 'Rent statement or arrears ledger',
    helperText: 'Rent statement, arrears ledger, or debt breakdown.',
    category: EvidenceCategory.ARREARS_LEDGER,
    questionId: 'assisted_prep_rent_records',
    services: ['section8', 'money_claim', 'possession'],
  },
  {
    key: 'served_notice',
    label: 'Notice already served',
    helperText: 'Any Section 8 notice or other notice already given to the tenant.',
    category: EvidenceCategory.NOTICE_S8,
    questionId: 'assisted_prep_served_notice',
    services: ['section8', 'possession'],
  },
  {
    key: 'proof_of_service',
    label: 'Proof of service',
    helperText: 'Certificate of service, proof of postage, photo, email proof, or delivery record.',
    category: EvidenceCategory.NOTICE_SERVED_PROOF,
    questionId: 'assisted_prep_proof_of_service',
    services: ['section8', 'possession'],
  },
  {
    key: 'correspondence',
    label: EVIDENCE_CATEGORY_LABELS[EvidenceCategory.CORRESPONDENCE],
    helperText: 'Important emails, letters, texts, complaints, warnings, or tenant replies.',
    category: EvidenceCategory.CORRESPONDENCE,
    questionId: 'assisted_prep_correspondence',
    services: ['section8', 'money_claim', 'possession'],
  },
  {
    key: 'letter_before_claim',
    label: EVIDENCE_CATEGORY_LABELS[EvidenceCategory.LBA_LETTER],
    helperText: 'The letter before claim and proof it was sent.',
    category: EvidenceCategory.LBA_LETTER,
    questionId: 'assisted_prep_letter_before_claim',
    services: ['money_claim'],
  },
  {
    key: 'photos_or_invoices',
    label: 'Photos, invoices, or receipts',
    helperText: 'Photos, invoices, receipts, estimates, or other proof of the amount claimed.',
    category: EvidenceCategory.OTHER,
    questionId: 'assisted_prep_photos_invoices',
    services: ['money_claim', 'possession'],
  },
  {
    key: 'compliance_documents',
    label: 'Deposit or property compliance documents',
    helperText: 'Deposit protection, prescribed information, EPC, gas safety, or How to Rent records.',
    category: EvidenceCategory.DEPOSIT_PROTECTION,
    questionId: 'assisted_prep_compliance_documents',
    services: ['section8', 'possession'],
  },
  {
    key: 'other_documents',
    label: EVIDENCE_CATEGORY_LABELS[EvidenceCategory.OTHER],
    helperText: 'Anything else you think helps explain the case.',
    category: EvidenceCategory.OTHER,
    questionId: 'assisted_prep_other_documents',
    services: ['section8', 'money_claim', 'possession'],
  },
];

export function isAssistedPrepSku(value: string | null | undefined): value is AssistedPrepSku {
  return Boolean(value && (ASSISTED_PREP_SKUS as string[]).includes(value));
}

export function getAssistedPrepConfig(service: AssistedPrepService): AssistedPrepConfig {
  return ASSISTED_PREP_CONFIGS[service];
}

export function getAssistedEvidenceUploadSlots(service: AssistedPrepService): AssistedEvidenceUploadSlot[] {
  return ASSISTED_EVIDENCE_UPLOAD_SLOTS.filter((slot) => slot.services.includes(service));
}

export function getAssistedPrepConfigBySku(sku: string | null | undefined): AssistedPrepConfig | null {
  if (!isAssistedPrepSku(sku)) return null;
  return ASSISTED_PREP_SERVICES.find((service) => service.sku === sku) || null;
}

export function getAssistedPrepServiceFromSku(sku: string | null | undefined): AssistedPrepService | null {
  return getAssistedPrepConfigBySku(sku)?.service || null;
}

export function isAssistedPrepProductSku(sku: ProductSku | string | null | undefined): sku is AssistedPrepSku {
  return isAssistedPrepSku(sku);
}

export function getAssistedPrepFulfillmentProduct(sku: string | null | undefined): ProductSku | null {
  if (sku === 'section8_assisted_prep') return 'notice_only';
  if (sku === 'money_claim_assisted_prep') return 'money_claim';
  if (sku === 'possession_claim_assisted_prep') return 'complete_pack';
  return null;
}

export function normalizeAssistedPrepService(value: string | null | undefined): AssistedPrepService {
  if (value === 'money_claim') return 'money_claim';
  if (value === 'possession') return 'possession';
  return 'section8';
}

export function assistedServiceForProduct(product: string | null | undefined): AssistedPrepService | null {
  if (product === 'money_claim') return 'money_claim';
  if (product === 'complete_pack') return 'possession';
  if (product === 'notice_only') return 'section8';
  return null;
}

export function normalizeAssistedEvidenceFile(value: unknown): AssistedEvidenceFileSummary | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, any>;
  const id = typeof file.id === 'string' ? file.id : '';
  const documentId = typeof file.document_id === 'string' ? file.document_id : null;
  const fileName =
    typeof file.file_name === 'string'
      ? file.file_name
      : typeof file.filename === 'string'
        ? file.filename
        : typeof file.name === 'string'
          ? file.name
          : 'Uploaded document';

  if (!id && !documentId) return null;

  return {
    id: id || documentId || fileName,
    documentId,
    fileName,
    category: typeof file.category === 'string' ? file.category : null,
    uploadedAt: typeof file.uploaded_at === 'string' ? file.uploaded_at : typeof file.created_at === 'string' ? file.created_at : null,
  };
}

export function buildAssistedEvidenceSummary(params: {
  service: AssistedPrepService;
  evidence?: Record<string, any> | null;
}): AssistedEvidenceSummary {
  const files = Array.isArray(params.evidence?.files)
    ? params.evidence.files
        .map((file) => normalizeAssistedEvidenceFile(file))
        .filter((file): file is AssistedEvidenceFileSummary => Boolean(file))
    : [];
  const slots = getAssistedEvidenceUploadSlots(params.service);
  const uploadedCategories = new Set(files.map((file) => file.category).filter(Boolean));
  const missing = slots.filter((slot) => !uploadedCategories.has(slot.category));
  const latest = files
    .map((file) => file.uploadedAt)
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;

  return {
    uploaded_evidence_count: files.length,
    uploaded_evidence: files,
    missing_recommended_evidence: missing,
    latest_upload_at: latest,
  };
}

export function buildAssistedPrepStartHref(params: {
  service: AssistedPrepService;
  caseId?: string | null;
  product?: string | null;
  caseType?: string | null;
  src?: string | null;
  step?: string | null;
}): string {
  const query = new URLSearchParams({ service: params.service });
  if (params.caseId) query.set('case_id', params.caseId);
  if (params.product) query.set('product', params.product);
  if (params.caseType) query.set('case_type', params.caseType);
  if (params.src) query.set('src', params.src);
  if (params.step) query.set('step', params.step);
  return `/assisted-prep/start?${query.toString()}`;
}

export function buildAssistedPrepSuccessHref(params: {
  service: AssistedPrepService;
  caseId?: string | null;
  orderId?: string | null;
}): string {
  const query = new URLSearchParams({ service: params.service });
  if (params.caseId) query.set('case_id', params.caseId);
  if (params.orderId) query.set('order_id', params.orderId);
  return `/assisted-prep/success?${query.toString()}`;
}
