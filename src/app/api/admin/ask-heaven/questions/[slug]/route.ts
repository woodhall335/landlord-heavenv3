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
