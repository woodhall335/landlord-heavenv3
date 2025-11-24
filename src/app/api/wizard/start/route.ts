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
import type { ProductType } from '@/lib/wizard/types';

// Validation schema
const startWizardSchema = z.object({
  case_type: z.enum(['eviction', 'money_claim', 'tenancy_agreement']),
  jurisdiction: z.enum(['england-wales', 'scotland', 'northern-ireland']),
  product: z.enum(['notice_only', 'complete_pack', 'money_claim', 'tenancy_agreement']).optional(),
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

    const { case_type, jurisdiction, product } = validationResult.data;

    if (jurisdiction === 'northern-ireland' && case_type !== 'tenancy_agreement') {
      return NextResponse.json(
        {
          error: 'Eviction and money claim workflows are not supported in Northern Ireland',
        },
        { status: 400 }
      );
    }

    if (case_type === 'money_claim' && jurisdiction === 'northern-ireland') {
      return NextResponse.json(
        {
          error: 'Money claim workflows are not available in Northern Ireland.',
        },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Initialize collected_facts with __meta containing product information
    const collected_facts: any = {
      __meta: {
        product: product || null,
        mqs_version: null, // Will be set when MQS is loaded
        question_set_id: null,
      },
    };

    // Create new case (user_id can be null for anonymous users)
    const { data: newCase, error: caseError } = await supabase
      .from('cases')
      .insert({
        user_id: user?.id || null,
        case_type,
        jurisdiction,
        status: 'in_progress',
        wizard_progress: 0,
        collected_facts,
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
