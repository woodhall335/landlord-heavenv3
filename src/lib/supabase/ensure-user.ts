/**
 * Ensure User Profile Exists
 *
 * Creates a user profile in public.users if it doesn't exist.
 * Uses service role to bypass RLS policies.
 *
 * This is critical because:
 * 1. Supabase Auth creates user in auth.users but not public.users
 * 2. RLS policy requires auth.uid() = id for insert, which may fail during signup
 * 3. Foreign key constraints on orders table require user to exist in public.users
 */

import 'server-only';

import { createSupabaseAdminClient } from './admin';
import { logger } from '@/lib/logger';

interface EnsureUserOptions {
  userId: string;
  email: string;
  fullName?: string | null;
  phone?: string | null;
}

interface EnsureUserResult {
  success: boolean;
  created: boolean;
  error?: string;
}

/**
 * Ensures a user profile exists in public.users table.
 *
 * - Checks if user exists
 * - If not, creates using service role (bypasses RLS)
 * - Never throws for already-existing row
 * - Safe to call multiple times
 *
 * @param options - User details to ensure exist
 * @returns Result indicating success and whether user was created
 */
export async function ensureUserProfileExists(
  options: EnsureUserOptions
): Promise<EnsureUserResult> {
  const { userId, email, fullName, phone } = options;

  try {
    const adminClient = createSupabaseAdminClient();

    // First check if user already exists
    const { data: existingUser, error: selectError } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      logger.error('Error checking user existence', {
        userId,
        error: selectError.message,
      });
      return {
        success: false,
        created: false,
        error: `Failed to check user existence: ${selectError.message}`,
      };
    }

    // User already exists - success, not created
    if (existingUser) {
      logger.debug('User profile already exists', { userId });
      return {
        success: true,
        created: false,
      };
    }

    // User doesn't exist - create using service role
    const { error: insertError } = await adminClient.from('users').insert({
      id: userId,
      email,
      full_name: fullName || null,
      phone: phone || null,
    });

    if (insertError) {
      // Handle race condition - another process might have created the user
      if (
        insertError.code === '23505' || // Unique violation
        insertError.message.includes('duplicate key')
      ) {
        logger.debug('User profile created by concurrent process', { userId });
        return {
          success: true,
          created: false,
        };
      }

      logger.error('Failed to create user profile', {
        userId,
        error: insertError.message,
        code: insertError.code,
      });
      return {
        success: false,
        created: false,
        error: `Failed to create user profile: ${insertError.message}`,
      };
    }

    logger.info('User profile created successfully', { userId, email });
    return {
      success: true,
      created: true,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error in ensureUserProfileExists', {
      userId,
      error: errorMessage,
    });
    return {
      success: false,
      created: false,
      error: errorMessage,
    };
  }
}

/**
 * Ensures user profile exists for an authenticated user.
 * Fetches user details from auth.users if needed.
 *
 * @param userId - The auth.users.id
 * @returns Result indicating success and whether user was created
 */
export async function ensureUserProfileExistsFromAuth(
  userId: string
): Promise<EnsureUserResult> {
  try {
    const adminClient = createSupabaseAdminClient();

    // First check if user already exists in public.users
    const { data: existingUser, error: selectError } = await adminClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (selectError) {
      logger.error('Error checking user existence', {
        userId,
        error: selectError.message,
      });
      return {
        success: false,
        created: false,
        error: `Failed to check user existence: ${selectError.message}`,
      };
    }

    // User already exists
    if (existingUser) {
      return { success: true, created: false };
    }

    // Need to fetch from auth.users
    const {
      data: { user: authUser },
      error: authError,
    } = await adminClient.auth.admin.getUserById(userId);

    if (authError || !authUser) {
      logger.error('Failed to fetch auth user', {
        userId,
        error: authError?.message,
      });
      return {
        success: false,
        created: false,
        error: `User not found in auth.users: ${authError?.message || 'Unknown'}`,
      };
    }

    // Create user profile
    return ensureUserProfileExists({
      userId: authUser.id,
      email: authUser.email!,
      fullName: authUser.user_metadata?.full_name || null,
      phone: authUser.user_metadata?.phone || null,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    logger.error('Unexpected error in ensureUserProfileExistsFromAuth', {
      userId,
      error: errorMessage,
    });
    return {
      success: false,
      created: false,
      error: errorMessage,
    };
  }
}
