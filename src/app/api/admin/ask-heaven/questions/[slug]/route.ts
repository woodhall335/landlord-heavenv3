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
} from '@/lib/supabase/admin';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = { env: getSupabaseAdminEnvStatus(), slug: params.slug };

  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();
    const { data, error, count } = await admin
      .from('ask_heaven_questions')
      .select('id,slug', { count: 'exact' })
      .eq('slug', params.slug);

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          debug: { slug: params.slug, env: getSupabaseAdminEnvStatus() },
        },
        { status: 500 }
      );
    }

    const matchedCount = count ?? data?.length ?? 0;
    if (matchedCount === 0) {
      return NextResponse.json(
        {
          error: 'Not found',
          debug: { slug: params.slug, count, env: getSupabaseAdminEnvStatus() },
        },
        { status: 404 }
      );
    }

    const repository = createSupabaseAdminQuestionRepository();
    const question = await repository.getBySlug(params.slug);

    if (!question) {
      return NextResponse.json({ error: 'Not found', debug }, { status: 404 });
    }

    return NextResponse.json(
      {
        question,
        debug: {
          slug: params.slug,
          count,
          env: getSupabaseAdminEnvStatus(),
          row: data?.[0],
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
