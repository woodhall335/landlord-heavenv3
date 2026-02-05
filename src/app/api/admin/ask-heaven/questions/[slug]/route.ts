import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  AskHeavenNoRowsUpdatedError,
  createSupabaseAdminQuestionRepository,
} from '@/lib/ask-heaven/questions';
import {
  createSupabaseAdminClient,
  getSupabaseAdminEnvStatus,
  getSupabaseAdminFingerprint,
  getSupabaseAdminJwtPreview,
} from '@/lib/supabase/admin';
import { serializeError } from '@/lib/errors/serializeError';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = {
    env: getSupabaseAdminEnvStatus(),
    fingerprint: getSupabaseAdminFingerprint(),
    jwtPreview: getSupabaseAdminJwtPreview(),
    slug: params.slug,
    step: 'init',
  };
  const setStep = (step: string) => {
    debug.step = step;
  };
  let isAdminUser = false;

  try {
    setStep('auth');
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    isAdminUser = true;

    // DEBUG: temporary parity check for repo vs direct admin client.
    const repository = createSupabaseAdminQuestionRepository();
    let repoRow = null;
    setStep('repo.getBySlug');
    try {
      const repoQuestion = await repository.getBySlug(params.slug);
      repoRow = repoQuestion
        ? {
            id: repoQuestion.id,
            slug: repoQuestion.slug,
            status: repoQuestion.status,
            canonical_slug: repoQuestion.canonical_slug,
          }
        : null;
    } catch {
      repoRow = null;
    }

    setStep('direct.getBySlug');
    const adminClient = createSupabaseAdminClient();
    const { data: directRow, error: directError } = await adminClient
      .from('ask_heaven_questions')
      .select('id,slug,status,canonical_slug')
      .eq('slug', params.slug)
      .maybeSingle();

    setStep('rest.fetch');
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    let restUrlUsed: string | null = null;
    let restUrlKnownGood: string | null = null;
    let restHeadersPreview: {
      hasApikey: boolean;
      hasAuthorization: boolean;
      authorizationPrefix: string | null;
    } | null = null;
    let restUsedStatus: number | null = null;
    let restUsedText: string | null = null;
    let restUsedJsonParsed: unknown | null = null;
    let restKnownGoodStatus: number | null = null;
    let restKnownGoodText: string | null = null;
    let restKnownGoodJsonParsed: unknown | null = null;

    if (supabaseUrl && serviceRoleKey) {
      const restHeaders = {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      };
      restHeadersPreview = {
        hasApikey: Boolean(restHeaders.apikey),
        hasAuthorization: Boolean(restHeaders.Authorization),
        authorizationPrefix: restHeaders.Authorization
          ? `Bearer ${serviceRoleKey.slice(0, 8)}...`
          : null,
      };
      restUrlUsed = `${supabaseUrl}/rest/v1/ask_heaven_questions?select=id,slug,status&slug=eq.${encodeURIComponent(
        params.slug
      )}`;
      let supabaseRef: string | null = null;
      try {
        const host = new URL(supabaseUrl).host;
        supabaseRef = host.split('.')[0] || null;
      } catch {
        supabaseRef = null;
      }
      if (supabaseRef) {
        restUrlKnownGood = `https://${supabaseRef}.supabase.co/rest/v1/ask_heaven_questions?select=id,slug,status,canonical_slug&slug=eq.${encodeURIComponent(
          params.slug
        )}`;
      }
      try {
        const restResponse = await fetch(restUrlUsed, {
          cache: 'no-store',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
        restUsedStatus = restResponse.status;
        const rawText = await restResponse.text();
        restUsedText = rawText.slice(0, 500);
        try {
          restUsedJsonParsed = JSON.parse(rawText);
        } catch {
          restUsedJsonParsed = null;
        }
      } catch (error) {
        restUsedText = error instanceof Error ? error.message : 'rest_fetch_failed';
      }

      if (restUrlKnownGood) {
        try {
          const restResponse = await fetch(restUrlKnownGood, {
            cache: 'no-store',
            headers: restHeaders,
          });
          restKnownGoodStatus = restResponse.status;
          const rawText = await restResponse.text();
          restKnownGoodText = rawText.slice(0, 500);
          try {
            restKnownGoodJsonParsed = JSON.parse(rawText);
          } catch {
            restKnownGoodJsonParsed = null;
          }
        } catch (error) {
          restKnownGoodText =
            error instanceof Error ? error.message : 'rest_fetch_failed';
        }
      }
    }

    console.info('[ask-heaven-slug-parity]', {
      slug: params.slug,
      repoHit: Boolean(repoRow),
      directHit: Boolean(directRow),
      directError: directError?.code,
    });

    const response = {
      repoRow,
      directRow,
      directError: directError?.message ?? null,
      slug: params.slug,
      fingerprint: getSupabaseAdminFingerprint(),
      env: getSupabaseAdminEnvStatus(),
      jwtPreview: getSupabaseAdminJwtPreview(),
      restUrlUsed,
      restUrlKnownGood,
      restHeadersPreview,
      restUsedStatus,
      restUsedText,
      restUsedJsonParsed,
      restKnownGoodStatus,
      restKnownGoodText,
      restKnownGoodJsonParsed,
    };

    if (repoRow || directRow) {
      return NextResponse.json(response, { status: 200 });
    }

    return NextResponse.json(
      {
        error: 'Not found',
        debug: response,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error('Admin Ask Heaven get error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Missing SUPABASE_')) {
      return NextResponse.json(
        {
          error: error.message,
          debug: isAdminUser ? debug : undefined,
          thrown: isAdminUser ? serializeError(error) : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: isAdminUser ? debug : undefined,
        thrown: isAdminUser ? serializeError(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = {
    env: getSupabaseAdminEnvStatus(),
    fingerprint: getSupabaseAdminFingerprint(),
    slug: params.slug,
    step: 'init',
  };
  const setStep = (step: string) => {
    debug.step = step;
  };
  let isAdminUser = false;

  try {
    setStep('auth');
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    isAdminUser = true;

    setStep('request.parse');
    const payload = (await request.json()) as {
      question?: string;
      summary?: string;
      answer_md?: string;
      primary_topic?: string;
      jurisdictions?: string[];
      related_slugs?: string[];
    };

    const repository = createSupabaseAdminQuestionRepository();
    setStep('repo.getBySlug');
    const existing = await repository.getBySlug(params.slug);

    if (!existing) {
      return NextResponse.json({ error: 'Not found', debug }, { status: 404 });
    }

    setStep('repo.update');
    const updated = await repository.update({
      id: existing.id,
      question: payload.question,
      summary: payload.summary,
      answer_md: payload.answer_md,
      primary_topic: payload.primary_topic as any,
      jurisdictions: payload.jurisdictions as any,
      related_slugs: payload.related_slugs,
    });

    return NextResponse.json({ question: updated }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven update error:', error);
    if (error instanceof AskHeavenNoRowsUpdatedError) {
      return NextResponse.json(
        {
          error: error.message,
          debug: isAdminUser ? debug : undefined,
          thrown: isAdminUser ? serializeError(error) : undefined,
        },
        { status: 500 }
      );
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Missing SUPABASE_')) {
      return NextResponse.json(
        {
          error: error.message,
          debug: isAdminUser ? debug : undefined,
          thrown: isAdminUser ? serializeError(error) : undefined,
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        error: 'Internal server error',
        debug: isAdminUser ? debug : undefined,
        thrown: isAdminUser ? serializeError(error) : undefined,
      },
      { status: 500 }
    );
  }
}
