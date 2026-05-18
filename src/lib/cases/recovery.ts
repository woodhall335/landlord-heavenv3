import crypto from 'crypto';

import { isValidProductSku, type ProductSku } from '@/lib/pricing/products';

export type CaseRecoveryStage = 'manual' | 'day_1' | 'day_7';

export const CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES = {
  manual: 'case_preview_recovery_manual_sent',
  day_1: 'case_preview_recovery_day_1_sent',
  day_7: 'case_preview_recovery_day_7_sent',
} as const satisfies Record<CaseRecoveryStage, string>;

export const CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES = {
  manual: 'case_preview_recovery_manual_failed',
  day_1: 'case_preview_recovery_day_1_failed',
  day_7: 'case_preview_recovery_day_7_failed',
} as const satisfies Record<CaseRecoveryStage, string>;

type CaseLike = {
  id: string;
  case_type: string;
  jurisdiction: string;
  wizard_progress?: number | null;
  wizard_completed_at?: string | null;
  workflow_status?: string | null;
  collected_facts?: Record<string, any> | null;
};

type OrderLike = {
  product_type?: string | null;
  payment_status?: string | null;
} | null;

type UserLike = {
  email?: string | null;
  full_name?: string | null;
} | null;

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

function getMetaProduct(facts: Record<string, any> | null | undefined): string | null {
  const meta = facts?.__meta || {};
  return firstString(
    meta.product,
    meta.canonical_product,
    meta.original_product,
    meta.mqs_product,
    facts?.product,
    facts?.product_type
  );
}

export function deriveCaseProductType(caseItem: CaseLike, order?: OrderLike): string | null {
  const orderProduct = firstString(order?.product_type);
  if (orderProduct) return orderProduct;

  const facts = caseItem.collected_facts || {};
  const section13Plan = firstString(facts.section13?.selectedPlan);
  if (section13Plan) return section13Plan;

  const metaProduct = getMetaProduct(facts);
  if (metaProduct) return metaProduct;

  if (caseItem.case_type === 'money_claim') return 'money_claim';
  if (caseItem.case_type === 'rent_increase') return 'section13_standard';
  return null;
}

export function deriveCaseRecoveryContact(caseItem: CaseLike, user?: UserLike): {
  email: string | null;
  name: string | null;
} {
  const facts = caseItem.collected_facts || {};
  const landlord = facts.section13?.landlord || facts.landlord || {};
  const partiesLandlord = facts.parties?.landlord || {};

  const email = firstString(
    user?.email,
    facts.landlord_email,
    facts.customer_email,
    facts.email,
    facts.contact_email,
    landlord.landlordEmail,
    landlord.email,
    partiesLandlord.email
  );

  const name = firstString(
    user?.full_name,
    facts.landlord_full_name,
    facts.landlord_name,
    facts.customer_name,
    facts.full_name,
    landlord.landlordName,
    landlord.name,
    partiesLandlord.name,
    partiesLandlord.full_name
  );

  return { email, name };
}

export function isCasePreviewReached(caseItem: CaseLike): boolean {
  const workflowStatus = caseItem.workflow_status || '';
  return Boolean(
    caseItem.wizard_completed_at ||
      (caseItem.wizard_progress || 0) >= 100 ||
      workflowStatus === 'preview_ready' ||
      workflowStatus === 'awaiting_payment'
  );
}

export function isPreviewAbandonedCase(params: {
  caseItem: CaseLike;
  order?: OrderLike;
  hasFinalDocuments: boolean;
  hasPreviewDocuments?: boolean;
}): boolean {
  if (params.hasFinalDocuments) return false;
  if (params.order?.payment_status === 'paid') return false;
  return Boolean(params.hasPreviewDocuments || isCasePreviewReached(params.caseItem));
}

export function createCaseRecoveryToken(): {
  token: string;
  tokenHash: string;
} {
  const token = crypto.randomBytes(24).toString('hex');
  return {
    token,
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
  };
}

export function hashCaseRecoveryToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function buildCaseRecoveryUrl(params: {
  baseUrl: string;
  caseId: string;
  caseType: string;
  jurisdiction: string;
  productType: string | null;
  token: string;
}): string {
  const url = new URL('/wizard/flow', params.baseUrl);
  url.searchParams.set('type', params.caseType);
  url.searchParams.set('jurisdiction', params.jurisdiction);
  url.searchParams.set('case_id', params.caseId);
  url.searchParams.set('recovery_token', params.token);

  if (params.productType && isValidProductSku(params.productType)) {
    url.searchParams.set('product', params.productType as ProductSku);
  }

  return url.toString();
}

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://landlordheaven.co.uk'
      : 'http://localhost:5000')
  );
}
