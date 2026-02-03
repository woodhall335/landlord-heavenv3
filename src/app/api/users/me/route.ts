/**
 * User Profile API - Get/Update/Delete Current User
 *
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update user profile
 * DELETE /api/users/me - Delete user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireServerAuth } from '@/lib/supabase/server-auth';
import { createClient } from '@/lib/supabase/server';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { z } from 'zod';

// Get current user profile
export async function GET() {
  try {
    const user = await requireServerAuth();

    const supabase = await createClient();

    // Get full user profile from database
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      );
    }

    // Check if user is admin using centralized helper (handles whitespace trimming)
    const isAdmin = checkIsAdmin(user.id);

    return NextResponse.json({
      user: {
        id: (profile as any).id,
        email: (profile as any).email,
        full_name: (profile as any).full_name,
        phone: (profile as any).phone,
        subscription_tier: (profile as any).subscription_tier,
        subscription_status: (profile as any).subscription_status,
        trial_ends_at: (profile as any).trial_ends_at,
        created_at: (profile as any).created_at,
        is_admin: isAdmin,
      },
    });
  } catch (error: any) {
    // Handle auth errors (requireServerAuth throws 'Unauthorized - Please log in')
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[API /api/users/me GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireServerAuth();

    const UpdateProfileSchema = z.object({
      full_name: z.string().optional(),
      phone: z.string().optional(),
    });

    const body = await request.json();
    const validationResult = UpdateProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        full_name: validationResult.data.full_name,
        phone: validationResult.data.phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user: {
        id: (updatedUser as any).id,
        email: (updatedUser as any).email,
        full_name: (updatedUser as any).full_name,
        phone: (updatedUser as any).phone,
      },
    });
  } catch (error: any) {
    // Handle auth errors (requireServerAuth throws 'Unauthorized - Please log in')
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[API /api/users/me PUT] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user account (soft delete)
export async function DELETE() {
  try {
    const user = await requireServerAuth();

    const supabase = await createClient();

    // Soft delete: mark account as deleted
    const { error } = await supabase
      .from('users')
      .update({
        deleted_at: new Date().toISOString(),
        email: `deleted_${user.id}@deleted.com`, // Anonymize email
      })
      .eq('id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      );
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id);

    if (authError) {
      console.error('Failed to delete auth user:', authError);
    }

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error: any) {
    // Handle auth errors (requireServerAuth throws 'Unauthorized - Please log in')
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.error('[API /api/users/me DELETE] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
