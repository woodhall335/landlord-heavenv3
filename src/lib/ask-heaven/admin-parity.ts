import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export type AskHeavenParityResult = {
  supabaseJs: {
    found: boolean;
    error?: string;
  };
  rest: {
    found: boolean;
    status: number | 'error' | 'missing_config' | 'invalid_url';
    error?: string;
  };
};

type ParityCheckOptions = {
  slug: string;
  adminClient: SupabaseClient<Database>;
  supabaseUrl?: string;
  serviceRoleKey?: string;
  fetchImpl?: typeof fetch;
  onStep?: (step: string) => void;
};

const MAX_ERROR_CHARS = 200;

const truncate = (value?: string | null) =>
  value ? value.slice(0, MAX_ERROR_CHARS) : undefined;

export function buildAskHeavenRestUrl(supabaseUrl: string, slug: string): string | null {
  try {
    const url = new URL('/rest/v1/ask_heaven_questions', supabaseUrl);
    url.searchParams.set('select', 'id,slug,status');
    url.searchParams.set('slug', `eq.${slug}`);
    return url.toString();
  } catch {
    return null;
  }
}

export async function runAskHeavenParityCheck({
  slug,
  adminClient,
  supabaseUrl,
  serviceRoleKey,
  fetchImpl = fetch,
  onStep,
}: ParityCheckOptions): Promise<AskHeavenParityResult> {
  onStep?.('parity.supabase_js');
  const supabaseResponse = await adminClient
    .from('ask_heaven_questions')
    .select('id,slug,status')
    .eq('slug', slug)
    .maybeSingle();

  const supabaseResult = {
    found: Boolean(supabaseResponse.data),
    error: truncate(supabaseResponse.error?.message),
  };

  if (!supabaseUrl || !serviceRoleKey) {
    return {
      supabaseJs: supabaseResult,
      rest: {
        found: false,
        status: 'missing_config',
        error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      },
    };
  }

  const restUrl = buildAskHeavenRestUrl(supabaseUrl, slug);
  if (!restUrl) {
    return {
      supabaseJs: supabaseResult,
      rest: {
        found: false,
        status: 'invalid_url',
        error: 'Invalid SUPABASE_URL',
      },
    };
  }

  onStep?.('parity.rest_fetch');
  try {
    const restResponse = await fetchImpl(restUrl, {
      cache: 'no-store',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    });
    const responseText = await restResponse.text();
    let restFound = false;
    let restError: string | undefined;

    try {
      const parsed = JSON.parse(responseText);
      if (Array.isArray(parsed)) {
        restFound = parsed.length > 0;
      } else if (parsed && typeof parsed === 'object' && 'message' in parsed) {
        restError = truncate(String((parsed as { message?: string }).message ?? ''));
      }
    } catch {
      if (!restResponse.ok) {
        restError = truncate(responseText);
      }
    }

    if (!restResponse.ok && !restError) {
      restError = truncate(responseText);
    }

    return {
      supabaseJs: supabaseResult,
      rest: {
        found: restFound,
        status: restResponse.status,
        error: restError,
      },
    };
  } catch (error) {
    return {
      supabaseJs: supabaseResult,
      rest: {
        found: false,
        status: 'error',
        error: truncate(error instanceof Error ? error.message : String(error)),
      },
    };
  }
}
