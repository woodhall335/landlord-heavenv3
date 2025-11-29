/**
 * Auth API - User Profile
 *
 * GET /api/auth/user - Get current user profile
 * PUT /api/auth/user - Update current user profile
 */

import { createServerSupabaseClient, requireServerAuth } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * GET - Fetch current user profile
 */
export async function GET(_request: Request) {
  try {
    const user = await requireServerAuth();
    const supabase = await createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch profile:', error);
      return NextResponse.json(
        { error: 'Failed to fetch profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: profile,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Validation schema for profile updates
const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
});

/**
 * PUT - Update current user profile
 */
export async function PUT(request: Request) {
  try {
    const user = await requireServerAuth();
    const body = await request.json();

    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const updates = validationResult.data;
    const supabase = await createServerSupabaseClient();

    const { data: profile, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update profile:', error);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: profile,
        message: 'Profile updated successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.message === 'Unauthorized - Please log in') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
