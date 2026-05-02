import { PRODUCTS } from '@/lib/pricing/products';

export type AdminCasesPreset =
  | 'all'
  | 'needs_attention'
  | 'paid_awaiting_docs'
  | 'edit_window_open'
  | 'docs_ready';

export type AdminCasesSortBy = 'newest' | 'oldest' | 'updated' | 'risk';

export interface AdminCaseRecord {
  case_id: string;
  order_id: string | null;
  user_id: string | null;
  user_email: string;
  user_name: string | null;
  case_type: string;
  jurisdiction: string;
  status: string;
  wizard_progress: number;
  product_type: string | null;
  product_name: string | null;
  payment_status: string | null;
  fulfillment_status: string | null;
  has_final_documents: boolean;
  final_document_count: number;
  edit_window_open: boolean;
  edit_window_ends_at: string | null;
  created_at: string;
  updated_at: string;
  requires_action: boolean;
  failed_fulfillment: boolean;
  documents_ready: boolean;
  can_retry_fulfillment: boolean;
  can_resume_fulfillment: boolean;
  can_regenerate: boolean;
  can_reopen_edit_window: boolean;
}

export interface AdminCasesStats {
  total: number;
  paid_or_generated: number;
  requires_action: number;
  failed_fulfillment: number;
  edit_window_open: number;
  docs_ready: number;
}

export const ADMIN_CASE_PRODUCT_NAMES: Record<string, string> = {
  notice_only: 'Eviction Notice Generator',
  complete_pack: 'Complete Eviction Pack',
  money_claim: 'Money Claim Pack',
  sc_money_claim: 'Simple Procedure Pack (Scotland)',
  ast_standard: PRODUCTS.ast_standard.label,
  ast_premium: PRODUCTS.ast_premium.label,
  england_standard_tenancy_agreement: PRODUCTS.england_standard_tenancy_agreement.label,
  england_premium_tenancy_agreement: PRODUCTS.england_premium_tenancy_agreement.label,
  england_student_tenancy_agreement: PRODUCTS.england_student_tenancy_agreement.label,
  england_hmo_shared_house_tenancy_agreement:
    PRODUCTS.england_hmo_shared_house_tenancy_agreement.label,
  england_lodger_agreement: PRODUCTS.england_lodger_agreement.label,
  section13_standard: 'Standard Section 13 Rent Increase Pack',
  section13_defensive: 'Challenge-Ready Section 13 Defence Pack',
};

export function getAdminCaseTypeLabel(caseType: string): string {
  const labels: Record<string, string> = {
    eviction: 'Eviction',
    money_claim: 'Money Claim',
    tenancy_agreement: 'Tenancy Agreement',
    rent_increase: 'Rent Increase',
  };
  return labels[caseType] || caseType;
}

export function getAdminJurisdictionLabel(jurisdiction: string): string {
  const labels: Record<string, string> = {
    england: 'England',
    wales: 'Wales',
    scotland: 'Scotland',
    'northern-ireland': 'Northern Ireland',
    'england-wales': 'England & Wales',
  };
  return labels[jurisdiction] || jurisdiction;
}

export function getAdminProductName(productType: string | null): string {
  if (!productType) return 'Unknown';
  return ADMIN_CASE_PRODUCT_NAMES[productType] || productType;
}

export function buildAdminCaseEditHref(caseItem: Pick<AdminCaseRecord, 'case_id' | 'case_type' | 'jurisdiction' | 'product_type'>): string {
  const params = new URLSearchParams({
    type: caseItem.case_type,
    jurisdiction: caseItem.jurisdiction,
    case_id: caseItem.case_id,
    mode: 'edit',
  });

  if (caseItem.product_type) {
    params.set('product', caseItem.product_type);
  }

  return `/wizard/flow?${params.toString()}`;
}

export function getAdminCaseRiskRank(caseItem: Pick<AdminCaseRecord, 'requires_action' | 'failed_fulfillment' | 'payment_status' | 'has_final_documents' | 'documents_ready'>): number {
  if (caseItem.requires_action) return 0;
  if (caseItem.failed_fulfillment) return 1;
  if (caseItem.payment_status === 'paid' && !caseItem.has_final_documents) return 2;
  if (caseItem.documents_ready) return 4;
  return 3;
}
