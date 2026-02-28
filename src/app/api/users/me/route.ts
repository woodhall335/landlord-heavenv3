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
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { ensureUserProfileExistsFromAuth } from '@/lib/supabase/ensure-user';
import { isAdmin as checkIsAdmin } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { z } from 'zod';

// Safe fields to return from user profile (prevent leaking sensitive data)
const SAFE_USER_FIELDS = [
  'id',
  'email',
  'full_name',
  'phone',
  'subscription_tier',
  'subscription_status',
  'trial_ends_at',
  'created_at',
] as const;

/**
 * Build safe user response object from profile data
 */
function buildUserResponse(profile: Record<string, unknown>, isAdmin: boolean) {
  return {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    phone: profile.phone,
    subscription_tier: profile.subscription_tier,
    subscription_status: profile.subscription_status,
    trial_ends_at: profile.trial_ends_at,
    created_at: profile.created_at,
    is_admin: isAdmin,
  };
}

// Get current user profile
export async function GET() {
  try {
    const user = await requireServerAuth();

    // Step 1: Ensure user profile exists in public.users (auto-create if missing)
    const ensureResult = await ensureUserProfileExistsFromAuth(user.id);

    if (!ensureResult.success) {
      logger.error('[API /api/users/me GET] Failed to ensure user profile', {
        userId: user.id,
        error: ensureResult.error,
      });
      return NextResponse.json(
        { error: 'Failed to initialize user profile. Please try again or contact support.' },
        { status: 500 }
      );
    }

    if (ensureResult.created) {
      logger.info('[API /api/users/me GET] Auto-created missing user profile', {
        userId: user.id,
      });
    }

    const supabase = await createClient();

    // Step 2: Get full user profile from database (using user client with RLS)
    const { data: profile, error } = await supabase
      .from('users')
      .select(SAFE_USER_FIELDS.join(','))
      .eq('id', user.id)
      .single();

    if (error) {
      // Log structured error (without leaking secrets)
      logger.warn('[API /api/users/me GET] User client select failed, attempting admin fallback', {
        userId: user.id,
        errorCode: error.code,
        errorMessage: error.message,
        errorHint: error.hint,
      });

      // Step 3: Fallback to admin client if RLS prevents access
      try {
        const adminClient = createSupabaseAdminClient();

        const { data: adminProfile, error: adminError } = await adminClient
          .from('users')
          .select(SAFE_USER_FIELDS.join(','))
          .eq('id', user.id)  // Still filtered to authenticated user's ID
          .single();

        if (adminError) {
          logger.error('[API /api/users/me GET] Admin fallback also failed', {
            userId: user.id,
            errorCode: adminError.code,
            errorMessage: adminError.message,
          });
          return NextResponse.json(
            { error: 'Failed to fetch user profile. Please try again or contact support.' },
            { status: 500 }
          );
        }

        // Check if user is admin using centralized helper
        const isAdmin = checkIsAdmin(user.id);

        logger.info('[API /api/users/me GET] Successfully fetched profile via admin fallback', {
          userId: user.id,
        });

        return NextResponse.json({
          user: buildUserResponse(adminProfile as unknown as Record<string, unknown>, isAdmin),
        });
      } catch (adminClientError: unknown) {
        const errorMessage = adminClientError instanceof Error
          ? adminClientError.message
          : 'Unknown admin client error';

        logger.error('[API /api/users/me GET] Admin client creation failed', {
          userId: user.id,
          error: errorMessage,
        });
        return NextResponse.json(
          { error: 'Failed to fetch user profile due to server configuration issue.' },
          { status: 500 }
        );
      }
    }

    // Check if user is admin using centralized helper (handles whitespace trimming)
    const isAdmin = checkIsAdmin(user.id);

    return NextResponse.json({
      user: buildUserResponse(profile as unknown as Record<string, unknown>, isAdmin),
    });
  } catch (error: any) {
    // Handle auth errors (requireServerAuth throws 'Unauthorized - Please log in')
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('not authenticated')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.error('[API /api/users/me GET] Unexpected error', {
      errorMessage: error?.message,
      errorName: error?.name,
    });
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
