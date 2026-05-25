import { NextRequest, NextResponse } from 'next/server';

import {
  RECOVERY_UNSUBSCRIBED_EVENT,
  verifyRecoveryUnsubscribeToken,
} from '@/lib/recovery/unsubscribe';
import { createAdminClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function htmlResponse(title: string, message: string, status = 200): NextResponse {
  return new NextResponse(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; font-family: Arial, sans-serif; background: #f3f4f6; color: #111827; }
      main { min-height: 100vh; display: grid; place-items: center; padding: 24px; }
      section { max-width: 560px; background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 32px; box-shadow: 0 12px 30px rgba(17, 24, 39, 0.08); }
      h1 { margin: 0 0 12px; font-size: 28px; line-height: 1.2; }
      p { margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6; }
      a { color: #4f46e5; }
    </style>
  </head>
  <body>
    <main>
      <section>
        <h1>${title}</h1>
        <p>${message}</p>
      </section>
    </main>
  </body>
</html>`,
    {
      status,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    }
  );
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const verified = verifyRecoveryUnsubscribeToken(token);

  if (!verified) {
    return htmlResponse(
      'Link expired or invalid',
      'We could not confirm this recovery email unsubscribe link. Please contact support if reminders continue.',
      400
    );
  }

  const source = request.nextUrl.searchParams.get('source') || 'recovery';
  const supabase = createAdminClient();
  const { error } = await supabase.from('email_events').insert({
    email: verified.email,
    event_type: RECOVERY_UNSUBSCRIBED_EVENT,
    event_data: {
      source: 'recovery_unsubscribe_link',
      requested_source: source,
      unsubscribed_at: new Date().toISOString(),
      user_agent: request.headers.get('user-agent'),
    },
  });

  if (error) {
    console.error('[recovery/unsubscribe] failed to record unsubscribe', error);
    return htmlResponse(
      'Something went wrong',
      'We could not save your unsubscribe request. Please contact support if reminders continue.',
      500
    );
  }

  return htmlResponse(
    'Recovery reminders stopped',
    'You will no longer receive saved checkout, draft, or wizard reminder emails from Landlord Heaven at this email address.'
  );
}
