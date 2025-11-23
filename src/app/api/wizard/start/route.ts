/**
 * Wizard API - Start
 *
 * POST /api/wizard/start
 * Creates a new case and initiates the wizard flow
 * ALLOWS ANONYMOUS ACCESS - Users can try wizard before signing up
 */

import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema
const startWizardSchema = z.object({
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
});

export async function POST(request: Request) {
  try {
    // Get user if logged in (but don't require it)
    const user = await getServerUser();
    const body = await request.json();

    // Validate input
    const validationResult = startWizardSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { case_type, jurisdiction } = validationResult.data;

    if (jurisdiction === 'northern-ireland' && case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          error: 'Eviction and money claim workflows are not supported in Northern Ireland',
        },
        { status: 400 }
      );
    }

    if (case_type === 'money_claim' && jurisdiction !== 'england-wales') {
      return NextResponse.json(
        {
          error: 'Money claim workflows are only available in England & Wales. Scotland version is coming soon.',
        },
        { status: 400 }
      );
    }
    const supabase = await createServerSupabaseClient();

    // Create new case (user_id can be null for anonymous users)
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user?.id || null,
        case_type,
        jurisdiction,
        status: 'in_progress',
        wizard_progress: 0,
        collected_facts: {},
      })
      .select()
      .single();

    if (caseError) {
      console.error('Failed to create case:', caseError);
      return NextResponse.json(
        { error: 'Failed to create case' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        case: newCase,
        message: 'Case created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Start wizard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
