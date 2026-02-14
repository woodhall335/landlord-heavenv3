/**
 * Auth Guard: Require Case Ownership
 *
 * Verifies that a case belongs to the specified user.
 * Throws 403 if not the owner, 404 if case not found.
 */

import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface RequireCaseOwnerInput {
  caseId: string;
  userId: string;
}

export interface RequireCaseOwnerResult {
  caseId: string;
  userId: string;
  isAnonymousCase: boolean;
}

/**
 * Verify that a case belongs to the specified user.
 *
 * Rules:
 * - Case must exist
 * - Case must belong to user (user_id matches) OR be anonymous (user_id is null)
 *
 * @param input - Case ID and User ID to verify
 * @returns The case/user IDs and whether it's anonymous
 * @throws NextResponse with 403 if not owner, 404 if case not found
 *
 * @example
 * export async function POST(request: Request) {
 *   const { user } = await requireUser();
 *   await requireCaseOwner({ caseId: 'xxx', userId: user.id });
 *   // ... user is verified as case owner
 * }
 */
export async function requireCaseOwner(
  input: RequireCaseOwnerInput
): Promise<RequireCaseOwnerResult> {
  const { caseId, userId } = input;

  const adminClient = createSupabaseAdminClient();

  const { data: caseData, error } = await adminClient
    .from('cases')
    .select('id, user_id')
    .eq('id', caseId)
    .single();

  if (error || !caseData) {
    throw NextResponse.json(
      {
        error: 'NOT_FOUND',
        code: 'CASE_NOT_FOUND',
        message: 'Case not found.',
      },
      { status: 404 }
    );
  }

  const isAnonymousCase = caseData.user_id === null;
  const isOwner = caseData.user_id === userId;

  // Allow access if:
  // 1. User owns the case (user_id matches)
  // 2. Case is anonymous (user_id is null) - BUT only for read operations
  //    For mutations, we should still verify ownership after the case is claimed
  if (!isOwner && !isAnonymousCase) {
    throw NextResponse.json(
      {
        error: 'FORBIDDEN',
        code: 'NOT_CASE_OWNER',
        message: 'You do not have permission to access this case.',
      },
      { status: 403 }
    );
  }

  return {
    caseId,
    userId,
    isAnonymousCase,
  };
}

/**
 * Check case ownership without throwing.
 * Returns ownership status for conditional logic.
 */
export async function checkCaseOwnership(
  input: RequireCaseOwnerInput
): Promise<{
  exists: boolean;
  isOwner: boolean;
  isAnonymousCase: boolean;
  caseUserId: string | null;
}> {
  const { caseId, userId } = input;

  const adminClient = createSupabaseAdminClient();

  const { data: caseData, error } = await adminClient
    .from('cases')
    .select('id, user_id')
    .eq('id', caseId)
    .single();

  if (error || !caseData) {
    return {
      exists: false,
      isOwner: false,
      isAnonymousCase: false,
      caseUserId: null,
    };
  }

  return {
    exists: true,
    isOwner: caseData.user_id === userId,
    isAnonymousCase: caseData.user_id === null,
    caseUserId: caseData.user_id,
  };
}
