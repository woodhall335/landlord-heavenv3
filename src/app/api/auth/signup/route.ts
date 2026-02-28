/**
 * Auth API - Signup
 *
 * POST /api/auth/signup
 * Creates a new user account with Supabase Auth
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendWelcomeEmail } from '@/lib/email/resend';
import { logger } from '@/lib/logger';
import { rateLimiters } from '@/lib/rate-limit';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 requests per minute for auth)
    const rateLimitResult = await rateLimiters.auth(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)),
          },
        }
      );
    }
    const body = await request.json();

    // Validate input
    const validationResult = signupSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password, full_name, phone } = validationResult.data;

    const supabase = await createServerSupabaseClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || null,
          phone: phone || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm`,
      },
    });

    if (authError) {
      logger.error('Signup auth error', { error: authError.message });
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile in public.users table using service role
    // This bypasses RLS which can fail during signup flow
    const profileResult = await ensureUserProfileExists({
      userId: authData.user.id,
      email: authData.user.email!,
      fullName: full_name || null,
      phone: phone || null,
    });

    if (!profileResult.success) {
      logger.error('Profile creation error', { error: profileResult.error });
      // This is now a critical error - user profile is required for checkout
      // But don't fail signup as auth user was created successfully
      // The profile will be created on next login or checkout attempt
    } else if (profileResult.created) {
      logger.info('User profile created during signup', { userId: authData.user.id });
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        to: authData.user.email!,
        name: full_name || authData.user.email!.split('@')[0],
      });
      logger.info('Welcome email sent', { email: authData.user.email });
    } catch (emailError: any) {
      logger.error('Failed to send welcome email', { error: emailError?.message });
      // Don't fail signup if email fails
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
        },
        message: 'Account created successfully. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    logger.error('Signup error', { error: error?.message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
