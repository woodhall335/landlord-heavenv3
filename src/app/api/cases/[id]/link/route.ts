/**
 * Link Case to User API
 *
 * POST /api/cases/[id]/link
 * Links an anonymous case to authenticated user
 *
 * Security:
 * - Only allows linking anonymous cases (user_id IS NULL)
 * - Or cases already owned by the current user (no-op, returns success)
 * - Does NOT allow claiming another user's case
 */

import { createAdminClient, getServerUser } from '@/lib/supabase/server';
import { ensureUserProfileExists } from '@/lib/supabase/ensure-user';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getServerUser();
    const { id: caseId } = await params;

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Use admin client to bypass RLS - we do our own access control
    const adminSupabase = createAdminClient();

    // First, ensure user profile exists (required for foreign key)
    const profileResult = await ensureUserProfileExists({
      userId: user.id,
      email: user.email!,
      fullName: user.user_metadata?.full_name || null,
      phone: user.user_metadata?.phone || null,
    });

    if (!profileResult.success) {
      logger.error('Failed to ensure user profile exists during case linking', {
        userId: user.id,
        caseId,
        error: profileResult.error,
      });
      return NextResponse.json(
        { error: 'Failed to prepare user profile. Please try again.' },
        { status: 500 }
      );
    }

    // Fetch the case using admin client
    const { data: caseData, error: fetchError } = await adminSupabase
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .single();

    if (fetchError || !caseData) {
      logger.warn('Case not found for linking', { caseId, error: fetchError?.message });
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Type assertion for the case record
    const caseRecord = caseData as {
      id: string;
      user_id: string | null;
    };

    // Security check: Only allow linking anonymous cases or already-owned cases
    if (caseRecord.user_id !== null && caseRecord.user_id !== user.id) {
      logger.warn('Attempted to claim another user\'s case', {
        caseId,
        requestingUserId: user.id,
        caseOwnerId: caseRecord.user_id,
      });
      return NextResponse.json(
        { error: 'Case not found' }, // Intentionally vague for security
        { status: 404 }
      );
    }

    // If already owned by this user, return success (idempotent)
    if (caseRecord.user_id === user.id) {
      logger.debug('Case already linked to user', { caseId, userId: user.id });
      return NextResponse.json(
        {
          success: true,
          case: { id: caseId },
          message: 'Case is already linked to your account',
          already_linked: true,
        },
        { status: 200 }
      );
    }

    // Link case to user using admin client (bypasses RLS)
    const { data: linkedCase, error: updateError } = await adminSupabase
      .from('cases')
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (updateError) {
      logger.error('Failed to link case to user', {
        caseId,
        userId: user.id,
        error: updateError.message,
      });
      return NextResponse.json(
        { error: 'Failed to link case to user' },
        { status: 500 }
      );
    }

    // Also update any documents associated with this case to link to the user
    const { error: docsUpdateError, count: docsUpdated } = await adminSupabase
      .from('documents')
      .update({
        user_id: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('case_id', caseId)
      .is('user_id', null); // Only update documents that are still anonymous

    if (docsUpdateError) {
      // Log but don't fail - documents can be linked later
      logger.warn('Failed to link documents to user', {
        caseId,
        userId: user.id,
        error: docsUpdateError.message,
      });
    } else {
      logger.info('Documents linked to user', {
        caseId,
        userId: user.id,
        documentsUpdated: docsUpdated,
      });
    }

    logger.info('Case successfully linked to user', {
      caseId,
      userId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        case: linkedCase,
        message: 'Case successfully linked to your account',
        documents_linked: docsUpdated || 0,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Link case error', { error: errorMessage });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
