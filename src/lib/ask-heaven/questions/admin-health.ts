import 'server-only';

import { createSupabaseAdminClient, getSupabaseAdminEnvStatus } from '@/lib/supabase/admin';

const QUESTIONS_TABLE = 'ask_heaven_questions';

type AskHeavenAdminHealthResult =
  | {
      ok: true;
      env: { hasServiceRoleKey: boolean; hasUrl: boolean };
      testedId: string;
    }
  | {
      ok: false;
      env: { hasServiceRoleKey: boolean; hasUrl: boolean };
      message: string;
    };

/**
 * Internal health check for admin routes.
 *
 * NOTE: RLS allows SELECT only on ask_heaven_questions. UPDATE requires service role.
 * This performs a no-op update (canonical_slug -> same value) and will update updated_at
 * due to trigger. Use sparingly for debugging.
 */
export async function checkAskHeavenAdminHealth(): Promise<AskHeavenAdminHealthResult> {
  const env = getSupabaseAdminEnvStatus();
  const client = createSupabaseAdminClient();

  const { data: row, error: selectError } = await client
    .from(QUESTIONS_TABLE)
    .select('id, canonical_slug')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    return { ok: false, env, message: selectError.message };
  }

  if (!row) {
    return { ok: false, env, message: 'No rows available for admin health check.' };
  }

  const { data: updated, error: updateError } = await client
    .from(QUESTIONS_TABLE)
    .update({ canonical_slug: row.canonical_slug })
    .eq('id', row.id)
    .select('id')
    .maybeSingle();

  if (updateError) {
    return { ok: false, env, message: updateError.message };
  }

  if (!updated) {
    return {
      ok: false,
      env,
      message: 'No rows updated — likely RLS or slug not found',
    };
  }

  return { ok: true, env, testedId: row.id };
}
