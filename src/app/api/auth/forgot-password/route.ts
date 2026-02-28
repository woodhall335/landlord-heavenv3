/**
 * Password Reset API - Send Password Reset Email
 *
 * POST /api/auth/forgot-password - Send password reset link to user's email
 * Rate limited to 5 requests per minute to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { rateLimiters } from '@/lib/rate-limit';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting to prevent email enumeration and spam
    const rateLimitResult = await rateLimiters.auth(request);
    if (!rateLimitResult.success) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: 'Please try again later',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      );
    }

    const body = await request.json();
    const validationResult = ForgotPasswordSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address', details: validationResult.error },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    const supabase = await createClient();

    // Send password reset email via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);

      // Don't reveal if email exists or not for security
      // Always return success message
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset link sent to your email. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
