import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  AskHeavenNoRowsUpdatedError,
  createSupabaseAdminQuestionRepository,
} from '@/lib/ask-heaven/questions';
import { runAskHeavenParityCheck } from '@/lib/ask-heaven/admin-parity';
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

    const repository = createSupabaseAdminQuestionRepository();
    let question = null;
    let repoError: unknown;
    setStep('repo.getBySlug');
    try {
      question = await repository.getBySlug(params.slug);
    } catch (error) {
      repoError = error;
    }

    if (!question) {
      const adminClient = createSupabaseAdminClient();
      const supabaseUrl = process.env.SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      const parity = await runAskHeavenParityCheck({
        slug: params.slug,
        adminClient,
        supabaseUrl,
        serviceRoleKey,
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
