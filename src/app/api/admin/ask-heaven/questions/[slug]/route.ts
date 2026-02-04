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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = {
    env: getSupabaseAdminEnvStatus(),
    fingerprint: getSupabaseAdminFingerprint(),
    slug: params.slug,
  };

  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const repository = createSupabaseAdminQuestionRepository();
    const adminClient = createSupabaseAdminClient();
    const keyPrefix = serviceRoleKey?.slice(0, 8) ?? null;
    const jwtPreview = getSupabaseAdminJwtPreview();
    const slugBytes = {
      length: params.slug.length,
      hex: Buffer.from(params.slug).toString('hex'),
    };
    const authHeaderPreview = serviceRoleKey
      ? {
          apikeyPrefix: keyPrefix,
          authorizationPrefix: `Bearer ${keyPrefix}`,
        }
      : null;
    const directSupabaseJs = await adminClient
      .from('ask_heaven_questions')
      .select('id,slug,status')
      .eq('slug', params.slug)
      .maybeSingle();
    const directSupabaseJsResult = {
      found: Boolean(directSupabaseJs.data),
      data: directSupabaseJs.data ?? undefined,
      error: directSupabaseJs.error?.message ?? undefined,
    };
    let directRestFetchResult:
      | {
          status: number | 'error';
          textPreview: string;
          jsonPreview?: unknown;
        }
      | undefined;

    if (supabaseUrl && serviceRoleKey) {
      const restUrl = `${supabaseUrl}/rest/v1/ask_heaven_questions?select=id,slug,status&slug=eq.${encodeURIComponent(params.slug)}`;
      try {
        const restResponse = await fetch(restUrl, {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        });
        const responseText = await restResponse.text();
        let jsonPreview: unknown;
        try {
          const parsed = JSON.parse(responseText);
          jsonPreview = Array.isArray(parsed) ? parsed.slice(0, 5) : parsed;
        } catch {
          jsonPreview = undefined;
        }
        directRestFetchResult = {
          status: restResponse.status,
          textPreview: responseText.slice(0, 200),
          jsonPreview,
        };
      } catch (restError) {
        directRestFetchResult = {
          status: 'error',
          textPreview:
            restError instanceof Error ? restError.message : String(restError),
        };
      }
    }

    const restFound =
      directRestFetchResult?.jsonPreview &&
      Array.isArray(directRestFetchResult.jsonPreview)
        ? directRestFetchResult.jsonPreview.length > 0
        : false;
    if (!directSupabaseJs.data && !restFound && jwtPreview?.role !== 'service_role') {
      return NextResponse.json(
        {
          error: 'Invalid service role key',
          debug: {
            ...debug,
            jwtPreview,
            env: getSupabaseAdminEnvStatus(),
          },
        },
        { status: 500 }
      );
    }

    const question = await repository.getBySlug(params.slug);

    if (!question) {
      const { count, error: countError } = await adminClient
        .from('ask_heaven_questions')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        return NextResponse.json(
          { error: countError.message, debug },
          { status: 500 }
        );
      }

      const { data: sample, error: sampleError } = await adminClient
        .from('ask_heaven_questions')
        .select('slug')
        .order('created_at', { ascending: false })
        .limit(3);

      if (sampleError) {
        return NextResponse.json(
          { error: sampleError.message, debug },
          { status: 500 }
        );
      }

      let ilikeCandidates: Array<{ id: string; slug: string; status: string }> =
        [];
      if (!directSupabaseJs.data) {
        const { data: ilikeData } = await adminClient
          .from('ask_heaven_questions')
          .select('id,slug,status')
          .ilike('slug', params.slug)
          .limit(5);
        ilikeCandidates = ilikeData ?? [];
      }

      const fingerprint = getSupabaseAdminFingerprint();

      return NextResponse.json(
        {
          error: 'Not found',
          debug: {
            slug: params.slug,
            supabaseUrlHost: fingerprint.supabaseUrlHost,
            serviceRoleKeyPrefix: fingerprint.serviceRoleKeyPrefix,
            fingerprint,
            visibleCount: count ?? 0,
            sampleSlugs: (sample ?? []).map((row) => row.slug),
            slugBytes,
            directSupabaseJs: directSupabaseJsResult,
            directRestFetch: directRestFetchResult,
            authHeaders: authHeaderPreview,
            jwtPreview,
            ilikeCandidates,
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        question,
        debug: {
          slug: params.slug,
          env: getSupabaseAdminEnvStatus(),
          fingerprint: getSupabaseAdminFingerprint(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Admin Ask Heaven get error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Missing SUPABASE_')) {
      return NextResponse.json({ error: error.message, debug }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal server error', debug },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = { env: getSupabaseAdminEnvStatus(), slug: params.slug };

  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }

    const payload = (await request.json()) as {
      question?: string;
      summary?: string;
      answer_md?: string;
      primary_topic?: string;
      jurisdictions?: string[];
      related_slugs?: string[];
    };

    const repository = createSupabaseAdminQuestionRepository();
    const existing = await repository.getBySlug(params.slug);

    if (!existing) {
      return NextResponse.json({ error: 'Not found', debug }, { status: 404 });
    }

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
      return NextResponse.json({ error: error.message, debug }, { status: 500 });
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Missing SUPABASE_')) {
      return NextResponse.json({ error: error.message, debug }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Internal server error', debug },
      { status: 500 }
    );
  }
}
