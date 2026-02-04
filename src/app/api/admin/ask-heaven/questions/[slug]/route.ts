import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';
import { createSupabaseAdminQuestionRepository } from '@/lib/ask-heaven/questions';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const repository = createSupabaseAdminQuestionRepository();
    const question = await repository.getBySlug(params.slug);

    if (!question) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ question }, { status: 200 });
  } catch (error) {
    console.error('Admin Ask Heaven get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const user = await requireServerAuth();
    if (!isAdmin(user.id)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
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
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
