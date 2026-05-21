import crypto from 'crypto';

import { isValidProductSku, type ProductSku } from '../pricing/products';

export type CaseRecoveryStage = 'manual' | 'day_1' | 'day_3' | 'day_7';

export const CASE_PREVIEW_RECOVERY_SENT_EVENT_TYPES = {
  manual: 'case_preview_recovery_manual_sent',
  day_1: 'case_preview_recovery_day_1_sent',
  day_7: 'case_preview_recovery_day_7_sent',
} as const satisfies Record<Extract<CaseRecoveryStage, 'manual' | 'day_1' | 'day_7'>, string>;

export const CASE_PREVIEW_RECOVERY_FAILED_EVENT_TYPES = {
  manual: 'case_preview_recovery_manual_failed',
  day_1: 'case_preview_recovery_day_1_failed',
  day_7: 'case_preview_recovery_day_7_failed',
} as const satisfies Record<Extract<CaseRecoveryStage, 'manual' | 'day_1' | 'day_7'>, string>;

export const CASE_WIZARD_RECOVERY_SENT_EVENT_TYPES = {
  day_1: 'case_wizard_recovery_day_1_sent',
  day_3: 'case_wizard_recovery_day_3_sent',
} as const satisfies Record<Extract<CaseRecoveryStage, 'day_1' | 'day_3'>, string>;

export const CASE_WIZARD_RECOVERY_FAILED_EVENT_TYPES = {
  day_1: 'case_wizard_recovery_day_1_failed',
  day_3: 'case_wizard_recovery_day_3_failed',
} as const satisfies Record<Extract<CaseRecoveryStage, 'day_1' | 'day_3'>, string>;

type CaseLike = {
  id: string;
  case_type: string;
  jurisdiction: string;
  status?: string | null;
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
  const meta = caseItem.collected_facts?.__meta || {};
  return Boolean(
    caseItem.status === 'completed' ||
      caseItem.wizard_completed_at ||
      (caseItem.wizard_progress || 0) >= 100 ||
      workflowStatus === 'preview_ready' ||
      workflowStatus === 'awaiting_payment' ||
      firstString(meta.preview_reached_at, meta.preview_viewed_at, meta.preview_last_viewed_at)
  );
}

function isPresent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined && value !== false;
}

function hasItems(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0;
}

function getProductFromCaseFacts(caseItem: CaseLike): string | null {
  return deriveCaseProductType(caseItem, null);
}

function hasCommonLandlordTenantPropertyTenancyFacts(facts: Record<string, any>): boolean {
  return (
    isPresent(facts.landlord_full_name || facts.parties?.landlord?.name) &&
    isPresent(facts.tenant_full_name || facts.parties?.tenants?.[0]?.name || facts.tenants?.[0]?.full_name) &&
    isPresent(facts.property_address_line1 || facts.property?.address_line1) &&
    isPresent(facts.property_address_postcode || facts.property?.postcode) &&
    isPresent(facts.tenancy_start_date || facts.tenancy?.start_date) &&
    isPresent(facts.rent_amount || facts.tenancy?.rent_amount)
  );
}

function getEvictionRoute(facts: Record<string, any>): string | null {
  return firstString(
    facts.selected_notice_route,
    facts.eviction_route,
    facts.route_recommendation?.recommended_route,
    facts.recommended_route
  );
}

function hasHistoricalEvictionReviewReadyFacts(caseItem: CaseLike): boolean {
  const facts = caseItem.collected_facts || {};
  const product = getProductFromCaseFacts(caseItem);
  const jurisdiction = caseItem.jurisdiction || facts.__meta?.jurisdiction;
  const route = getEvictionRoute(facts);

  if (!hasCommonLandlordTenantPropertyTenancyFacts(facts) || !route) return false;

  if (jurisdiction === 'england') {
    const selectedGrounds = facts.section8_grounds || facts.selected_grounds || [];
    const noticeReady =
      facts.notice_already_served === false
        ? hasItems(selectedGrounds)
        : isPresent(facts.notice_served_date) && isPresent(facts.notice_service_method);
    if (!noticeReady) return false;

    if (product === 'complete_pack') {
      return (
        isPresent(facts.evidence_reviewed || facts.evidence_bundle_ready) &&
        isPresent(facts.court_name) &&
        isPresent(facts.signatory_name) &&
        isPresent(facts.signatory_capacity)
      );
    }

    return true;
  }

  if (jurisdiction === 'wales') {
    if (route === 'section_173' || route === 'wales_section_173') {
      return (
        facts.user_declaration === true &&
        isPresent(facts.rent_smart_wales_registered) &&
        isPresent(facts.written_statement_provided)
      );
    }

    if (route === 'fault_based' || route === 'wales_fault_based') {
      return facts.user_declaration === true && hasItems(facts.wales_fault_grounds);
    }
  }

  if (jurisdiction === 'scotland') {
    const tribunalReady =
      product !== 'complete_pack' ||
      (isPresent(facts.understands_tribunal_process) &&
        isPresent(facts.signatory_name) &&
        isPresent(facts.signatory_capacity));
    return isPresent(facts.scotland_eviction_ground) && isPresent(facts.notice_service_method) && tribunalReady;
  }

  return false;
}

