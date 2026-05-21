import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { getAdminProductLabel } from '@/lib/admin/products';
import {
  buildCaseRecoveryUrl,
  createCaseRecoveryToken,
  deriveCaseProductType,
  getSiteBaseUrl,
  type CaseRecoveryStage,
} from '@/lib/cases/recovery';

type RecoveryCaseRow = {
  id: string;
  case_type: string;
  jurisdiction: string;
  collected_facts?: Record<string, any> | null;
};

type RecoveryOrderRow = {
  product_type?: string | null;
} | null;

export async function createCaseRecoveryLink(params: {
  supabase: SupabaseClient<any>;
  caseRow: RecoveryCaseRow;
  email: string;
  orderRow?: RecoveryOrderRow;
  stage: CaseRecoveryStage;
  source: string;
  kind?: 'case_preview_recovery' | 'case_wizard_recovery';
  expiresInDays?: number;
}): Promise<{ resumeUrl: string; productType: string | null; productName: string }> {
  const {
    supabase,
    caseRow,
    email,
    orderRow = null,
    stage,
    source,
    kind = 'case_preview_recovery',
    expiresInDays = 14,
  } = params;
  const { token, tokenHash } = createCaseRecoveryToken();
  const productType = deriveCaseProductType(caseRow, orderRow);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const tokenPayload = {
    case_id: caseRow.id,
    email,
    token_hash: tokenHash,
    expires_at: expiresAt,
    metadata: {
      kind,
      stage,
      source,
      product_type: productType,
      case_type: caseRow.case_type,
      jurisdiction: caseRow.jurisdiction,
    },
  };

  const insertResult = await supabase.from('case_recovery_tokens').insert(tokenPayload as any);

  if (insertResult.error) {
    const metadataColumnMissing =
      insertResult.error.code === 'PGRST204' ||
      /metadata/i.test(insertResult.error.message || '');

    if (!metadataColumnMissing) {
      throw new Error(`Failed to store recovery token: ${insertResult.error.message}`);
    }

    const legacyPayload = { ...tokenPayload } as Record<string, unknown>;
    delete legacyPayload.metadata;

    const retryResult = await supabase.from('case_recovery_tokens').insert(legacyPayload as any);

    if (retryResult.error) {
      throw new Error(`Failed to store recovery token: ${retryResult.error.message}`);
    }
  }

  return {
    resumeUrl: buildCaseRecoveryUrl({
      baseUrl: getSiteBaseUrl(),
      caseId: caseRow.id,
      caseType: caseRow.case_type,
      jurisdiction: caseRow.jurisdiction,
      productType,
      token,
    }),
    productType,
    productName: getAdminProductLabel(productType),
  };
}
