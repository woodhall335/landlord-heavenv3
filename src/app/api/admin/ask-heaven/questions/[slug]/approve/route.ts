import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { createSupabaseAdminQuestionRepository } from '@/lib/ask-heaven/questions';

export async function POST(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const repository = createSupabaseAdminQuestionRepository();
    const updated = await repository.approve(params.slug);

    return NextResponse.json({ question: updated }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven approve error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
