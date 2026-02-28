/**
 * Auth API - Callback
 *
 * GET /api/auth/callback
 * Handles email confirmation and OAuth redirects
 *
 * For email confirmation, redirects to client-side /auth/confirm page
 * which handles session setup more robustly.
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/dashboard';

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);

      // For PKCE errors, redirect to client-side confirm page which can
      // handle the error more gracefully and guide the user
      if (error.message.includes('PKCE') || error.message.includes('code verifier')) {
        // Pass the code to the client page in case it can still be used
        // (e.g., if the client has the verifier in localStorage)
        return NextResponse.redirect(
          `${requestUrl.origin}/auth/confirm?code=${code}&error=pkce`
        );
      }

      // For other errors, redirect to the confirm page with error info
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/confirm?error=${encodeURIComponent(error.message)}`
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${requestUrl.origin}${next}`);
}
