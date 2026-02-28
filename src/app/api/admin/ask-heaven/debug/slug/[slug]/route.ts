import { NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server';
import { isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let supabaseUrlHost: string | null = null;
  if (supabaseUrl) {
    try {
      supabaseUrlHost = new URL(supabaseUrl).host;
    } catch {
      supabaseUrlHost = null;
    }
  }
  const hasUrl = Boolean(supabaseUrl);
  const hasServiceRoleKey = Boolean(serviceRoleKey);

  const user = await requireServerAuth();
  if (!isAdmin(user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        slug: params.slug,
        supabaseUrlHost,
        hasUrl,
        hasServiceRoleKey,
        status: 500,
        responseText: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
      },
      { status: 500 }
    );
  }

  const requestUrl = `${supabaseUrl}/rest/v1/ask_heaven_questions?select=id,slug,status&slug=eq.${encodeURIComponent(params.slug)}`;
  const response = await fetch(requestUrl, {
    cache: 'no-store',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });
  const responseText = await response.text();

  return NextResponse.json(
    {
      slug: params.slug,
      supabaseUrlHost,
      hasUrl,
      hasServiceRoleKey,
      status: response.status,
      responseText,
    },
    { status: 200 }
  );
}
