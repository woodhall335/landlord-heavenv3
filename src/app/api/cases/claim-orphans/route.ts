/**
 * Claim Orphan Cases API
 *
 * POST /api/cases/claim-orphans
 * Links any anonymous cases to the authenticated user.
 *
 * This endpoint searches for anonymous cases (user_id = NULL) where:
 * 1. The case_id was stored in localStorage during signup/login flow
 * 2. The collected_facts contains the user's email (landlord_email field)
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const claimOrphansSchema = z.object({
  case_ids: z.array(z.string().uuid()).optional(),
});

export async function POST(request: Request) {
  try {
    const user = await getServerUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const validation = claimOrphansSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { case_ids } = validation.data;
    const supabase = await createServerSupabaseClient();
    const claimedCases: string[] = [];
    const errors: string[] = [];

    // 1. If specific case_ids are provided, try to claim those
    if (case_ids && case_ids.length > 0) {
      for (const caseId of case_ids) {
        const { data: caseData, error: fetchError } = await supabase
          .from('cases')
          .select('id, user_id')
          .eq('id', caseId)
          .single();

        if (fetchError || !caseData) {
          errors.push(`Case ${caseId} not found`);
          continue;
        }

        // Only claim if it's anonymous (no user_id)
        if (caseData.user_id === null) {
          const { error: updateError } = await supabase
            .from('cases')
            .update({
              user_id: user.id,
              anonymous_user_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', caseId);

          if (updateError) {
            errors.push(`Failed to claim case ${caseId}`);
          } else {
            claimedCases.push(caseId);
          }
        }
      }
    }

    // 2. Search for anonymous cases where landlord_email matches user's email
    if (user.email) {
      // Search in collected_facts JSONB for landlord_email or contact_email
      const { data: emailMatches } = await supabase
        .from('cases')
        .select('id')
        .is('user_id', null)
        .or(`collected_facts->landlord_email.eq."${user.email}",collected_facts->contact_email.eq."${user.email}"`)
        .limit(10);

      if (emailMatches && emailMatches.length > 0) {
        for (const match of emailMatches) {
          // Skip if already claimed
          if (claimedCases.includes(match.id)) continue;

          const { error: updateError } = await supabase
            .from('cases')
            .update({
              user_id: user.id,
              anonymous_user_id: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', match.id);

          if (!updateError) {
            claimedCases.push(match.id);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      claimed_cases: claimedCases,
      claimed_count: claimedCases.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Claim orphans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
