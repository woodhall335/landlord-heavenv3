import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { createSupabaseAdminQuestionRepository } from '@/lib/ask-heaven/questions';

export async function GET(request: Request) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const repository = createSupabaseAdminQuestionRepository();

    if (search && search.trim().length > 0) {
      const results = await repository.search(search.trim());
      return NextResponse.json({ questions: results }, { status: 200 });
    }

    if (status) {
      const results = await repository.listByStatus(status as any);
      return NextResponse.json({ questions: results }, { status: 200 });
    }

    const results = await repository.list();
    return NextResponse.json({ questions: results }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
