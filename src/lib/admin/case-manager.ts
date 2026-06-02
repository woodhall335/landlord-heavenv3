import { getAdminProductLabel } from '@/lib/admin/products';

export type AdminCasesPreset =
  | 'all'
  | 'needs_attention'
  | 'paid_awaiting_docs'
  | 'started_drafts'
  | 'preview_abandoned'
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
  workflow_status: string | null;
  wizard_progress: number;
  wizard_completed_at: string | null;
  product_type: string | null;
  product_name: string | null;
  payment_status: string | null;
  has_any_order: boolean;
  fulfillment_status: string | null;
  has_final_documents: boolean;
  final_document_count: number;
  preview_document_count: number;
  edit_window_open: boolean;
  edit_window_ends_at: string | null;
  created_at: string;
  updated_at: string;
  requires_action: boolean;
  failed_fulfillment: boolean;
  documents_ready: boolean;
  is_preview_abandoned: boolean;
  is_started_draft: boolean;
  is_anonymous_started: boolean;
  recovery_email: string | null;
  recovery_last_event_type: string | null;
  recovery_last_event_at: string | null;
  recovery_last_stage: 'manual' | 'day_1' | 'day_7' | null;
  recovery_last_error: string | null;
  recovery_manual_sent_at: string | null;
  recovery_day_1_sent_at: string | null;
  recovery_day_7_sent_at: string | null;
  can_send_restart_link: boolean;
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
  started_drafts: number;
  unpaid_started: number;
  anonymous_started: number;
  preview_abandoned: number;
  edit_window_open: number;
  docs_ready: number;
}

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
  return getAdminProductLabel(productType);
}

export function isAdminStartedDraftCase(caseItem: {
  status: string | null;
  payment_status: string | null;
  has_any_order: boolean;
  has_final_documents: boolean;
  wizard_progress: number | null;
  wizard_completed_at?: string | null;
}): boolean {
  if (caseItem.status === 'archived') return false;
  if (caseItem.payment_status === 'paid') return false;
  if (caseItem.has_any_order) return false;
  if (caseItem.has_final_documents) return false;

  return (
    caseItem.status === 'in_progress' ||
    Boolean(caseItem.wizard_completed_at) ||
    Number(caseItem.wizard_progress || 0) > 0
  );
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
