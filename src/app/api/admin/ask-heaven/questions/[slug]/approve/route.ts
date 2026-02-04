import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import {
  AskHeavenNoRowsUpdatedError,
  createSupabaseAdminQuestionRepository,
} from '@/lib/ask-heaven/questions';
import { getSupabaseAdminEnvStatus } from '@/lib/supabase/admin';

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const debug = { env: getSupabaseAdminEnvStatus(), slug: params.slug };

  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized', debug }, { status: 403 });
    }

    const repository = createSupabaseAdminQuestionRepository();
    const existing = await repository.getBySlug(params.slug);

    if (!existing) {
      return NextResponse.json({ error: 'Not found', debug }, { status: 404 });
    }
    const updated = await repository.approve(params.slug);

    return NextResponse.json({ question: updated }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven approve error:', error);
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
