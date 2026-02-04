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
} from '@/lib/supabase/admin';

export const runtime = 'nodejs';

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

    const repository = createSupabaseAdminQuestionRepository();
    const adminClient = createSupabaseAdminClient();
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
