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
import { runAskHeavenParityCheck } from '@/lib/ask-heaven/admin-parity';
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
    const payload = (await request.json()) as { canonical_slug?: string | null };

    const repository = createSupabaseAdminQuestionRepository();
    let existing = null;
    let repoError: unknown;
    setStep('repo.getBySlug');
    try {
      existing = await repository.getBySlug(params.slug);
    } catch (error) {
      repoError = error;
    }

    if (!existing) {
      const adminClient = createSupabaseAdminClient();
      const parity = await runAskHeavenParityCheck({
        slug: params.slug,
        adminClient,
        supabaseUrl: process.env.SUPABASE_URL,
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        onStep: setStep,
      });
      const parityMismatch = parity.rest.found && !parity.supabaseJs.found;

      if (parityMismatch) {
        return NextResponse.json(
          {
            error: 'Admin client parity failure: REST sees row, client does not',
            debug: {
              ...debug,
              parity,
              repoError: repoError ? serializeError(repoError) : undefined,
            },
          },
          { status: 500 }
        );
      }

      if (parity.rest.found || parity.supabaseJs.found) {
        return NextResponse.json(
          {
            error: 'Admin lookup failed to resolve slug',
            debug: {
              ...debug,
              parity,
              repoError: repoError ? serializeError(repoError) : undefined,
            },
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: 'Not found',
          debug: {
            ...debug,
            parity,
            repoError: repoError ? serializeError(repoError) : undefined,
          },
        },
        { status: 404 }
      );
    }

    setStep('repo.setCanonical');
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
