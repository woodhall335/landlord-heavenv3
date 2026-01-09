/**
 * Auth API - Login
 *
 * POST /api/auth/login
 * Authenticates user with email and password
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { rateLimiters } from '@/lib/rate-limit';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (5 requests per minute for auth)
    const rateLimitResult = await rateLimiters.auth(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
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
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = await createServerSupabaseClient();

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      logger.warn('Login failed', { error: authError.message });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      );
    }

    // Ensure user profile exists in public.users table
    // This is a safety net for users who signed up before the profile creation fix
    // or for users created via OAuth/social login
    const profileResult = await ensureUserProfileExists({
      userId: authData.user.id,
      email: authData.user.email!,
      fullName: authData.user.user_metadata?.full_name || null,
      phone: authData.user.user_metadata?.phone || null,
    });

    if (!profileResult.success) {
      logger.error('Failed to ensure user profile exists during login', {
        userId: authData.user.id,
        error: profileResult.error,
      });
      // Don't fail login - the profile might be created later
    } else if (profileResult.created) {
      logger.info('User profile created during login (was missing)', {
        userId: authData.user.id,
      });
    }

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        updated_at: new Date().toISOString(),
      })
      .eq('id', authData.user.id);

    if (updateError) {
      logger.warn('Failed to update last login', { error: updateError.message });
      // Don't fail - login successful
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      logger.warn('Failed to fetch profile', { error: profileError.message });
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: (profile as any)?.full_name || null,
          phone: (profile as any)?.phone || null,
          hmo_pro_active: (profile as any)?.hmo_pro_active || false,
        },
        session: authData.session,
      },
      { status: 200 }
    );
  } catch (error: any) {
    logger.error('Login error', { error: error?.message });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