function hasHistoricalMoneyClaimReviewReadyFacts(caseItem: CaseLike): boolean {
  const facts = caseItem.collected_facts || {};
  const jurisdiction = caseItem.jurisdiction || facts.__meta?.jurisdiction;
  const hasClaimType =
    facts.claiming_rent_arrears === true ||
    facts.claiming_damages === true ||
    facts.claiming_other === true;
  const hasClaimDetails =
    jurisdiction === 'england' || jurisdiction === 'wales'
      ? hasClaimType && isPresent(facts.money_claim?.court_name || facts.court_name)
      : hasClaimType;
  const hasClaimStatement =
    isPresent(facts.money_claim?.basis_of_claim) &&
    (jurisdiction !== 'england' && jurisdiction !== 'wales'
      ? true
      : facts.money_claim?.charge_interest === true || facts.money_claim?.charge_interest === false);
  const hasPreAction =
    isPresent(facts.letter_before_claim_sent) ||
    isPresent(facts.pap_letter_date) ||
    isPresent(facts.money_claim?.generate_pap_documents);
  const hasEvidence =
    isPresent(facts.evidence_reviewed) ||
    hasItems(facts.uploaded_documents) ||
    hasItems(facts.evidence?.files) ||
    hasItems(facts.money_claim?.evidence_types_available);

  return (
    isPresent(facts.landlord_full_name || facts.company_name) &&
    isPresent(facts.landlord_address_line1) &&
    isPresent(facts.landlord_address_postcode) &&
    isPresent(facts.tenant_full_name) &&
    isPresent(facts.defendant_address_line1 || facts.property_address_line1) &&
    isPresent(facts.tenancy_start_date) &&
    isPresent(facts.rent_amount) &&
    isPresent(facts.rent_frequency) &&
    hasClaimDetails &&
    hasClaimStatement &&
    hasPreAction &&
    hasEvidence
  );
}

function hasHistoricalTenancyReviewReadyFacts(caseItem: CaseLike): boolean {
  const facts = caseItem.collected_facts || {};
  const tenants = facts.tenants || facts.parties?.tenants || [];

  return (
    isPresent(facts.product_tier || facts.__meta?.product) &&
    isPresent(facts.property_address_line1) &&
    isPresent(facts.property_address_town) &&
    isPresent(facts.property_address_postcode) &&
    isPresent(facts.landlord_full_name) &&
    isPresent(facts.landlord_email) &&
    isPresent(facts.landlord_address_line1) &&
    isPresent(facts.landlord_address_postcode) &&
    hasItems(tenants) &&
    isPresent(tenants[0]?.full_name || tenants[0]?.name) &&
    isPresent(facts.tenancy_start_date) &&
    isPresent(facts.rent_amount) &&
    isPresent(facts.rent_due_day) &&
    facts.deposit_amount !== null &&
    facts.deposit_amount !== undefined
  );
}

export function getHistoricalPreviewBackfillReason(caseItem: CaseLike): string | null {
  if (isCasePreviewReached(caseItem)) return 'already_preview_marked';

  const facts = caseItem.collected_facts || {};
  const meta = facts.__meta || {};
  if (firstString(meta.review_reached_at, meta.review_viewed_at, meta.review_last_viewed_at)) {
    return 'review_meta';
  }

  if (caseItem.case_type === 'eviction' && hasHistoricalEvictionReviewReadyFacts(caseItem)) {
    return 'eviction_review_ready_facts';
  }

  if (caseItem.case_type === 'money_claim' && hasHistoricalMoneyClaimReviewReadyFacts(caseItem)) {
    return 'money_claim_review_ready_facts';
  }

  if (caseItem.case_type === 'tenancy_agreement' && hasHistoricalTenancyReviewReadyFacts(caseItem)) {
    return 'tenancy_review_ready_facts';
  }

  return null;
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

function hasMeaningfulStartedFacts(facts: Record<string, any>): boolean {
  const ignoredKeys = new Set(['__meta', 'jurisdiction', 'property_country', 'selected_notice_route', 'eviction_route']);
  return Object.entries(facts).some(([key, value]) => {
    if (ignoredKeys.has(key)) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return Number.isFinite(value);
    if (typeof value === 'boolean') return true;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  });
}

export function isStartedButIncompleteCase(params: {
  caseItem: CaseLike;
  order?: OrderLike;
  hasFinalDocuments: boolean;
  hasPreviewDocuments?: boolean;
}): boolean {
  if (params.hasFinalDocuments) return false;
  if (params.hasPreviewDocuments) return false;
  if (params.order?.payment_status === 'paid') return false;
  if (isCasePreviewReached(params.caseItem)) return false;
  if (params.caseItem.status === 'completed' || params.caseItem.wizard_completed_at) return false;
  if ((params.caseItem.wizard_progress || 0) >= 100) return false;
  return hasMeaningfulStartedFacts(params.caseItem.collected_facts || {});
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
