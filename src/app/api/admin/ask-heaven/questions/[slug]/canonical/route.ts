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

export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  console.info('Admin Ask Heaven canonical slug:', params.slug);
  const envStatus = getSupabaseAdminEnvStatus();
  const debug = {
    env: envStatus,
    fingerprint: getSupabaseAdminFingerprint(),
    slug: params.slug,
  };

  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }

    const payload = (await request.json()) as { canonical_slug?: string | null };

    const adminClient = createSupabaseAdminClient();
    const {
      data: canonicalRows,
      error: canonicalError,
      count,
    } = await adminClient
      .from('ask_heaven_questions')
      .select('id,slug', { count: 'exact' })
      .eq('slug', params.slug);

    if (canonicalError) {
      return NextResponse.json(
        { error: canonicalError.message, debug },
        { status: 500 }
      );
    }

    const canonicalCount = count ?? canonicalRows?.length ?? 0;
    if (canonicalCount === 0) {
      return NextResponse.json(
        {
          error: 'Not found',
          debug: {
            slug: params.slug,
            count: canonicalCount,
            env: envStatus,
            fingerprint: getSupabaseAdminFingerprint(),
          },
        },
        { status: 404 }
      );
    }

    const repository = createSupabaseAdminQuestionRepository();
    const updated = await repository.setCanonical(
      params.slug,
      payload.canonical_slug ?? null
    );

    return NextResponse.json({ question: updated }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven canonical error:', error);
    if (error instanceof AskHeavenNoRowsUpdatedError) {
      return NextResponse.json(
        {
          error: 'No rows updated — likely RLS or admin client not using service role',
          debug,
          thrown: serializeError(error),
        },
        { status: 500 }
      );
    }
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }
    if (error instanceof Error && error.message.startsWith('Missing SUPABASE_')) {
      return NextResponse.json(
        { error: error.message, debug, thrown: serializeError(error) },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error', debug, thrown: serializeError(error) },
      { status: 500 }
    );
  }
}
