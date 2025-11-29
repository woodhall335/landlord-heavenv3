/**
 * Password Reset API - Send Password Reset Email
 *
 * POST /api/auth/forgot-password - Send password reset link to user's email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
  try {
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
