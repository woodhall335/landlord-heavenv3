/**
 * Auth API - Signup
 *
 * POST /api/auth/signup
 * Creates a new user account with Supabase Auth
 */

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(2, 'Full name is required').optional(),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
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
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error('Signup auth error:', authError);
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

    // Create user profile in public.users table
    const { error: profileError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: full_name || null,
      phone: phone || null,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail - auth user created successfully
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
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
